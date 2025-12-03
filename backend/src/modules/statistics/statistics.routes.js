import express from "express";
import { StatisticsController } from "./statistics.controller.js";
import {
  requireAuth,
  requireAdmin,
} from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Bảo mật 2 lớp: Phải đăng nhập + Phải là Admin
router.use(requireAuth, requireAdmin);

router.get("/dashboard", StatisticsController.getDashboard);

export default router;
