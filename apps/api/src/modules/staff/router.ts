import { Router } from "express";
import { staffService } from "./service";

export const staffRouter = Router();

staffRouter.get("/", async (req, res) => {
    // TODO: Get venueId from context/auth
    const venueId = 1;
    try {
        const staff = await staffService.getStaffByVenue(venueId);
        res.json(staff);
    } catch (error) {
        console.error("Error fetching staff:", error);
        res.status(500).json({ error: "Failed to fetch staff" });
    }
});

staffRouter.get("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const staff = await staffService.getStaffById(id);
        if (!staff) return res.status(404).json({ error: "Staff not found" });
        res.json(staff);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch staff member" });
    }
});

staffRouter.put("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const updated = await staffService.updateStaffProfile(id, req.body);
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: "Failed to update staff" });
    }
});

staffRouter.get("/:id/kpis", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const kpis = await staffService.getKPIs(id);
        res.json(kpis);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch KPIs" });
    }
});
