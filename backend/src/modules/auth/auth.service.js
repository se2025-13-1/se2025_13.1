import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import axios from "axios";

import { AuthRepository } from "./auth.repository.js";
import { redisClient } from "../../config/redis.js";
import { sendVerificationEmail } from "../../config/email.js"; // Tạm thời chưa dùng đến

const JWT_SECRET = process.env.JWT_SECRET || "secret";

// Helper tạo token
const generateTokens = (user) => {
  const payload = { id: user.id, email: user.email, role: user.role };
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
  const refreshToken = jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET || "refresh_secret",
    { expiresIn: "7d" }
  );
  return { accessToken, refreshToken };
};

export const AuthService = {
  // 1. Đăng ký Local (Lazy Auth: Đăng ký xong trả token luôn)
  async register({ email, password, fullName }) {
    const existing = await AuthRepository.findByEmail(email);
    if (existing) throw new Error("Email đã được sử dụng");

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Chỉ truyền 3 tham số cơ bản
    const newUser = await AuthRepository.createUser({
      email,
      passwordHash,
      fullName,
      avatarUrl: null,
    });

    const tokens = generateTokens(newUser);
    return { user: newUser, ...tokens };
  },

  // 2. Đăng nhập Local
  async loginLocal({ email, password }) {
    const user = await AuthRepository.findByEmail(email);
    if (!user) throw new Error("Email hoặc mật khẩu không đúng");

    // Nếu user đăng ký bằng Google thì không có pass
    if (!user.password_hash)
      throw new Error("Vui lòng đăng nhập bằng Google/Facebook");

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) throw new Error("Email hoặc mật khẩu không đúng");

    const tokens = generateTokens(user);
    return { user, ...tokens };
  },

  // 3. Lấy thông tin
  async getProfile(userId) {
    const user = await AuthRepository.findById(userId);
    if (!user) throw new Error("User not found");
    return user;
  },

  // 4. Cập nhật thông tin
  async updateProfile(userId, payload) {
    // payload: { fullName, gender, birthday, phone, avatarUrl }
    const updated = await AuthRepository.updateProfile(userId, payload);
    if (!updated) throw new Error("Update failed");
    return updated;
  },

  // 3. Hàm xử lý chung cho Social Login (Tránh lặp code)
  async handleSocialLogin({
    provider,
    providerUserId,
    email,
    fullName,
    avatarUrl,
    accessToken,
  }) {
    // A. Kiểm tra provider đã link chưa
    const linkedProvider = await AuthRepository.findProvider(
      provider,
      providerUserId
    );

    let user;

    if (linkedProvider) {
      // Đã link -> Lấy user gốc
      user = await AuthRepository.findById(linkedProvider.user_id);
    } else {
      // Chưa link -> Kiểm tra email có tồn tại không
      user = await AuthRepository.findByEmail(email);

      if (!user) {
        // Chưa có user -> Tạo user mới (Không password)
        user = await AuthRepository.createUser({
          email,
          fullName,
          avatarUrl,
          passwordHash: null,
        });
      }

      // Link provider vào user
      await AuthRepository.linkProvider({
        userId: user.id,
        provider,
        providerUserId,
        accessToken,
      });
    }

    const tokens = generateTokens(user);
    return { user, ...tokens };
  },

  // 4. Login Google
  async loginGoogle(googleAccessToken) {
    // Verify token với Google Server
    const { data } = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${googleAccessToken}` },
      }
    );

    if (!data.email) throw new Error("Google Token không hợp lệ");

    return await this.handleSocialLogin({
      provider: "google",
      providerUserId: data.sub,
      email: data.email,
      fullName: data.name,
      avatarUrl: data.picture,
      accessToken: googleAccessToken,
    });
  },

  // 5. Login Facebook
  async loginFacebook(fbAccessToken) {
    const { data } = await axios.get(
      `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${fbAccessToken}`
    );

    if (!data.email)
      throw new Error("Facebook Token không hợp lệ hoặc không có email");

    return await this.handleSocialLogin({
      provider: "facebook",
      providerUserId: data.id,
      email: data.email,
      fullName: data.name,
      avatarUrl: data.picture?.data?.url,
      accessToken: fbAccessToken,
    });
  },

  // --- Các hàm tiện ích khác (Forgot Password) ---

  async sendResetCode(email) {
    const user = await AuthRepository.findByEmail(email);
    if (!user) throw new Error("Email không tồn tại");

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // Lưu Redis 5 phút
    if (redisClient)
      await redisClient.set(`reset_otp:${email}`, otp, { EX: 300 });

    // TODO: Bật lại dòng này khi cấu hình xong email service
    await sendVerificationEmail(email, otp, "reset");

    console.log(`🔑 RESET OTP cho ${email}: ${otp}`); // Log ra console để test trước
    return { message: "Mã xác nhận đã được gửi (Check console)" };
  },

  async resetPassword({ email, otp, newPassword }) {
    if (redisClient) {
      const storedOtp = await redisClient.get(`reset_otp:${email}`);
      if (!storedOtp || storedOtp !== otp)
        throw new Error("OTP sai hoặc hết hạn");
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    await AuthRepository.updatePassword(email, newHash);

    if (redisClient) await redisClient.del(`reset_otp:${email}`);

    return { message: "Đặt lại mật khẩu thành công" };
  },
};
