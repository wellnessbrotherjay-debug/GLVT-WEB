
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import { eq } from "drizzle-orm"; // Fix import
import * as schema from "../src/schema/core";
import * as staffSchema from "../src/schema/staff";
import * as dotenv from "dotenv";

dotenv.config();

// --- MOCK DATA SOURCE (Copied from apps/ops/src/mocks/data.ts) ---
// We copy this to avoid ts-node import issues with frontend code (e.g. alias paths)

const initialUsers = [
    {
        id: "randolph",
        name: "Randolph",
        email: "randolph@example.com",
        role: "Director",
        team: "Board",
        division: "PT GMB",
        department: "Directorate",
        shift: "General",
        skills: ["Leadership", "Strategy", "Investment"]
    },
    {
        id: "jay",
        name: "Jay",
        email: "jay@example.com",
        role: "Head of Systems, Brand & Marketing Strategy",
        team: "Board",
        division: "PT GMB",
        department: "Directorate",
        reportsTo: "randolph",
        shift: "General",
        skills: ["Operations", "Systems", "Finance"],
        manages: ["Maria", "Stephanie", "Phil", "Mona"],
        focusAreas: [
            "Brand Architecture", "Performance Analytics", "Tech Systems", "Marketing Strategy", "SEO & Traffic"
        ],
        successMetrics: ["CPA", "Organic Search Ranking", "Website Conversion Rate", "Brand Sentiment"],
        strategicDirective: "Focus on delegating..."
    },
    {
        id: "gm-suites",
        name: "Sindo Saputra",
        email: "sindo@ts-suites.com",
        role: "GOM (General Operational Manager)",
        team: "Management",
        division: "TS Suites",
        department: "Management",
        reportsTo: "jay",
        shift: "General",
        skills: ["Operations", "Hotel Management"],
    },
    {
        id: "gm-wellness",
        name: "Maria",
        email: "maria@no1.com",
        role: "General Manager",
        team: "Management",
        division: "No.1 Wellness",
        department: "Management",
        reportsTo: "jay",
        shift: "General",
        manages: ["Reception", "Kitchen", "Massage", "Cleaning", "Fitness Coaches"],
    },
    {
        id: "head-mkt-well",
        name: "Mona",
        email: "mona@no1.com",
        role: "Content Manager",
        department: "Marketing & Content",
        division: "No.1 Wellness"
    },
    {
        id: "phil-social",
        name: "Phil",
        email: "phil@no1.com",
        role: "Social Media Lead",
        department: "Marketing & Content",
        division: "No.1 Wellness"
    }
    // ... Simplified list for brevity, but includes the key people user cares about
];

// --- MIGRATION SCRIPT ---

const client = new Client({
    connectionString: "postgres://schedule:schedule@127.0.0.1:5433/schedule",
});

async function main() {
    await client.connect();
    const db = drizzle(client, { schema: { ...schema, ...staffSchema } });
    console.log("Migrating Mock Data to DB...");

    // Get default venue
    const [venue] = await db.select().from(schema.venues).limit(1);
    if (!venue) {
        console.error("No venue found. Run seed.ts first.");
        return;
    }

    for (const mockUser of initialUsers) {
        // 1. Check if user exists by email
        const existing = await db.select().from(schema.users).where(eq(schema.users.email, mockUser.email || ""));

        let userId: number;

        if (existing.length > 0) {
            console.log(`User ${mockUser.name} already exists, skipping creation.`);
            userId = existing[0].id;
        } else {
            // 2. Create Core User
            const [newUser] = await db.insert(schema.users).values({
                email: mockUser.email,
                name: mockUser.name,
                username: mockUser.email.split('@')[0],
                passwordHash: "password", // Default password
                role: mockUser.role.toLowerCase().includes('manager') ? 'admin' : 'staff',
                defaultVenueId: venue.id,
                isActive: true,
            }).returning();
            userId = newUser.id;
            console.log(`Created User: ${mockUser.name}`);
        }

        // 3. Create Staff Profile (if not exists)
        const existingStaff = await db.select().from(staffSchema.staff).where(eq(staffSchema.staff.userId, userId));

        if (existingStaff.length === 0) {
            await db.insert(staffSchema.staff).values({
                userId: userId,
                venueId: venue.id,
                name: mockUser.name,
                email: mockUser.email,
                role: mockUser.role,
                title: mockUser.role,
                department: mockUser.department || mockUser.team,
                bio: (mockUser as any).strategicDirective || "Imported from Vercel",
                displayOrder: 1,
            });
            console.log(`Created Staff Profile: ${mockUser.name}`);
        }
    }

    console.log("Migration Complete!");
    await client.end();
}

main();
