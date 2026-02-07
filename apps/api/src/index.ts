// Load environment FIRST before any other imports
import dotenv from "dotenv";
dotenv.config();


import express from "express";
import cors from "cors";
import morgan from "morgan";
import { coreRouter } from "./modules/core";
import { staffRouter } from "./modules/staff";
import { bookingRouter } from "./modules/booking";
import { crmRouter } from "./modules/crm";
import { brandRouter } from "./modules/brand";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Health Check
app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Mount Modules
app.use("/api/core", coreRouter);
app.use("/api/staff", staffRouter);
app.use("/api/booking", bookingRouter);
app.use("/api/crm", crmRouter);
app.use("/api/brand", brandRouter);

app.listen(PORT, () => {
    console.log(`API Server running on port ${PORT}`);
});
