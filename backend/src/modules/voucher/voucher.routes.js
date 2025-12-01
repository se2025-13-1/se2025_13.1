import express from "express";
import { VoucherController } from "./voucher.controller.js";

const router = express.Router();

// API Check mã (Public hoặc Private tùy bạn, thường là Public để khách check thử)
router.post("/check", VoucherController.check);

export default router;
