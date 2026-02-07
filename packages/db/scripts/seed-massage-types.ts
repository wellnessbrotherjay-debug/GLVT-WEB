/**
 * Seed massage types data
 * Run with: npx tsx packages/db/scripts/seed-massage-types.ts
 */
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { massageTypes } from "../src/schema/booking-types";

const connectionString = process.env.DATABASE_URL || "postgres://schedule:schedule@127.0.0.1:5433/schedule";

async function seedMassageTypes() {
    const pool = new Pool({ connectionString });
    const db = drizzle(pool);

    console.log("Seeding massage types...");

    // Insert the two massage types
    await db.insert(massageTypes).values([
        {
            id: 'massage_60',
            durationMinutes: 60,
            displayName: '60 Minute Massage',
            displayNameCn: '60分钟按摩',
            priceCents: 28000, // ¥280
        },
        {
            id: 'massage_90',
            durationMinutes: 90,
            displayName: '90 Minute Massage',
            displayNameCn: '90分钟按摩',
            priceCents: 38000, // ¥380
        },
    ]).onConflictDoNothing();

    console.log("✅ Massage types seeded:");
    console.log("  - massage_60: 60 minutes (¥280)");
    console.log("  - massage_90: 90 minutes (¥380)");

    // Also update No.1 Wellness venue type
    await pool.query(`UPDATE sch_venues SET venue_type = 'massage' WHERE id = 5`);
    console.log("✅ Set venue 5 (No.1 Wellness) to venue_type='massage'");

    await pool.end();
}

seedMassageTypes().catch(console.error);
