import { authService } from "./auth.service.js";

/**
 * Đăng ký tài khoản mới (local)
 * Gửi OTP xác thực qua email, lưu user tạm (is_verified = false)
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email và mật khẩu là bắt buộc" });
    }

    const result = await authService.register({ name, email, password, phone });
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * Xác thực OTP (email verification)
 */
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Thiếu email hoặc mã OTP" });
    }

    const result = await authService.verifyOTP({ email, otp });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * Đăng nhập bằng email & mật khẩu
 */
export const loginLocal = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Thiếu email hoặc mật khẩu" });
    }

    const result = await authService.loginLocal({ email, password });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * Đăng nhập hoặc liên kết tài khoản thông qua provider (Google, Facebook, ...)
 * (nếu client gửi trực tiếp provider info từ SDK)
 */
export const loginWithProvider = async (req, res) => {
  try {
    const {
      provider,
      provider_user_id,
      name,
      email,
      avatar_url,
      access_token,
      refresh_token,
      token_expires_at,
    } = req.body;

    if (!provider || !provider_user_id || !email) {
      return res.status(400).json({ error: "Thiếu dữ liệu provider" });
    }

    const result = await authService.loginWithProvider({
      provider,
      provider_user_id,
      name,
      email,
      avatar_url,
      access_token,
      refresh_token,
      token_expires_at,
    });

    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * Đăng nhập bằng Google OAuth (với access_token từ frontend)
 */
export const loginGoogle = async (req, res) => {
  try {
    const { access_token } = req.body;

    if (!access_token) {
      return res.status(400).json({ error: "Thiếu access_token từ Google" });
    }

    const result = await authService.loginWithGoogle(access_token);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * Đăng nhập bằng Facebook OAuth (với access_token từ frontend)
 */
export const loginFacebook = async (req, res) => {
  try {
    const { access_token } = req.body;

    if (!access_token) {
      return res.status(400).json({ error: "Thiếu access_token từ Facebook" });
    }

    const result = await authService.loginWithFacebook(access_token);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// THÊM VÀO auth.controller.js
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Thiếu email" });

    const result = await authService.sendResetCode(email);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword)
      return res.status(400).json({ error: "Thiếu thông tin" });

    const result = await authService.resetPassword({ email, otp, newPassword });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Đổi mật khẩu khi user biết mật khẩu hiện tại
export const changePassword = async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;
    if (!email || !oldPassword || !newPassword)
      return res.status(400).json({ error: "Thiếu thông tin" });

    const result = await authService.changePassword({
      email,
      oldPassword,
      newPassword,
    });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
