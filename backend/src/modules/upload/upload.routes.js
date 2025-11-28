import express from "express";
import { UploadController } from "./upload.controller.js";
import { uploadMiddleware } from "../../middlewares/upload.middleware.js";
import {
  requireAuth,
  requireAdmin,
} from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Chỉ Admin mới được upload ảnh sản phẩm
router.post(
  "/",
  requireAuth,
  requireAdmin,
  uploadMiddleware.single("image"),
  UploadController.uploadSingle
);

export default router;
