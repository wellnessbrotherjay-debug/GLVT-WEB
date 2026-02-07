import { Router } from "express";
import { coreService } from "./service";

export const coreRouter = Router();

coreRouter.get("/users", async (req, res) => {
    try {
        const users = await coreService.getUsers();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

coreRouter.get("/users/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const user = await coreService.getUserById(id);
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch user" });
    }
});
