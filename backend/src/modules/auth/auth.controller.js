import { AuthService } from "./auth.service.js";

export const AuthController = {
  // 1. Đăng ký (Chỉ nhận 3 trường)
  async register(req, res) {
    try {
      const { email, password, name } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email và mật khẩu là bắt buộc" });
      }

      const result = await AuthService.register({
        email,
        password,
        fullName: name,
      });

      return res.status(201).json(result);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  },

  // 2. Cập nhật Profile (Tùy ý thay đổi)
  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      // Lấy các trường cho phép update từ body
      const { full_name, gender, birthday, phone, avatar_url } = req.body;

      const updated = await AuthService.updateProfile(userId, {
        fullName: full_name,
        gender,
        birthday,
        phone,
        avatarUrl: avatar_url,
      });

      return res.json({
        message: "Cập nhật hồ sơ thành công",
        user: updated,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  // Đăng nhập Local
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.loginLocal({ email, password });
      return res.json(result);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  },

  // Quên mật khẩu
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      const result = await AuthService.sendResetCode(email);
      return res.json(result);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  },

  // Lấy thông tin cá nhân
  async getMe(req, res) {
    try {
      const userId = req.user.id;
      const user = await AuthService.getProfile(userId);
      return res.json({ user });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  // Đặt lại mật khẩu
  async resetPassword(req, res) {
    try {
      const { email, otp, newPassword } = req.body;
      const result = await AuthService.resetPassword({
        email,
        otp,
        newPassword,
      });
      return res.json(result);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  },

  // Firebase Google Sign-Up/Login
  async firebaseGoogle(req, res) {
    try {
      const { idToken } = req.body;

      if (!idToken) {
        return res.status(400).json({ error: "Missing idToken" });
      }

      const result = await AuthService.verifyFirebaseGoogle(idToken);
      return res.status(201).json(result);
    } catch (err) {
      console.error("Firebase verification error:", err);
      return res.status(401).json({
        error: err.message || "Firebase verification failed",
      });
    }
  },
};
