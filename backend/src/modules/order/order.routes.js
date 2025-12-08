// src/modules/order/order.routes.js
import express from "express";
import { OrderController } from "./order.controller.js";
import {
  requireAuth,
  requireAdmin,
} from "../../middlewares/auth.middleware.js"; // Import requireAdmin

const router = express.Router();

router.use(requireAuth);

// User Routes
router.post("/", OrderController.create);
router.get("/", OrderController.list); // API cũ: Lấy đơn của chính mình
router.get("/:id", OrderController.detail);
router.put("/:id/cancel", OrderController.cancel);

// 👇 ADMIN ROUTES (Thêm đoạn này)
// GET /api/orders/admin/all -> Lấy tất cả đơn
router.get("/admin/all", requireAdmin, OrderController.listAll);

// PUT /api/orders/:id/status -> Cập nhật trạng thái (Admin)
// Bạn nên viết thêm hàm updateStatus trong Controller/Service tương tự
// router.put("/:id/status", requireAdmin, OrderController.updateStatus);

export default router;
