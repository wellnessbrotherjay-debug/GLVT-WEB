import { pgTable, serial, text, boolean, timestamp, foreignKey, integer } from "drizzle-orm/pg-core"
import { bookings, schedules } from "./booking";
import { members } from "./crm";
import { staff } from "./staff";

export const schMpHrms = pgTable("sch_mp_hrms", {
    id: serial().primaryKey().notNull(),
    name: text().notNull(),
    bandId: text("band_id"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
    deviceModel: text("device_model"),
});

export const schMemberStats = pgTable("sch_member_stats", {
    id: serial().primaryKey().notNull(),
    memberId: integer("member_id").notNull().references(() => members.id),
    height: integer(),
    weight: integer(),
    weightKg: text("weight_kg"),
    bodyFatPercentage: text("body_fat_percentage"),
    recordedAt: timestamp("recorded_at", { mode: 'string' }).defaultNow(),
});

export const schMpHeartRateData = pgTable("sch_mp_heart_rate_data", {
    id: serial().primaryKey().notNull(),
    bookingId: integer("booking_id").notNull().references(() => bookings.id),
    hrmId: integer("hrm_id").references(() => schMpHrms.id),
    dataRaw: text("data_raw"),
    dataSummary: text("data_summary"),
    graphData: text("graph_data"),
    zoneGraphData: text("zone_graph_data"),
    combinedGraphData: text("combined_graph_data"),
    capturedAt: timestamp("captured_at", { mode: 'string' }).defaultNow(),
});

export const schMpSettings = pgTable("sch_mp_settings", {
    id: serial().primaryKey().notNull(),
    key: text().notNull(),
    value: text(),
    updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const schMpHrmAssignments = pgTable("sch_mp_hrm_assignments", {
    id: serial().primaryKey().notNull(),
    scheduleId: integer("schedule_id").notNull().references(() => schedules.id),
    bookingId: integer("booking_id").references(() => bookings.id),
    memberId: integer("member_id").references(() => members.id),
    hrmId: integer("hrm_id").notNull().references(() => schMpHrms.id),
    isActive: boolean("is_active").default(true).notNull(),
    assignedAt: timestamp("assigned_at", { mode: 'string' }).defaultNow(),
    releasedAt: timestamp("released_at", { mode: 'string' }),
});

export const schMpSessionQueues = pgTable("sch_mp_session_queues", {
    id: serial().primaryKey().notNull(),
    scheduleId: integer("schedule_id").notNull().references(() => schedules.id),
    memberId: integer("member_id").notNull().references(() => members.id),
    createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const schSchedules = pgTable("sch_schedules", {
    id: serial().primaryKey().notNull(),
    staffId: integer("staff_id").notNull().references(() => staff.id),
    date: text().notNull(),
    shift: text(),
    status: text().notNull(),
});
