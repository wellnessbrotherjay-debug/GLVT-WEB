import { db } from "../../db";
import { members, vouchers } from "@glvt/db";
import { eq } from "drizzle-orm";

export class CRMService {
    async getMemberByEmail(email: string) {
        return await db.query.members.findFirst({
            where: eq(members.email, email),
            with: {
                memberships: true,
            }
        });
    }

    async createMember(data: typeof members.$inferInsert) {
        return await db.insert(members).values(data).returning();
    }

    async validateVoucher(code: string) {
        const voucher = await db.query.vouchers.findFirst({
            where: eq(vouchers.code, code),
        });

        if (!voucher || !voucher.isActive) return null;
        // TODO: Check expiry and usage limits
        return voucher;
    }
}

export const crmService = new CRMService();
