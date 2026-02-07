import { pgTable, text, serial, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users, venues } from "./core";

// === STAFF ===
export const staff = pgTable("sch_staff", {
    id: serial("id").primaryKey(),
    // New linkage columns (nullable for migration)
    userId: integer("user_id").references(() => users.id), // Link to Core User
    venueId: integer("venue_id").references(() => venues.id),

    // Existing columns in sch_staff
    name: text("name").notNull(),
    email: text("email"), // sch_staff has email
    role: text("role"),   // sch_staff has role

    // New Organization Columns
    title: text("title"), // 'Trainer', 'Manager'
    department: text("department"),

    // Display
    bio: text("bio"),
    color: text("color").default("#3b82f6"), // For calendar
    displayOrder: integer("display_order").default(0),

    isActive: boolean("is_active").default(true),
});

export const staffRelations = relations(staff, ({ one }) => ({
    user: one(users, {
        fields: [staff.userId],
        references: [users.id],
    }),
    venue: one(venues, {
        fields: [staff.venueId],
        references: [venues.id],
    }),
}));

// === SHIFTS ===
export const shifts = pgTable("staff_shifts", {
    id: serial("id").primaryKey(),
    staffId: integer("staff_id").references(() => staff.id),
    venueId: integer("venue_id").references(() => venues.id),

    startTime: timestamp("start_time").notNull(),
    endTime: timestamp("end_time").notNull(),

    type: text("type").default("working"), // 'working', 'on_call'
    status: text("status").default("scheduled"), // 'scheduled', 'completed', 'absent'

    notes: text("notes"),
});

// === KPIs (from Team-roles-os) ===
export const kpis = pgTable("staff_kpis", {
    id: serial("id").primaryKey(),
    staffId: integer("staff_id").references(() => staff.id),

    period: text("period"), // '2023-Q4', '2023-11'
    metricName: text("metric_name").notNull(),
    targetValue: integer("target_value"),
    actualValue: integer("actual_value"),

    status: text("status"), // 'on_track', 'at_risk', 'behind'

    measuredAt: timestamp("measured_at"),
    notes: text("notes"),
});

// === TASKS (from Team-roles-os) ===
export const tasks = pgTable("staff_tasks", {
    id: serial("id").primaryKey(),
    staffId: integer("staff_id").references(() => staff.id),
    assignedById: integer("assigned_by_id").references(() => staff.id),

    title: text("title").notNull(),
    description: text("description"),

    dueDate: timestamp("due_date"),
    completedAt: timestamp("completed_at"),
    status: text("status").default("pending"),
});
