// Venue and booking type definitions

export enum VenueType {
    GYM = 'gym',
    MASSAGE = 'massage',
    OTHER = 'other',
}

export enum MassageType {
    SIXTY_MIN = 'massage_60',
    NINETY_MIN = 'massage_90',
}

export const MassageDurations: Record<MassageType, number> = {
    [MassageType.SIXTY_MIN]: 60,
    [MassageType.NINETY_MIN]: 90,
};

// Request types for WhatsApp → n8n → Backend flow

export interface GymBookingRequest {
    venue: VenueType.GYM;
    membershipId: string;
    startTime: string;
}

export interface MassageBookingRequest {
    venue: VenueType.MASSAGE;
    massageType: MassageType | '60' | '90'; // Accept simple strings too
    date: string;       // '2026-02-08'
    time: string;       // '10:00'
    customerName: string;
    customerWhatsapp: string;
    staffId?: number;   // Optional specific therapist
}

export interface AvailabilitySlot {
    time: string;
    staffIds: number[];
}

export interface BookingResponse {
    success: boolean;
    bookingId?: string;
    error?: string;
}
