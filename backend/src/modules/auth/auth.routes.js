// auth.routes.js
import express from "express";
import {
  register,
  verifyOTP,
  forgotPassword,
  resetPassword,
  changePassword,
} from "./auth.controller.js";
import { loginLocal, loginGoogle, loginFacebook } from "./auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/verify-otp", verifyOTP);
router.post("/login", loginLocal);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/change-password", changePassword);
router.post("/login/google", loginGoogle);
router.post("/login/facebook", loginFacebook);

export default router;
