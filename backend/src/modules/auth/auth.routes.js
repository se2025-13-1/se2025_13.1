import express from "express";
import { AuthController } from "./auth.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Auth Local
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

// Auth Firebase
router.post("/firebase", AuthController.firebaseGoogle);

// Protected
router.get("/me", requireAuth, AuthController.getMe);
router.put("/profile", requireAuth, AuthController.updateProfile);
router.post("/logout", requireAuth, AuthController.logout);

// Auth Social (Removed - Use local email/password authentication)

// Password Management
router.post("/forgot-password", AuthController.forgotPassword);
router.post("/reset-password", AuthController.resetPassword);

// (Sau này thêm API đổi pass, update profile cần middleware requireAuth)
export default router;
