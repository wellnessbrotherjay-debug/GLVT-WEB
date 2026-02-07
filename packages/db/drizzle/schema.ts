import { pgTable, serial, text, boolean, timestamp, foreignKey, unique, integer } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const schMpHrms = pgTable("sch_mp_hrms", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	bandId: text("band_id"),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	deviceModel: text("device_model"),
});

export const schMembers = pgTable("sch_members", {
	id: serial().primaryKey().notNull(),
	firstName: text("first_name").notNull(),
	lastName: text("last_name").notNull(),
	email: text().notNull(),
	phone: text(),
	birthday: timestamp({ mode: 'string' }),
	photoUrl: text("photo_url"),
	gender: text(),
	weightKg: text("weight_kg"),
	joinDate: timestamp("join_date", { mode: 'string' }).defaultNow(),
	emergencyContactName: text("emergency_contact_name"),
	emergencyContactPhone: text("emergency_contact_phone"),
	userId: integer("user_id"),
	heightCm: text("height_cm"),
	waiverSigned: boolean("waiver_signed").default(false).notNull(),
	waiverSignedDate: timestamp("waiver_signed_date", { mode: 'string' }),
	venueId: integer("venue_id"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [schUsers.id],
			name: "sch_members_user_id_sch_users_id_fk"
		}),
	foreignKey({
			columns: [table.venueId],
			foreignColumns: [schVenues.id],
			name: "sch_members_venue_id_sch_venues_id_fk"
		}),
	unique("sch_members_email_unique").on(table.email),
]);

export const schClassDefinitions = pgTable("sch_class_definitions", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	serviceType: text("service_type").notNull(),
	category: text(),
	imageUrl: text("image_url"),
	mobileImageUrl: text("mobile_image_url"),
	durationMinutes: integer("duration_minutes").default(60).notNull(),
	capacity: integer().default(10).notNull(),
	venueId: integer("venue_id"),
}, (table) => [
	foreignKey({
			columns: [table.venueId],
			foreignColumns: [schVenues.id],
			name: "sch_class_definitions_venue_id_sch_venues_id_fk"
		}),
]);

export const schClassSchedules = pgTable("sch_class_schedules", {
	id: serial().primaryKey().notNull(),
	classId: integer("class_id").notNull(),
	staffId: integer("staff_id"),
	venueId: integer("venue_id"),
	startTime: timestamp("start_time", { mode: 'string' }).notNull(),
	room: text().notNull(),
	capacity: integer().notNull(),
	enforceCancellationPolicy: boolean("enforce_cancellation_policy").default(false).notNull(),
	lateCancelMinutes: integer("late_cancel_minutes").default(720).notNull(),
	lateBookingMinutes: integer("late_booking_minutes").default(0).notNull(),
	currentBlock: text("current_block"),
	cancelled: boolean().default(false).notNull(),
	note: text(),
}, (table) => [
	foreignKey({
			columns: [table.classId],
			foreignColumns: [schClassDefinitions.id],
			name: "sch_class_schedules_class_id_sch_class_definitions_id_fk"
		}),
	foreignKey({
			columns: [table.staffId],
			foreignColumns: [schStaff.id],
			name: "sch_class_schedules_staff_id_sch_staff_id_fk"
		}),
	foreignKey({
			columns: [table.venueId],
			foreignColumns: [schVenues.id],
			name: "sch_class_schedules_venue_id_sch_venues_id_fk"
		}),
]);

