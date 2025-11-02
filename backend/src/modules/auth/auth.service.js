import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import axios from "axios";

import { userRepository } from "./auth.repository.js";
import { redisClient } from "../../config/redis.js";
import { sendVerificationEmail } from "../../utils/email.js";

export const authService = {
  /**
   * Đăng ký user mới, gửi OTP xác nhận
   */
  register: async ({ name, email, password, phone }) => {
    const existing = await userRepository.findByEmail(email);
    if (existing) throw new Error("Email đã được đăng ký");

    const hash = await bcrypt.hash(password, 10);

    const user = await userRepository.createUser({
      name,
      email,
      password_hash: hash,
      phone,
    });

    // Tạo OTP (6 chữ số)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Lưu OTP trong Redis 5 phút
    await redisClient.set(`otp:${email}`, otp, { EX: 300 });

    // Gửi OTP qua email
    await sendVerificationEmail(email, otp);
    console.log("✅ OTP sent to", email);

    return { message: "Đã gửi OTP xác nhận tới email", user };
  },

  /**
   * Xác minh OTP được gửi qua email
   */
  verifyOTP: async ({ email, otp }) => {
    const storedOtp = await redisClient.get(`otp:${email}`);
    if (!storedOtp) throw new Error("OTP đã hết hạn hoặc không tồn tại");
    if (storedOtp !== otp) throw new Error("OTP không hợp lệ");

    // Đánh dấu user là đã xác thực
    await userRepository.verifyUser(email);
    await redisClient.del(`otp:${email}`);

    return { message: "Xác thực tài khoản thành công" };
  },

  /**
   * Xóa user chưa xác minh (khi OTP hết hạn)
   */
  deleteIfExpired: async (email) => {
    await userRepository.deleteUnverifiedUser(email);
  },

  /**
   * Đăng nhập bằng email / password
   */
  loginLocal: async ({ email, password }) => {
    // ✅ fix: phải dùng userRepository thay vì findByEmail chưa định nghĩa
    const user = await userRepository.findByEmail(email);
    if (!user) throw new Error("Email không tồn tại");

    if (!user.is_verified)
      throw new Error("Tài khoản chưa được xác minh qua email OTP");

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw new Error("Sai mật khẩu");

    // ✅ Sinh JWT
    const payload = { id: user.id, email: user.email, role: user.role };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: "7d",
    });

    return {
      message: "Đăng nhập thành công",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  },

  loginWithGoogle: async (googleAccessToken) => {
    // 1️⃣ Lấy thông tin người dùng từ Google
    const { data: googleUser } = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${googleAccessToken}` },
      }
    );

    if (!googleUser.email) throw new Error("Không thể lấy thông tin từ Google");

    // 2️⃣ Kiểm tra xem provider đã tồn tại chưa
    let provider = await userRepository.findProvider("google", googleUser.sub);
    let user;

    if (provider) {
      // user đã liên kết rồi
      const res = await pgPool.query("SELECT * FROM users WHERE id = $1", [
        provider.user_id,
      ]);
      user = res.rows[0];
    } else {
      // Nếu chưa, tạo mới user và link provider
      user = await userRepository.findByEmail(googleUser.email);
      if (!user) {
        user = await userRepository.createUser({
          name: googleUser.name,
          email: googleUser.email,
          avatar_url: googleUser.picture,
        });
      }

      await userRepository.linkProvider({
        user_id: user.id,
        provider: "google",
        provider_user_id: googleUser.sub,
        access_token: googleAccessToken,
      });
    }

    // 3️⃣ Trả JWT
    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return { message: "Đăng nhập bằng Google thành công", user, accessToken };
  },

  loginWithFacebook: async (facebookAccessToken) => {
    // 1️⃣ Lấy thông tin người dùng từ Facebook Graph API
    const { data: fbUser } = await axios.get(
      `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${facebookAccessToken}`
    );

    if (!fbUser.email) throw new Error("Không thể lấy thông tin từ Facebook");

    let provider = await userRepository.findProvider("facebook", fbUser.id);
    let user;

    if (provider) {
      const res = await pgPool.query("SELECT * FROM users WHERE id = $1", [
        provider.user_id,
      ]);
      user = res.rows[0];
    } else {
      user = await userRepository.findByEmail(fbUser.email);
      if (!user) {
        user = await userRepository.createUser({
          name: fbUser.name,
          email: fbUser.email,
          avatar_url: fbUser.picture?.data?.url,
        });
      }

      await userRepository.linkProvider({
        user_id: user.id,
        provider: "facebook",
        provider_user_id: fbUser.id,
        access_token: facebookAccessToken,
      });
    }

    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return { message: "Đăng nhập bằng Facebook thành công", user, accessToken };
  },
};
