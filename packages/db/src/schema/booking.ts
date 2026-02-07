import { pgTable, serial, text, boolean, timestamp, foreignKey, unique, integer, numeric } from "drizzle-orm/pg-core"
import { users, venues } from "./core";
import { staff } from "./staff";
import { members, memberships } from "./crm";

// Maps to sch_class_definitions
export const classes = pgTable("sch_class_definitions", {
    id: serial().primaryKey().notNull(),
    name: text().notNull(),
    description: text(),
    serviceType: text("service_type").notNull(),
    category: text(),
    imageUrl: text("image_url"),
    mobileImageUrl: text("mobile_image_url"),
    durationMinutes: integer("duration_minutes").default(60).notNull(),
    capacity: integer().default(10).notNull(),
    venueId: integer("venue_id").references(() => venues.id),
    // My new columns (if any)
    priceCents: integer("price_cents").default(0),
    type: text("type").default("class"),
    isActive: boolean("is_active").default(true),
});

// Maps to sch_rooms (Resources)
export const resources = pgTable("sch_rooms", {
    id: serial().primaryKey().notNull(),
    name: text().notNull(),
    venueId: integer("venue_id").references(() => venues.id),
    roomType: text("room_type"),
    status: text().default('open').notNull(),
    priority: integer().default(0).notNull(),
    allocatedServiceType: text("allocated_service_type"),
    notes: text(),
    // Alias type to roomType if needed or keep both? I'll keep roomType.
    type: text("type"), // My new column
});

// Maps to sch_class_schedules
export const schedules = pgTable("sch_class_schedules", {
    id: serial().primaryKey().notNull(),
    classId: integer("class_id").notNull().references(() => classes.id),
    staffId: integer("staff_id").references(() => staff.id),
    venueId: integer("venue_id").references(() => venues.id),
    startTime: timestamp("start_time", { mode: 'string' }).notNull(),
    // endTime: timestamp("end_time"), // Legacy doesn't have endTime, I might need to compute it or add it. I'll add it nullable.
    endTime: timestamp("end_time", { mode: 'string' }),

    room: text().notNull(), // Legacy uses text for room name?
    // I want to link to resources(sch_rooms). I will add resourceId.
    resourceId: integer("resource_id").references(() => resources.id),

    capacity: integer().notNull(),
    enforceCancellationPolicy: boolean("enforce_cancellation_policy").default(false).notNull(),
    lateCancelMinutes: integer("late_cancel_minutes").default(720).notNull(),
    lateBookingMinutes: integer("late_booking_minutes").default(0).notNull(),
    currentBlock: text("current_block"),
    cancelled: boolean().default(false).notNull(), // Legacy name 'cancelled'
    isCancelled: boolean("is_cancelled").default(false), // My name. Use legacy 'cancelled' if possible or map?
    note: text(),
});

// Maps to sch_bookings
export const bookings = pgTable("sch_bookings", {
    id: serial().primaryKey().notNull(),
    customerName: text("customer_name").notNull(),
    customerEmail: text("customer_email").notNull(),
    customerWhatsapp: text("customer_whatsapp"),
    memberId: integer("member_id").references(() => members.id),
    serviceType: text("service_type").notNull(),
    startTime: timestamp("start_time").notNull(),
    durationMinutes: integer("duration_minutes").notNull(),
    staffId: integer("staff_id").references(() => staff.id),
    status: text().default('confirmed').notNull(),
    isManualMode: boolean("is_manual_mode").default(false).notNull(),
    manualShiftStart: text("manual_shift_start"),
    manualShiftHours: integer("manual_shift_hours"),
    roomNumber: text("room_number"),
    venueId: integer("venue_id").references(() => venues.id),
    classId: integer("class_id").references(() => classes.id),
    scheduleId: integer("schedule_id").references(() => schedules.id),
    membershipId: integer("membership_id").references(() => memberships.id),
    hrmId: integer("hrm_id"), // .references(() => hrms.id),
    paymentStatus: text("payment_status").default('none').notNull(),
    priceCents: integer("price_cents"),
    coupon: text(),
    cancelledAt: timestamp("cancelled_at"),
    attendedAt: timestamp("attended_at"),
    paymentRaw: text("payment_raw"),
    paymentType: text("payment_type"),
    createdAt: timestamp("created_at").defaultNow(),

    // My new columns
    userId: integer("user_id").references(() => users.id),
    paymentMethod: text("payment_method"),
    bookedAt: timestamp("booked_at").defaultNow(),

    // Venue-specific booking fields
    bookingType: text("booking_type"),           // 'gym' | 'massage'
    massageTypeId: text("massage_type_id"),      // 'massage_60' | 'massage_90'
});
