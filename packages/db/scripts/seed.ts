
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as schema from "../src/schema/core";
import * as staffSchema from "../src/schema/staff";
import * as dotenv from "dotenv";

dotenv.config();

const client = new Client({
    connectionString: "postgres://schedule:schedule@127.0.0.1:5433/schedule",
});

async function main() {
    await client.connect();
    const db = drizzle(client, { schema: { ...schema, ...staffSchema } });

    console.log("Seeding database...");

    try {
        // 1. Create Venue
        const [venue] = await db.insert(schema.venues).values({
            name: "No.1 Wellness Club",
            type: "studio",
            location: "Shanghai",
            timezone: "Asia/Shanghai",
        }).returning();
        console.log("Created Venue:", venue.name);

        // 2. Create Users
        const [adminUser] = await db.insert(schema.users).values({
            email: "admin@no1wellness.com",
            name: "Admin User",
            username: "admin",
            passwordHash: "hashed_password_placeholder", // In real app, use bcrypt
            role: "admin",
            defaultVenueId: venue.id,
            isActive: true,
        }).returning();
        console.log("Created Admin User:", adminUser.email);

        const [staffUser] = await db.insert(schema.users).values({
            email: "staff@no1wellness.com",
            name: "John Trainer",
            username: "trainer",
            role: "staff",
            defaultVenueId: venue.id,
            isActive: true,
        }).returning();
        console.log("Created Staff User:", staffUser.email);


        // 3. Create Staff Profiles
        await db.insert(staffSchema.staff).values({
            userId: adminUser.id,
            venueId: venue.id,
            name: "Admin User",
            email: "admin@no1wellness.com",
            role: "Manager",
            title: "Club Manager",
            department: "Management",
            bio: "General Manager of No.1 Wellness",
            isActive: true,
        });

        await db.insert(staffSchema.staff).values({
            userId: staffUser.id,
            venueId: venue.id,
            name: "John Trainer",
            email: "staff@no1wellness.com",
            role: "Trainer",
            title: "Senior Coach",
            department: "Fitness",
            bio: "Specializing in strength and conditioning",
            isActive: true,
        });
        console.log("Created Staff Profiles");

    } catch (error) {
        console.error("Seeding failed:", error);
    } finally {
        await client.end();
    }
}

main();
