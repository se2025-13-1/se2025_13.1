import express from "express";
import { UploadController } from "./upload.controller.js";
import { uploadMiddleware } from "../../middlewares/upload.middleware.js";
import {
  requireAuth,
  requireAdmin,
} from "../../middlewares/auth.middleware.js";

const router = express.Router();

// User có thể upload ảnh avatar của mình
router.post(
  "/avatar",
  requireAuth,
  uploadMiddleware.single("image"),
  UploadController.uploadSingle
);

// Chỉ Admin mới được upload ảnh sản phẩm
router.post(
  "/",
  requireAuth,
  requireAdmin,
  uploadMiddleware.single("image"),
  UploadController.uploadSingle
);

export default router;
