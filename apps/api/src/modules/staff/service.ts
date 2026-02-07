import { db } from "../../db";
import { staff, kpis } from "@glvt/db";
import { eq } from "drizzle-orm";

export class StaffService {
    async getStaffByVenue(venueId: number) {
        return await db.query.staff.findMany({
            where: eq(staff.venueId, venueId),
            with: {
                user: true, // Include linked user profile
            }
        });
    }

    async getStaffById(id: number) {
        return await db.query.staff.findFirst({
            where: eq(staff.id, id),
            with: {
                user: true,
            }
        });
    }

    async updateStaffProfile(id: number, data: Partial<typeof staff.$inferInsert>) {
        return await db.update(staff).set(data).where(eq(staff.id, id)).returning();
    }

    async getKPIs(staffId: number) {
        return await db.query.kpis.findMany({
            where: eq(kpis.staffId, staffId),
        });
    }

    async addKPI(data: typeof kpis.$inferInsert) {
        return await db.insert(kpis).values(data).returning();
    }
}

export const staffService = new StaffService();
