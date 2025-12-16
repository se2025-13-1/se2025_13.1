import express from "express";
import { NotificationController } from "./notification.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.use(requireAuth);

router.post("/device", NotificationController.registerDevice); // Đăng ký token
router.get("/", NotificationController.list); // Xem list
router.put("/:id/read", NotificationController.markRead); // Đánh dấu đã đọc

export default router;
