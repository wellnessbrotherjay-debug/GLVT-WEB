import { Router } from "express";
import { brandService } from "./service";

export const brandRouter = Router();

brandRouter.get("/workouts", async (req, res) => {
    try {
        const workouts = await brandService.getWorkouts();
        res.json(workouts);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch workouts" });
    }
});

brandRouter.get("/workouts/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const workout = await brandService.getWorkoutById(id);
        if (!workout) return res.status(404).json({ error: "Workout not found" });
        res.json(workout);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch workout" });
    }
});

brandRouter.get("/banners", async (req, res) => {
    try {
        const banners = await brandService.getBanners();
        res.json(banners);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch banners" });
    }
});
