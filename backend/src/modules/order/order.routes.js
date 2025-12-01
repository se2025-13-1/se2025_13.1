import express from "express";
import { OrderController } from "./order.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.use(requireAuth);

router.post("/", OrderController.create);       // Tạo đơn
router.get("/", OrderController.list);          // Xem lịch sử
router.get("/:id", OrderController.detail);     // Xem chi tiết
router.put("/:id/cancel", OrderController.cancel); // Hủy đơn

export default router;