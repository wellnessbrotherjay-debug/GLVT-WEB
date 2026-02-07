
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import { eq } from "drizzle-orm";
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
    console.log("Seeding Availability...");

    // 1. Get No.1 Wellness Venue
    // The previous check showed ID 5 name 'No.1 Wellness Club' and ID 2/4 'Number One Wellness (Hotel)'
    // I'll target "No.1 Wellness Club" (matches the division name in mocks)

    let venues = await db.select().from(schema.venues).where(eq(schema.venues.name, "No.1 Wellness Club"));
    if (venues.length === 0) {
        // Fallback or create
        console.log("Venue 'No.1 Wellness Club' not found, checking others...");
        venues = await db.select().from(schema.venues);
    }
    const venue = venues[0];
    console.log(`Using Venue: ${venue.name} (ID: ${venue.id})`);

    // 2. Create Therapists
    const therapists = [
        { name: "Sarah Massage", email: "sarah@no1.com", role: "Senior Therapist" },
        { name: "Mike Hands", email: "mike@no1.com", role: "Junior Therapist" }
    ];

    const staffIds: number[] = [];

    for (const t of therapists) {
        // Check if exists
        const existing = await db.select().from(staffSchema.staff).where(eq(staffSchema.staff.email, t.email));
        let sId: number;

        if (existing.length > 0) {
            sId = existing[0].id;
            console.log(`Staff ${t.name} exists.`);
        } else {
            // Need a user first? Not strictly required by schema constraint (nullable), but good practice.
            // For now, I'll just create the Staff profile linked to the venue, user_id null is fine for pure operations.
            const [newStaff] = await db.insert(staffSchema.staff).values({
                venueId: venue.id,
                name: t.name,
                email: t.email,
                role: t.role,
                title: t.role,
                department: "Massage & Spa",
                isActive: true
            }).returning();
            sId = newStaff.id;
            console.log(`Created Staff: ${t.name}`);
        }
        staffIds.push(sId);
    }

    // 3. Create Shifts for Next 7 Days (9 AM - 5 PM)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);

        const start = new Date(date);
        start.setHours(9, 0, 0, 0); // 9 AM

        const end = new Date(date);
        end.setHours(17, 0, 0, 0); // 5 PM

        for (const sId of staffIds) {
            // Check if shift exists
            // Simplified check: just checking if any shift exists for this staff on this day
            // In real app, rely on overlap logic.

            // Just insert for now, assuming clean slate or helpful duplication
            await db.insert(staffSchema.shifts).values({
                staffId: sId,
                venueId: venue.id,
                startTime: start,
                endTime: end,
                type: "working",
                status: "scheduled"
            });
        }
    }
    console.log(`Created Shifts for ${staffIds.length} staff over 7 days.`);

    await client.end();
}

main();
