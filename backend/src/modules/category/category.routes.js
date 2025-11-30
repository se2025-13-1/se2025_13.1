import express from "express";
import { CategoryController } from "./category.controller.js";
import {
  requireAuth,
  requireAdmin,
} from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Public (Ai cũng xem được menu)
router.get("/", CategoryController.getTree); // Lấy dạng cây (cho App User)
router.get("/flat", CategoryController.getFlat); // Lấy dạng phẳng (cho Admin Dropdown)

// Admin Only (Chỉ Admin mới được sửa danh mục)
router.use(requireAuth, requireAdmin);

router.post("/", CategoryController.create);
router.put("/:id", CategoryController.update);
router.delete("/:id", CategoryController.remove);

export default router;