export const schBookings = pgTable("sch_bookings", {
	id: serial().primaryKey().notNull(),
	customerName: text("customer_name").notNull(),
	customerEmail: text("customer_email").notNull(),
	customerWhatsapp: text("customer_whatsapp"),
	memberId: integer("member_id"),
	serviceType: text("service_type").notNull(),
	startTime: timestamp("start_time", { mode: 'string' }).notNull(),
	durationMinutes: integer("duration_minutes").notNull(),
	staffId: integer("staff_id"),
	status: text().default('confirmed').notNull(),
	isManualMode: boolean("is_manual_mode").default(false).notNull(),
	manualShiftStart: text("manual_shift_start"),
	manualShiftHours: integer("manual_shift_hours"),
	roomNumber: text("room_number"),
	venueId: integer("venue_id"),
	classId: integer("class_id"),
	scheduleId: integer("schedule_id"),
	membershipId: integer("membership_id"),
	hrmId: integer("hrm_id"),
	paymentStatus: text("payment_status").default('none').notNull(),
	priceCents: integer("price_cents"),
	coupon: text(),
	cancelledAt: timestamp("cancelled_at", { mode: 'string' }),
	attendedAt: timestamp("attended_at", { mode: 'string' }),
	paymentRaw: text("payment_raw"),
	paymentType: text("payment_type"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.memberId],
			foreignColumns: [schMembers.id],
			name: "sch_bookings_member_id_sch_members_id_fk"
		}),
	foreignKey({
			columns: [table.staffId],
			foreignColumns: [schStaff.id],
			name: "sch_bookings_staff_id_sch_staff_id_fk"
		}),
	foreignKey({
			columns: [table.venueId],
			foreignColumns: [schVenues.id],
			name: "sch_bookings_venue_id_sch_venues_id_fk"
		}),
	foreignKey({
			columns: [table.classId],
			foreignColumns: [schClassDefinitions.id],
			name: "sch_bookings_class_id_sch_class_definitions_id_fk"
		}),
	foreignKey({
			columns: [table.scheduleId],
			foreignColumns: [schClassSchedules.id],
			name: "sch_bookings_schedule_id_sch_class_schedules_id_fk"
		}),
	foreignKey({
			columns: [table.membershipId],
			foreignColumns: [schMemberships.id],
			name: "sch_bookings_membership_id_sch_memberships_id_fk"
		}),
	foreignKey({
			columns: [table.hrmId],
			foreignColumns: [schMpHrms.id],
			name: "sch_bookings_hrm_id_sch_mp_hrms_id_fk"
		}),
]);

export const schMemberStats = pgTable("sch_member_stats", {
	id: serial().primaryKey().notNull(),
	memberId: integer("member_id").notNull(),
	height: integer(),
	weight: integer(),
	weightKg: text("weight_kg"),
	bodyFatPercentage: text("body_fat_percentage"),
	recordedAt: timestamp("recorded_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.memberId],
			foreignColumns: [schMembers.id],
			name: "sch_member_stats_member_id_sch_members_id_fk"
		}),
]);

export const schMpHeartRateData = pgTable("sch_mp_heart_rate_data", {
	id: serial().primaryKey().notNull(),
	bookingId: integer("booking_id").notNull(),
	hrmId: integer("hrm_id"),
	dataRaw: text("data_raw"),
	dataSummary: text("data_summary"),
	graphData: text("graph_data"),
	zoneGraphData: text("zone_graph_data"),
	combinedGraphData: text("combined_graph_data"),
	capturedAt: timestamp("captured_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.bookingId],
			foreignColumns: [schBookings.id],
			name: "sch_mp_heart_rate_data_booking_id_sch_bookings_id_fk"
		}),
	foreignKey({
			columns: [table.hrmId],
			foreignColumns: [schMpHrms.id],
			name: "sch_mp_heart_rate_data_hrm_id_sch_mp_hrms_id_fk"
		}),
]);

