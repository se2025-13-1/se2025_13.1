// src/modules/product/product.routes.js
import express from "express";
import { ProductController } from "./product.controller.js";

// Giả sử bạn sẽ có middleware kiểm tra đăng nhập và quyền Admin
// import { requireAuth, requireAdmin } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// ==========================================
// 1. PUBLIC ROUTES (Ai cũng xem được)
// ==========================================
// Phù hợp với logic "Guest Browsing" chúng ta đã bàn:
// Khách chưa đăng nhập vẫn xem được danh sách và chi tiết để kích thích mua hàng.

router.get("/", ProductController.list);
// GET /api/products?page=1&limit=10&q=ao&category_id=...

router.get("/:id", ProductController.getDetail);
// GET /api/products/uuid-cua-san-pham

// ==========================================
// 2. PRIVATE / ADMIN ROUTES (Cần bảo mật)
// ==========================================
// Những API này thay đổi dữ liệu hệ thống, tuyệt đối không để Public.

// TODO: Bỏ comment dòng dưới khi bạn đã viết xong middleware auth
// router.use(requireAuth, requireAdmin);

router.post("/", ProductController.create);
// POST /api/products (Body: { name, base_price, variants: [], images: [] ... })

router.put("/:id", ProductController.update);
// PUT /api/products/:id (Body: { name, base_price ... })

router.delete("/:id", ProductController.remove);
// DELETE /api/products/:id

export default router;
