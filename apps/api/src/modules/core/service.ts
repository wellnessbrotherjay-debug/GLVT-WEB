import { db } from "../../db";
import { users, venues } from "@glvt/db";
import { eq } from "drizzle-orm";

export class CoreService {
    async getUsers() {
        return await db.query.users.findMany();
    }

    async getUserById(id: number) {
        return await db.query.users.findFirst({
            where: eq(users.id, id),
        });
    }

    async getUserByEmail(email: string) {
        return await db.query.users.findFirst({
            where: eq(users.email, email),
        });
    }

    async createVenue(data: typeof venues.$inferInsert) {
        return await db.insert(venues).values(data).returning();
    }
}

export const coreService = new CoreService();
