import { db } from "../src";
import { users, venues, workouts, exercises } from "../src/schema";
import postgres from "postgres";

// Legacy Connection (Supabase)
const legacySql = postgres(process.env.LEGACY_DATABASE_URL!);

async function migrate() {
    console.log("Starting migration...");

    // 1. Migrate Users
    const legacyUsers = await legacySql`SELECT * FROM users`;
    for (const u of legacyUsers) {
        await db.insert(users).values({
            email: u.email,
            name: u.name || `${u.first_name} ${u.last_name}`,
            wxOpenId: u.wx_open_id,
            // ... map other fields
        }).onConflictDoNothing();
    }
    console.log(`Migrated ${legacyUsers.length} users.`);

    // 2. Migrate Workouts (Brand Content)
    const legacyWorkouts = await legacySql`SELECT * FROM training_sessions`;
    for (const w of legacyWorkouts) {
        // Map existing Rails/Supabase shape to new Drizzle schema
        await db.insert(workouts).values({
            name: w.name,
            description: w.description,
            durationMinutes: w.duration,
            // ...
        });
    }
    console.log("Migration complete.");
    process.exit(0);
}

migrate().catch(console.error);
