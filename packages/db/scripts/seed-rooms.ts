import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { resources } from "../src/schema/booking";

const connectionString = process.env.DATABASE_URL || "postgres://schedule:schedule@127.0.0.1:5433/schedule";

async function seedRooms() {
    const pool = new Pool({ connectionString });
    const db = drizzle(pool);

    console.log("Seeding rooms for venue 5...");

    await db.insert(resources).values([
        {
            name: 'Room A',
            venueId: 5,
            roomType: 'massage',
            status: 'open',
            priority: 0,
        },
        {
            name: 'Room B',
            venueId: 5,
            roomType: 'massage',
            status: 'open',
            priority: 1,
        },
        {
            name: 'Room C',
            venueId: 5,
            roomType: 'massage',
            status: 'open',
            priority: 2,
        },
    ]).onConflictDoNothing();

    console.log("✅ Seeded 3 rooms for venue 5");
    await pool.end();
}

seedRooms().catch(console.error);
