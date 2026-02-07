import { pgTable, text, integer } from "drizzle-orm/pg-core";

// Massage Type Lookup Table - Only two types based on duration
export const massageTypes = pgTable("sch_massage_types", {
    id: text("id").primaryKey(),                    // 'massage_60', 'massage_90'
    durationMinutes: integer("duration_minutes").notNull(),
    displayName: text("display_name"),
    displayNameCn: text("display_name_cn"),         // Chinese name
    priceCents: integer("price_cents").default(0),
});
