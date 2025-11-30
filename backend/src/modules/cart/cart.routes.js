import express from "express";
import { CartController } from "./cart.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Giỏ hàng yêu cầu đăng nhập
router.use(requireAuth);

router.get("/", CartController.getCart); // Xem giỏ
router.post("/", CartController.add); // Thêm mới
router.put("/:item_id", CartController.update); // Sửa số lượng
router.delete("/:item_id", CartController.remove); // Xóa

export default router;
