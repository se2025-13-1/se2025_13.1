import express from "express";
import { VoucherController } from "./voucher.controller.js";
import {
  requireAuth,
  requireAdmin,
} from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Public: Check voucher code (customers check before checkout)
router.post("/check", VoucherController.check);

// Public: Get all vouchers (customers see available vouchers)
router.get("/", VoucherController.getAll);

// Admin only: CRUD operations - Middleware applied after this point
router.use(requireAuth, requireAdmin);

router.get("/:id", VoucherController.getOne); // Get single voucher
router.post("/", VoucherController.create); // Create voucher
router.put("/:id", VoucherController.update); // Update voucher
router.delete("/:id", VoucherController.delete); // Delete voucher

export default router;
