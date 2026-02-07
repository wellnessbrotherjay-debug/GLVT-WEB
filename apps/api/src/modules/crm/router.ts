import { Router } from "express";
import { crmService } from "./service";

export const crmRouter = Router();

crmRouter.get("/members/me", async (req, res) => {
    // Mock user context
    const email = "jay@exequte.com";
    const member = await crmService.getMemberByEmail(email);
    if (!member) return res.status(404).json({ error: "Member profile not found" });
    res.json(member);
});

crmRouter.post("/vouchers/validate", async (req, res) => {
    const { code } = req.body;
    const voucher = await crmService.validateVoucher(code);
    if (!voucher) return res.status(400).json({ error: "Invalid voucher" });
    res.json(voucher);
});
