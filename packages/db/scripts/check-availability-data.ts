
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as schema from "../src/schema/core";
import * as staffSchema from "../src/schema/staff";
import * as bookingSchema from "../src/schema/booking";
import * as dotenv from "dotenv";

dotenv.config();

const client = new Client({
    connectionString: "postgres://schedule:schedule@127.0.0.1:5433/schedule",
});

async function main() {
    await client.connect();
    const db = drizzle(client, { schema: { ...schema, ...staffSchema, ...bookingSchema } });

    console.log("=== CHECKING DATA FOR BOOKING DEBUG ===");

    // 1. Check Venues
    const venues = await db.select().from(schema.venues);
    console.log("Venues:", venues.map(v => ({ id: v.id, name: v.name })));

    // 2. Check Staff and their assignments
    const staff = await db.select().from(staffSchema.staff);
    console.log(`Found ${staff.length} staff members.`);
    const massageStaff = staff.filter(s => s.role?.toLowerCase().includes("therapist") || s.department?.includes("Massage"));
    console.log("Massage/Spa Staff:", massageStaff.map(s => ({ id: s.id, name: s.name, role: s.role, venue: s.venueId })));

    // 3. Check Shifts (The user says they scheduled staff)
    const shifts = await db.select().from(staffSchema.shifts);
    console.log(`Found ${shifts.length} shifts.`);
    // Show details of first few shifts
    if (shifts.length > 0) {
        console.log("Sample Shifts:", shifts.slice(0, 3).map(s => ({
            id: s.id,
            staffId: s.staffId,
            start: s.startTime,
            end: s.endTime,
            status: s.status
        })));
    }

    // 4. Check Class Schedules (What the API currently looks at)
    const schedules = await db.select().from(bookingSchema.schedules);
    console.log(`Found ${schedules.length} Class Schedules (sch_class_schedules).`);

    // 5. Check Bookings
    const bookings = await db.select().from(bookingSchema.bookings);
    console.log(`Found ${bookings.length} Bookings.`);

    await client.end();
}

main();
