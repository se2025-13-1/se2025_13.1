import express from "express";
import { register, verifyOTP } from "./auth.controller.js";
import { loginLocal, loginGoogle, loginFacebook } from "./auth.controller.js";
const router = express.Router();

router.post("/register", register);
router.post("/verify-otp", verifyOTP);
router.post("/login", loginLocal);
router.post("/login/google", loginGoogle);
router.post("/login/facebook", loginFacebook);

export default router;
