import express from "express";
import { WishlistController } from "./wishlist.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.use(requireAuth);

router.post("/toggle", WishlistController.toggle);
router.get("/", WishlistController.list);
router.get("/ids", WishlistController.listIds);

export default router;
