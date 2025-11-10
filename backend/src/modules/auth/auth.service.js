import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import axios from "axios";

import { userRepository } from "./auth.repository.js";
import { redisClient } from "../../config/redis.js";
import { sendVerificationEmail } from "../../utils/email.js";
import { pgPool } from "../../config/postgres.js";

export const authService = {
  /**
   * Đăng ký user mới, gửi OTP xác nhận
   */
  register: async ({ name, email, password, phone }) => {
    // Nếu user đã tồn tại và đã xác minh -> lỗi
    const existing = await userRepository.findByEmail(email);
    if (existing && existing.is_verified)
      throw new Error("Email đã được đăng ký");

    // Nếu user tồn tại nhưng chưa xác thực, không tạo user mới, chỉ gửi mã lại
    let user;
    if (existing && !existing.is_verified) {
      user = existing;
    } else {
      const hash = await bcrypt.hash(password, 10);
      user = await userRepository.createUser({
        name,
        email,
        password_hash: hash,
        phone,
      });
    }

    // Tạo OTP (6 chữ số)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Lưu OTP trong Redis 5 phút
    await redisClient.set(`otp:${email}`, otp, { EX: 300 });

    // Gửi OTP qua email (template mặc định)
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

  /**
   * Generic provider login handler (delegates to provider-specific or generic flow)
   */
  loginWithProvider: async ({
    provider,
    provider_user_id,
    access_token,
    name,
    email,
    avatar_url,
  }) => {
    // Delegate to provider-specific fast paths
    if (provider === "google") {
      // Google flow (inline to avoid referencing authService during init)
      const { data: googleUser } = await axios.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      );

      if (!googleUser.email)
        throw new Error("Không thể lấy thông tin từ Google");

      let providerRec = await userRepository.findProvider(
        "google",
        googleUser.sub
      );
      let gUser;
      if (providerRec) {
        const res = await pgPool.query("SELECT * FROM users WHERE id = $1", [
          providerRec.user_id,
        ]);
        gUser = res.rows[0];
      } else {
        gUser = await userRepository.findByEmail(googleUser.email);
        if (!gUser) {
          gUser = await userRepository.createUser({
            name: googleUser.name,
            email: googleUser.email,
            avatar_url: googleUser.picture,
          });
        }

        await userRepository.linkProvider({
          user_id: gUser.id,
          provider: "google",
          provider_user_id: googleUser.sub,
          access_token,
        });
      }

      const payloadG = { id: gUser.id, email: gUser.email, role: gUser.role };
      const accessTokenG = jwt.sign(payloadG, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      return {
        message: "Đăng nhập bằng Google thành công",
        user: gUser,
        accessToken: accessTokenG,
      };
    }
    if (provider === "facebook") {
      // Facebook flow (inline)
      const { data: fbUser } = await axios.get(
        `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${access_token}`
      );
      if (!fbUser.email) throw new Error("Không thể lấy thông tin từ Facebook");

      let providerRec = await userRepository.findProvider(
        "facebook",
        fbUser.id
      );
      let fUser;
      if (providerRec) {
        const res = await pgPool.query("SELECT * FROM users WHERE id = $1", [
          providerRec.user_id,
        ]);
        fUser = res.rows[0];
      } else {
        fUser = await userRepository.findByEmail(fbUser.email);
        if (!fUser) {
          fUser = await userRepository.createUser({
            name: fbUser.name,
            email: fbUser.email,
            avatar_url: fbUser.picture?.data?.url,
          });
        }

        await userRepository.linkProvider({
          user_id: fUser.id,
          provider: "facebook",
          provider_user_id: fbUser.id,
          access_token,
        });
      }

      const payloadF = { id: fUser.id, email: fUser.email, role: fUser.role };
      const accessTokenF = jwt.sign(payloadF, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      return {
        message: "Đăng nhập bằng Facebook thành công",
        user: fUser,
        accessToken: accessTokenF,
      };
    }

    // Generic provider flow: check provider mapping, create user if needed
    let providerRecord = await userRepository.findProvider(
      provider,
      provider_user_id
    );
    let user;

    if (providerRecord) {
      const res = await pgPool.query("SELECT * FROM users WHERE id = $1", [
        providerRecord.user_id,
      ]);
      user = res.rows[0];
    } else {
      user = await userRepository.findByEmail(email);
      if (!user) {
        user = await userRepository.createUser({
          name,
          email,
          avatar_url,
        });
      }

      await userRepository.linkProvider({
        user_id: user.id,
        provider,
        provider_user_id,
        access_token,
      });
    }

    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return {
      message: `Đăng nhập bằng ${provider} thành công`,
      user,
      accessToken,
    };
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

  // THÊM VÀO auth.service.js
  sendResetCode: async (email) => {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new Error("Email không tồn tại");

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await redisClient.set(`reset_otp:${email}`, otp, { EX: 300 }); // 5 phút

    await sendVerificationEmail(email, otp, "reset"); // Dùng template reset
    return { message: "Đã gửi mã đặt lại mật khẩu" };
  },

  resetPassword: async ({ email, otp, newPassword }) => {
    const storedOtp = await redisClient.get(`reset_otp:${email}`);
    if (!storedOtp || storedOtp !== otp)
      throw new Error("Mã OTP không hợp lệ hoặc hết hạn");

    const hash = await bcrypt.hash(newPassword, 10);
    await pgPool.query(
      `UPDATE users SET password_hash = $1, updated_at = NOW() WHERE email = $2`,
      [hash, email]
    );

    await redisClient.del(`reset_otp:${email}`);
    return { message: "Đặt lại mật khẩu thành công" };
  },

  /**
   * Change password for existing user (requires current password)
   * Accepts: { email, oldPassword, newPassword }
   */
  changePassword: async ({ email, oldPassword, newPassword }) => {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new Error("Email không tồn tại");

    const valid = await bcrypt.compare(oldPassword, user.password_hash);
    if (!valid) throw new Error("Mật khẩu hiện tại không đúng");

    const hash = await bcrypt.hash(newPassword, 10);
    await pgPool.query(
      `UPDATE users SET password_hash = $1, updated_at = NOW() WHERE email = $2`,
      [hash, email]
    );

    return { message: "Đổi mật khẩu thành công" };
  },
};
