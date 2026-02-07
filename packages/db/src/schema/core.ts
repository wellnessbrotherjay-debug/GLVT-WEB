import { pgTable, text, serial, timestamp, boolean, integer, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === ENUMS ===
export const roleEnum = pgEnum("user_role", ["user", "staff", "admin", "superadmin", "developer"]);

// === TABLES ===

// Multi-tenant organization/venue support
export const organizations = pgTable("sch_organizations", { // New table, will create
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    logoUrl: text("logo_url"),
    createdAt: timestamp("created_at").defaultNow(),
});

export const venues = pgTable("sch_venues", {
    id: serial("id").primaryKey(),
    // organizationId: integer("organization_id").references(() => organizations.id), // Disable strictly to avoid circulars/missing table for now
    name: text("name").notNull(),
    type: text("type").default("studio").notNull(), // 'hotel', 'gym', 'studio'
    venueType: text("venue_type").default("other"), // NEW: 'gym' | 'massage' | 'other'
    location: text("location"),
    timezone: text("timezone").default("Asia/Shanghai"),
    // createdAt: timestamp("created_at").defaultNow(), // Not in legacy
});

export const users = pgTable("sch_users", {
    id: serial("id").primaryKey(),
    email: text("email"), // Legacy might not be unique/present in all? Introspect said email is NOT in sch_users! Wait.
    // Introspection for sch_users: username, password, role, name. id.
    // My schema had email. I should match legacy or add it. I'll add it as nullable.

    passwordHash: text("password"), // Legacy uses 'password'
    name: text("name"),
    username: text("username").unique(), // Legacy support

    // Role-based access
    role: text("role").default("user"), // Legacy is text, not enum

    // WeChat Integration (New columns)
    wxOpenId: text("wx_open_id").unique(),
    wxUnionId: text("wx_union_id"),
    wxSessionKey: text("wx_session_key"),

    // Profile
    avatarUrl: text("avatar_url"),
    phone: text("phone"),

    // Organization Context
    defaultVenueId: integer("default_venue_id").references(() => venues.id),

    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const requestRelations = relations(users, ({ one }) => ({
    defaultVenue: one(venues, {
        fields: [users.defaultVenueId],
        references: [venues.id],
    }),
}));

// Audit Logs / System Events
export const auditLogs = pgTable("core_audit_logs", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    details: text("details"), // JSON string or text
    ipAddress: text("ip_address"),
    createdAt: timestamp("created_at").defaultNow(),
});

// === ZOD SCHEMAS ===
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createInsertSchema(users).omit({ passwordHash: true });
