import { db } from "../../db";
import { bookings, memberships, members } from "@glvt/db";
import { eq, and } from "drizzle-orm";
import { GymBookingRequest, BookingResponse, VenueType } from "./types";

const GYM_VENUE_ID = 1; // Gym venue ID (update as needed)

export class GymBookingService {

    /**
     * Check membership status
     */
    async checkMembershipStatus(membershipId: string): Promise<{
        valid: boolean;
        memberName?: string;
        expiresAt?: string;
        error?: string;
    }> {
        // Parse membership ID (e.g., "MEMB_0031" -> 31)
        const id = parseInt(membershipId.replace('MEMB_', ''));

        const [membership] = await db.select()
            .from(memberships)
            .where(eq(memberships.id, id))
            .limit(1);

        if (!membership) {
            return { valid: false, error: "Membership not found" };
        }

        if (membership.status !== 'active') {
            return { valid: false, error: `Membership status: ${membership.status}` };
        }

        // Get member name
        const [member] = await db.select()
            .from(members)
            .where(eq(members.id, membership.memberId))
            .limit(1);

        return {
            valid: true,
            memberName: member ? `${member.firstName} ${member.lastName}` : undefined,
            expiresAt: membership.endDate || undefined,
        };
    }

    /**
     * Create a gym booking (check-in)
     */
    async createBooking(data: GymBookingRequest): Promise<BookingResponse> {
        // Verify membership
        const membershipStatus = await this.checkMembershipStatus(data.membershipId);

        if (!membershipStatus.valid) {
            return { success: false, error: membershipStatus.error };
        }

        const membershipId = parseInt(data.membershipId.replace('MEMB_', ''));
        const startTime = new Date(data.startTime);

        // Create booking
        const [newBooking] = await db.insert(bookings).values({
            customerName: membershipStatus.memberName || 'Gym Member',
            customerEmail: 'gym@local',
            serviceType: 'gym',
            startTime: startTime.toISOString(),
            durationMinutes: 60, // Standard gym session
            status: 'confirmed',
            venueId: GYM_VENUE_ID,
            membershipId,
            bookingType: VenueType.GYM,
        } as any).returning();

        return {
            success: true,
            bookingId: `GYM_${String(newBooking.id).padStart(4, '0')}`,
        };
    }
}

export const gymBookingService = new GymBookingService();
