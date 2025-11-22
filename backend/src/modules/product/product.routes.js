// src/modules/product/product.routes.js
import express from "express";
import { ProductController } from "./product.controller.js";

const router = express.Router();

// Public
router.get("/", ProductController.list);
router.get("/:id", ProductController.getDetail);

// Protected (you should add auth middleware in real app)
router.post("/", ProductController.create);
router.put("/:id", ProductController.update);
router.delete("/:id", ProductController.remove);

export default router;
