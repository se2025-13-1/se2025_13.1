import express from "express";
import { AddressController } from "./address.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Tất cả API địa chỉ đều yêu cầu đăng nhập
router.use(requireAuth);

router.get("/", AddressController.list);
router.post("/", AddressController.create);
router.put("/:id", AddressController.update);
router.delete("/:id", AddressController.remove);
router.patch("/:id/default", AddressController.setDefault); // API chuyên dụng để set default

export default router;
