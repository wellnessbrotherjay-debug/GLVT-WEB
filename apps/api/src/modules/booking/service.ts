import { db } from "../../db";
import { classes, schedules, bookings, staff, shifts } from "@glvt/db";
import { eq, and, gte, lte } from "drizzle-orm";

export class BookingService {
    async getClasses(venueId: number) {
        return await db.select().from(classes).where(eq(classes.venueId, venueId));
    }

    async getSchedules(venueId: number, from: Date, to: Date) {
        return await db.select()
            .from(schedules)
            .where(and(
                eq(schedules.venueId, venueId),
                gte(schedules.startTime, from.toISOString()),
                lte(schedules.startTime, to.toISOString())
            ));
    }

    async getAvailability(venueId: number, dateStr: string, durationMinutes: number = 60) {
        // 1. Get Shifts for the day
        const date = new Date(dateStr);
        const startOfDay = new Date(date); startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date); endOfDay.setHours(23, 59, 59, 999);

        const activeShifts = await db.select()
            .from(shifts)
            .where(and(
                eq(shifts.venueId, venueId),
                eq(shifts.status, 'scheduled'),
                gte(shifts.startTime, startOfDay),
                lte(shifts.endTime, endOfDay)
            ));

        // 2. Get Existing Bookings
        const existingBookings = await db.select()
            .from(bookings)
            .where(and(
                eq(bookings.venueId, venueId),
                eq(bookings.status, 'confirmed'),
                gte(bookings.startTime, startOfDay.toISOString()),
                lte(bookings.startTime, endOfDay.toISOString())
            ));

        // 3. Calculate Slots
        const slots: { time: string, staffIds: number[] }[] = [];
        const interval = 30; // 30 min slots

        // Map bookings by staff
        const bookingsByStaff: Record<number, typeof existingBookings> = {};
        existingBookings.forEach(b => {
            const sId = b.staffId;
            if (sId) {
                if (!bookingsByStaff[sId]) bookingsByStaff[sId] = [];
                bookingsByStaff[sId].push(b);
            }
        });

        activeShifts.forEach(shift => {
            if (!shift.staffId) return;

            let currentTime = new Date(shift.startTime);
            const shiftEnd = new Date(shift.endTime);

            while (currentTime.getTime() + durationMinutes * 60000 <= shiftEnd.getTime()) {
                const slotStart = new Date(currentTime);
                const slotEnd = new Date(currentTime.getTime() + durationMinutes * 60000);

                // Check conflicts
                const staffBookings = bookingsByStaff[shift.staffId] || [];
                const isConflict = staffBookings.some(b => {
                    const bStart = new Date(b.startTime);
                    const bEnd = new Date(bStart.getTime() + b.durationMinutes * 60000);
                    return (slotStart < bEnd && slotEnd > bStart);
                });

                if (!isConflict) {
                    const timeStr = slotStart.toISOString();
                    const existingSlot = slots.find(s => s.time === timeStr);
                    if (existingSlot) {
                        existingSlot.staffIds.push(shift.staffId);
                    } else {
                        slots.push({ time: timeStr, staffIds: [shift.staffId] });
                    }
                }

                // Increment
                currentTime = new Date(currentTime.getTime() + interval * 60000);
            }
        });

        return slots.sort((a, b) => a.time.localeCompare(b.time));
    }

    async createBooking(data: typeof bookings.$inferInsert) {
        // 1. Verify Availability
        if (data.staffId && data.startTime && data.durationMinutes) {
            const start = new Date(data.startTime as string);
            const end = new Date(start.getTime() + data.durationMinutes * 60000);

            // Check Staff Shift
            const staffShifts = await db.select()
                .from(shifts)
                .where(and(
                    eq(shifts.staffId, data.staffId),
                    lte(shifts.startTime, start),
                    gte(shifts.endTime, end)
                ))
                .limit(1);

            if (staffShifts.length === 0) {
                console.warn(`Booking blocked: Staff ${data.staffId} has no shift covering ${start.toISOString()} - ${end.toISOString()}`);
                throw new Error("Staff is not scheduled at this time.");
            }

            // Check Conflicts
            const dayStart = new Date(start); dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(start); dayEnd.setHours(23, 59, 59, 999);

            const existing = await db.select()
                .from(bookings)
                .where(and(
                    eq(bookings.staffId, data.staffId),
                    eq(bookings.status, 'confirmed'),
                    gte(bookings.startTime, dayStart.toISOString()),
                    lte(bookings.startTime, dayEnd.toISOString())
                ));

            const hasOverlap = existing.some(b => {
                const bStart = new Date(b.startTime);
                const bEnd = new Date(bStart.getTime() + b.durationMinutes * 60000);
                return (start < bEnd && end > bStart);
            });

            if (hasOverlap) {
                throw new Error("Time slot already booked.");
            }
        }

        return await db.insert(bookings).values(data as any).returning();
    }

    async cancelBooking(id: number) {
        return await db.update(bookings)
            .set({ status: "cancelled", cancelledAt: new Date().toISOString() })
            .where(eq(bookings.id, id))
            .returning();
    }
}

export const bookingService = new BookingService();
