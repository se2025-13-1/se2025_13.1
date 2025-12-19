// src/modules/order/order.routes.js
import express from "express";
import { OrderController } from "./order.controller.js";
import {
  requireAuth,
  requireAdmin,
} from "../../middlewares/auth.middleware.js"; // Import requireAdmin

const router = express.Router();

router.use(requireAuth);

// 👇 ADMIN ROUTES (Đặt trước User Routes để tránh conflict)
// GET /api/orders/admin/all -> Lấy tất cả đơn
router.get("/admin/all", requireAdmin, OrderController.listAll);
// GET /api/orders/admin/:id -> Lấy chi tiết đơn (không cần check user_id)
router.get("/admin/:id", requireAdmin, OrderController.detailAdmin);
// PUT /api/orders/:id/status -> Admin cập nhật status đơn hàng
router.put("/:id/status", requireAdmin, OrderController.updateStatus);

// User Routes
router.post("/", OrderController.create);
router.get("/", OrderController.list); // API cũ: Lấy đơn của chính mình
router.get("/:id", OrderController.detail);
router.put("/:id/cancel", OrderController.cancel);
router.put("/:id/complete", OrderController.complete);

export default router;
