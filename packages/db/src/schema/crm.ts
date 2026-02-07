import { pgTable, serial, text, boolean, timestamp, foreignKey, unique, integer, numeric } from "drizzle-orm/pg-core"
import { users, venues } from "./core";

// Maps to sch_members
export const members = pgTable("sch_members", {
    id: serial().primaryKey().notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text().notNull(),
    phone: text(),
    birthday: timestamp({ mode: 'string' }),
    photoUrl: text("photo_url"),
    gender: text(),
    weightKg: text("weight_kg"), // Legacy is text? My new schema wanted numeric. I'll stick to legacy/text or alter it? I'll keep text for safety.
    joinDate: timestamp("join_date", { mode: 'string' }).defaultNow(),
    emergencyContactName: text("emergency_contact_name"),
    emergencyContactPhone: text("emergency_contact_phone"),
    userId: integer("user_id").references(() => users.id),
    heightCm: text("height_cm"),
    waiverSigned: boolean("waiver_signed").default(false).notNull(),
    waiverSignedDate: timestamp("waiver_signed_date", { mode: 'string' }),
    venueId: integer("venue_id").references(() => venues.id),

    // My new columns
    notes: text("notes"),
});

// Maps to sch_mp_membership_types
export const membershipTypes = pgTable("sch_mp_membership_types", {
    id: serial().primaryKey().notNull(),
    name: text().notNull(),
    cnName: text("cn_name"),
    durationDays: integer("duration_days").default(30).notNull(),
    vouchers: integer().default(0).notNull(),
    bookingsPerDay: integer("bookings_per_day").default(1).notNull(),
    isTrial: boolean("is_trial").default(false).notNull(),
    isLimited: boolean("is_limited").default(false).notNull(),
    isClassPack: boolean("is_class_pack").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    priceCents: integer("price_cents").default(0).notNull(),
    accessFacilities: boolean("access_facilities").default(false).notNull(),
    drinksDiscountPct: integer("drinks_discount_pct").default(0).notNull(),
    perks: text(),
    createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),

    // My new columns
    description: text("description"),
    credits: integer("credits"),
    isRecurring: boolean("is_recurring").default(false),
});

// Maps to sch_memberships
export const memberships = pgTable("sch_memberships", {
    id: serial().primaryKey().notNull(),
    memberId: integer("member_id").notNull().references(() => members.id),
    type: text().notNull(), // Legacy stores type name directly?
    status: text().default('active').notNull(),
    startDate: timestamp("start_date", { mode: 'string' }).notNull(),
    endDate: timestamp("end_date", { mode: 'string' }),
    voucherSignedDate: timestamp("voucher_signed_date", { mode: 'string' }),
    paymentStatus: text("payment_status").default('none').notNull(),
    priceCents: integer("price_cents"),
    coupon: text(),
    vouchersRemaining: integer("vouchers_remaining"),

    // Legacy mapping
    membershipTypeId: integer("membership_type_id").references(() => membershipTypes.id),

    accessFacilities: boolean("access_facilities").default(false).notNull(),
    drinksDiscountPct: integer("drinks_discount_pct").default(0).notNull(),
    qrCode: text("qr_code"),
    paymentRaw: text("payment_raw"),
    notes: text(),
    venueId: integer("venue_id").references(() => venues.id),

    // My new columns
    remainingCredits: integer("remaining_credits"),
    paymentReference: text("payment_reference"),
    // typeId: integer("type_id"), // Use membershipTypeId
});

// Maps to sch_mp_coupons (Vouchers)
export const vouchers = pgTable("sch_mp_coupons", {
    id: serial().primaryKey().notNull(),
    code: text().notNull(),
    discountType: text("discount_type").default('fixed').notNull(),
    discountValue: integer("discount_value").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    maxUses: integer("max_uses"),
    usedCount: integer("used_count").default(0).notNull(),
    expiresAt: timestamp("expires_at", { mode: 'string' }),
    createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),

    // My new columns
    validFrom: timestamp("valid_from").defaultNow(),
});
