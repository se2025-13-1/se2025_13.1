import express from "express";
import { ReviewController } from "./review.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// 1. Viết đánh giá (Cần login)
router.post("/", requireAuth, ReviewController.create);

// 2. Xem đánh giá của sản phẩm (Public)
// Lưu ý: Route này thường được gọi từ trang chi tiết sản phẩm
router.get("/product/:productId", ReviewController.listByProduct);

export default router;
