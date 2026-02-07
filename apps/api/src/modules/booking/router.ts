import { Router } from "express";
import { bookingService } from "./service";
import { massageBookingService } from "./massage-booking.service";
import { gymBookingService } from "./gym-booking.service";
import { MassageBookingRequest, VenueType } from "./types";

export const bookingRouter = Router();

// ===============================
// MASSAGE ENDPOINTS (Duration-based)
// ===============================

/**
 * GET /api/booking/massage/availability
 * Query: date (YYYY-MM-DD), type (60 or 90)
 */
bookingRouter.get("/massage/availability", async (req, res) => {
    try {
        const date = req.query.date as string || new Date().toISOString().split('T')[0];
        const massageType = (req.query.type as string) || '60';

        const slots = await massageBookingService.getAvailability(date, massageType as any);
        res.json({
            date,
            massageType,
            durationMinutes: massageType === '90' ? 90 : 60,
            slots,
        });
    } catch (error) {
        console.error("Massage Availability Error:", error);
        res.status(500).json({ error: "Failed to check availability" });
    }
});

/**
 * POST /api/booking/massage
 * Body: { massage_type: "60"|"90", date, time, customer_name, customer_whatsapp }
 */
bookingRouter.post("/massage", async (req, res) => {
    try {
        const data: MassageBookingRequest = {
            venue: VenueType.MASSAGE,
            massageType: req.body.massage_type || req.body.massageType,
            date: req.body.date,
            time: req.body.time,
            customerName: req.body.customer_name || req.body.customerName,
            customerWhatsapp: req.body.customer_whatsapp || req.body.customerWhatsapp,
            staffId: req.body.staff_id || req.body.staffId,
        };

        const result = await massageBookingService.createBooking(data);

        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error("Massage Booking Error:", error);
        res.status(500).json({ error: "Booking failed", details: String(error) });
    }
});

// ===============================
// GYM ENDPOINTS (Membership-based)
// ===============================

/**
 * GET /api/booking/gym/status/:membershipId
 * Check membership validity
 */
bookingRouter.get("/gym/status/:membershipId", async (req, res) => {
    try {
        const result = await gymBookingService.checkMembershipStatus(req.params.membershipId);
        res.json(result);
    } catch (error) {
        console.error("Gym Status Error:", error);
        res.status(500).json({ error: "Failed to check membership" });
    }
});

/**
 * POST /api/booking/gym
 * Body: { membership_id, start_time }
 */
bookingRouter.post("/gym", async (req, res) => {
    try {
        const result = await gymBookingService.createBooking({
            venue: VenueType.GYM,
            membershipId: req.body.membership_id || req.body.membershipId,
            startTime: req.body.start_time || req.body.startTime || new Date().toISOString(),
        });

        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error("Gym Booking Error:", error);
        res.status(500).json({ error: "Booking failed" });
    }
});

// ===============================
// LEGACY ENDPOINTS (Keep for compatibility)
// ===============================

bookingRouter.get("/classes", async (req, res) => {
    const venueId = 1;
    const classes = await bookingService.getClasses(venueId);
    res.json(classes);
});

bookingRouter.get("/schedules", async (req, res) => {
    const venueId = 1;
    const from = new Date(req.query.from as string || new Date());
    const to = new Date(req.query.to as string || new Date());

    const schedules = await bookingService.getSchedules(venueId, from, to);
    res.json(schedules);
});

bookingRouter.get("/availability", async (req, res) => {
    try {
        const venueId = parseInt(req.query.venueId as string) || 5;
        const date = req.query.date as string || new Date().toISOString();
        const duration = parseInt(req.query.duration as string) || 60;

        const slots = await bookingService.getAvailability(venueId, date, duration);
        res.json(slots);
    } catch (error) {
        console.error("Availability Check Failed:", error);
        res.status(500).json({ error: "Failed to check availability" });
    }
});

bookingRouter.post("/", async (req, res) => {
    try {
        const booking = await bookingService.createBooking(req.body);
        res.json(booking);
    } catch (error) {
        res.status(500).json({ error: "Booking failed" });
    }
});

bookingRouter.post("/:id/cancel", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const booking = await bookingService.cancelBooking(id);
        res.json(booking);
    } catch (error) {
        res.status(500).json({ error: "Cancellation failed" });
    }
});