export const schMpBanners = pgTable("sch_mp_banners", {
	id: serial().primaryKey().notNull(),
	title: text(),
	imageUrl: text("image_url"),
	linkUrl: text("link_url"),
	current: boolean().default(true).notNull(),
	position: integer().default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const schMpCoupons = pgTable("sch_mp_coupons", {
	id: serial().primaryKey().notNull(),
	code: text().notNull(),
	discountType: text("discount_type").default('fixed').notNull(),
	discountValue: integer("discount_value").default(0).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	maxUses: integer("max_uses"),
	usedCount: integer("used_count").default(0).notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("sch_mp_coupons_code_unique").on(table.code),
]);

export const schMpHrmAssignments = pgTable("sch_mp_hrm_assignments", {
	id: serial().primaryKey().notNull(),
	scheduleId: integer("schedule_id").notNull(),
	bookingId: integer("booking_id"),
	memberId: integer("member_id"),
	hrmId: integer("hrm_id").notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	assignedAt: timestamp("assigned_at", { mode: 'string' }).defaultNow(),
	releasedAt: timestamp("released_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.scheduleId],
			foreignColumns: [schClassSchedules.id],
			name: "sch_mp_hrm_assignments_schedule_id_sch_class_schedules_id_fk"
		}),
	foreignKey({
			columns: [table.bookingId],
			foreignColumns: [schBookings.id],
			name: "sch_mp_hrm_assignments_booking_id_sch_bookings_id_fk"
		}),
	foreignKey({
			columns: [table.memberId],
			foreignColumns: [schMembers.id],
			name: "sch_mp_hrm_assignments_member_id_sch_members_id_fk"
		}),
	foreignKey({
			columns: [table.hrmId],
			foreignColumns: [schMpHrms.id],
			name: "sch_mp_hrm_assignments_hrm_id_sch_mp_hrms_id_fk"
		}),
]);

export const schMemberships = pgTable("sch_memberships", {
	id: serial().primaryKey().notNull(),
	memberId: integer("member_id").notNull(),
	type: text().notNull(),
	status: text().default('active').notNull(),
	startDate: timestamp("start_date", { mode: 'string' }).notNull(),
	endDate: timestamp("end_date", { mode: 'string' }),
	voucherSignedDate: timestamp("voucher_signed_date", { mode: 'string' }),
	paymentStatus: text("payment_status").default('none').notNull(),
	priceCents: integer("price_cents"),
	coupon: text(),
	vouchersRemaining: integer("vouchers_remaining"),
	membershipTypeId: integer("membership_type_id"),
	accessFacilities: boolean("access_facilities").default(false).notNull(),
	drinksDiscountPct: integer("drinks_discount_pct").default(0).notNull(),
	qrCode: text("qr_code"),
	paymentRaw: text("payment_raw"),
	notes: text(),
	venueId: integer("venue_id"),
}, (table) => [
	foreignKey({
			columns: [table.memberId],
			foreignColumns: [schMembers.id],
			name: "sch_memberships_member_id_sch_members_id_fk"
		}),
	foreignKey({
			columns: [table.venueId],
			foreignColumns: [schVenues.id],
			name: "sch_memberships_venue_id_sch_venues_id_fk"
		}),
]);

export const schMpMembershipTypes = pgTable("sch_mp_membership_types", {
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
});

export const schMpSettings = pgTable("sch_mp_settings", {
	id: serial().primaryKey().notNull(),
	key: text().notNull(),
	value: text(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("sch_mp_settings_key_unique").on(table.key),
]);

export const schUsers = pgTable("sch_users", {
	id: serial().primaryKey().notNull(),
	username: text().notNull(),
	password: text().notNull(),
	role: text().default('user'),
	name: text(),
}, (table) => [
	unique("sch_users_username_unique").on(table.username),
]);

export const schMpSessionQueues = pgTable("sch_mp_session_queues", {
	id: serial().primaryKey().notNull(),
	scheduleId: integer("schedule_id").notNull(),
	memberId: integer("member_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.scheduleId],
			foreignColumns: [schClassSchedules.id],
			name: "sch_mp_session_queues_schedule_id_sch_class_schedules_id_fk"
		}),
	foreignKey({
			columns: [table.memberId],
			foreignColumns: [schMembers.id],
			name: "sch_mp_session_queues_member_id_sch_members_id_fk"
		}),
]);

export const schStaff = pgTable("sch_staff", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	role: text().notNull(),
	color: text().default('#3b82f6').notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	venueId: integer("venue_id"),
}, (table) => [
	foreignKey({
			columns: [table.venueId],
			foreignColumns: [schVenues.id],
			name: "sch_staff_venue_id_sch_venues_id_fk"
		}),
]);

export const schSchedules = pgTable("sch_schedules", {
	id: serial().primaryKey().notNull(),
	staffId: integer("staff_id").notNull(),
	date: text().notNull(),
	shift: text(),
	status: text().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.staffId],
			foreignColumns: [schStaff.id],
			name: "sch_schedules_staff_id_sch_staff_id_fk"
		}),
]);

export const schVenues = pgTable("sch_venues", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	type: text().notNull(),
	location: text(),
});

export const schRooms = pgTable("sch_rooms", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	venueId: integer("venue_id"),
	roomType: text("room_type"),
	status: text().default('open').notNull(),
	priority: integer().default(0).notNull(),
	allocatedServiceType: text("allocated_service_type"),
	notes: text(),
}, (table) => [
	foreignKey({
			columns: [table.venueId],
			foreignColumns: [schVenues.id],
			name: "sch_rooms_venue_id_sch_venues_id_fk"
		}),
]);
