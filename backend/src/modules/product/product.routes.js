// src/modules/product/product.routes.js
import express from "express";
import { ProductController } from "./product.controller.js";
// 👇 Import middleware đã viết
import {
  requireAuth,
  requireAdmin,
} from "../../middlewares/auth.middleware.js";

const router = express.Router();

// ==========================================
// 1. PUBLIC ROUTES (Guest Browsing)
// ==========================================
// Khách vãng lai xem thoải mái
router.get("/", ProductController.list);
router.get("/:id", ProductController.getDetail);

// ==========================================
// 2. ADMIN ROUTES (Bảo mật chặt chẽ)
// ==========================================
// Từ dòng này trở xuống, bắt buộc phải:
// 1. Đã đăng nhập (requireAuth)
// 2. Là Admin (requireAdmin)

router.use(requireAuth, requireAdmin);

router.post("/", ProductController.create);
router.put("/:id", ProductController.update);
router.delete("/:id", ProductController.remove);

export default router;
