import { db } from "../../db";
import { bookings, shifts, massageTypes, resources } from "@glvt/db";
import { eq, and, gte, lte } from "drizzle-orm";
import { MassageType, MassageDurations, MassageBookingRequest, AvailabilitySlot, BookingResponse, VenueType } from "./types";

const MASSAGE_VENUE_ID = 5; // No.1 Wellness venue ID

export class MassageBookingService {

    /**
     * Get available time slots for a given date and massage type
     */
    async getAvailability(dateStr: string, massageType: MassageType | '60' | '90'): Promise<AvailabilitySlot[]> {
        const normalizedType = this.normalizeMassageType(massageType);
        const duration = MassageDurations[normalizedType];

        const dayStart = new Date(dateStr);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dateStr);
        dayEnd.setHours(23, 59, 59, 999);

        // 1. Get therapist shifts
        const activeShifts = await db.select()
            .from(shifts)
            .where(and(
                eq(shifts.venueId, MASSAGE_VENUE_ID),
                eq(shifts.status, 'scheduled'),
                gte(shifts.startTime, dayStart),
                lte(shifts.endTime, dayEnd)
            ));

        // 2. Get open rooms
        const allRooms = await db.select()
            .from(resources)
            .where(and(
                eq(resources.venueId, MASSAGE_VENUE_ID),
                eq(resources.status, 'open')
            ));

        // 3. Get confirmed bookings (Drizzle now handles Date comparison natively)
        const existingBookings = await db.select()
            .from(bookings)
            .where(and(
                eq(bookings.venueId, MASSAGE_VENUE_ID),
                eq(bookings.status, 'confirmed'),
                gte(bookings.startTime, dayStart),
                lte(bookings.startTime, dayEnd)
            ));

        if (activeShifts.length === 0 || allRooms.length === 0) return [];

        const slots: AvailabilitySlot[] = [];
        const interval = 30; // 30 min intervals

        const isBusy = (busyPeriods: { start: Date, duration: number }[], slotStart: Date, slotEnd: Date) => {
            return busyPeriods.some(b => {
                const bEnd = new Date(b.start.getTime() + b.duration * 60000);
                return (slotStart < bEnd && slotEnd > b.start);
            });
        };

        const staffBusyPeriods: Record<number, { start: Date, duration: number }[]> = {};
        const roomBusyPeriods: Record<string, { start: Date, duration: number }[]> = {};

        existingBookings.forEach(b => {
            // b.startTime is now a Date object because of mode: 'date'
            const bStart = b.startTime as Date;
            if (b.staffId) {
                if (!staffBusyPeriods[b.staffId]) staffBusyPeriods[b.staffId] = [];
                staffBusyPeriods[b.staffId].push({ start: bStart, duration: b.durationMinutes });
            }
            if (b.roomNumber) {
                if (!roomBusyPeriods[b.roomNumber]) roomBusyPeriods[b.roomNumber] = [];
                roomBusyPeriods[b.roomNumber].push({ start: bStart, duration: b.durationMinutes });
            }
        });

        const earliestShift = new Date(Math.min(...activeShifts.map(s => s.startTime.getTime())));
        const latestShift = new Date(Math.max(...activeShifts.map(s => s.endTime.getTime())));

        let currentTime = new Date(earliestShift);
        currentTime.setMinutes(currentTime.getMinutes() >= 30 ? 30 : 0, 0, 0);

        while (currentTime.getTime() + duration * 60000 <= latestShift.getTime()) {
            const slotStart = new Date(currentTime);
            const slotEnd = new Date(currentTime.getTime() + duration * 60000);

            const availableStaffIds = activeShifts.filter(shift => {
                if (!shift.staffId) return false;
                const shiftStart = new Date(shift.startTime);
                const shiftEnd = new Date(shift.endTime);

                if (slotStart < shiftStart || slotEnd > shiftEnd) return false;
                return !isBusy(staffBusyPeriods[shift.staffId] || [], slotStart, slotEnd);
            }).map(s => s.staffId as number);

            const availableRooms = allRooms.filter(room => {
                return !isBusy(roomBusyPeriods[room.name] || [], slotStart, slotEnd);
            });

            if (availableStaffIds.length > 0 && availableRooms.length > 0) {
                slots.push({
                    time: slotStart.toISOString(),
                    staffIds: availableStaffIds
                });
            }

            currentTime = new Date(currentTime.getTime() + interval * 60000);
        }

        return slots.sort((a, b) => a.time.localeCompare(b.time));
    }

    async createBooking(data: MassageBookingRequest): Promise<BookingResponse> {
        const massageType = this.normalizeMassageType(data.massageType);
        const duration = MassageDurations[massageType];

        const startTime = new Date(`${data.date}T${data.time}:00`);
        const endTime = new Date(startTime.getTime() + duration * 60000);

        const slots = await this.getAvailability(data.date, massageType);
        const availableSlot = slots.find(s => {
            const slotTime = new Date(s.time);
            return slotTime.getTime() === startTime.getTime();
        });

        if (!availableSlot || availableSlot.staffIds.length === 0) {
            return { success: false, error: "No therapist or room available at this time" };
        }

        const allRooms = await db.select()
            .from(resources)
            .where(and(eq(resources.venueId, MASSAGE_VENUE_ID), eq(resources.status, 'open')));

        const dayBookings = await db.select()
            .from(bookings)
            .where(and(
                eq(bookings.venueId, MASSAGE_VENUE_ID),
                eq(bookings.status, 'confirmed'),
                gte(bookings.startTime, new Date(startTime.getTime() - 24 * 3600 * 1000)),
                lte(bookings.startTime, new Date(startTime.getTime() + 24 * 3600 * 1000))
            ));

        const availableRoom = allRooms.find(room => {
            const roomBookings = dayBookings.filter(b => b.roomNumber === room.name);
            return !roomBookings.some(b => {
                const bStart = b.startTime as Date;
                const bEnd = new Date(bStart.getTime() + b.durationMinutes * 60000);
                return (startTime < bEnd && endTime > bStart);
            });
        });

        if (!availableRoom) {
            return { success: false, error: "No room available at this time" };
        }

        const staffId = data.staffId || availableSlot.staffIds[0];

        try {
            const [newBooking] = await db.insert(bookings).values({
                customerName: data.customerName,
                customerEmail: `${data.customerWhatsapp}@whatsapp.local`,
                customerWhatsapp: data.customerWhatsapp,
                serviceType: 'massage',
                startTime, // Passing Date object directly
                durationMinutes: duration,
                staffId,
                status: 'confirmed',
                venueId: MASSAGE_VENUE_ID,
                bookingType: VenueType.MASSAGE,
                massageTypeId: massageType,
                roomNumber: availableRoom.name,
                resourceId: availableRoom.id,
            } as any).returning();

            return {
                success: true,
                bookingId: `MASSAGE_${String(newBooking.id).padStart(4, '0')}`,
                message: `Booking created in ${availableRoom.name} with staff ${staffId}`
            } as any;
        } catch (error) {
            console.error("Failed to insert booking:", error);
            return { success: false, error: "Database error during booking creation" };
        }
    }

    private normalizeMassageType(type: MassageType | '60' | '90' | string): MassageType {
        if (type === '60' || type === 'massage_60') return MassageType.SIXTY_MIN;
        if (type === '90' || type === 'massage_90') return MassageType.NINETY_MIN;
        throw new Error(`Invalid massage type: ${type}`);
    }
}

export const massageBookingService = new MassageBookingService();
