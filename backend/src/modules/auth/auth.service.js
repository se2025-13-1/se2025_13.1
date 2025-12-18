import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { AuthRepository } from "./auth.repository.js";
import { redisClient } from "../../config/redis.js";
import { firebaseAuth } from "../../config/firebase.js";
import { sendVerificationEmail } from "../../config/email.js"; // Tạm thời chưa dùng đến

const JWT_SECRET = process.env.JWT_SECRET || "secret";

// Helper tạo token
const generateTokens = (user) => {
  const payload = { id: user.id, email: user.email, role: user.role };
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
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

    // Nếu user không có password hash (chỉ có khi dùng local auth)
    if (!user.password_hash)
      throw new Error("Vui lòng đăng nhập bằng email/password");

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

  // 5. Verify Firebase Google ID Token
  async verifyFirebaseGoogle(idToken) {
    try {
      if (!firebaseAuth) {
        throw new Error("Firebase not configured");
      }

      // Step 1: Verify ID Token with Firebase
      const decodedToken = await firebaseAuth.verifyIdToken(idToken);

      // Step 2: Extract user info from decoded token
      const { uid, email, name, picture } = decodedToken;

      if (!email) {
        throw new Error("Email not provided by Google account");
      }

      // Step 3: Check if user already exists by Firebase UID
      const existingUser = await AuthRepository.findByFirebaseUid(uid);

      if (existingUser) {
        // User already registered - just login
        const tokens = generateTokens(existingUser);
        return { user: existingUser, ...tokens };
      }

      // Step 4: Check if email already exists (from local auth)
      const userWithEmail = await AuthRepository.findByEmail(email);

      let user;
      if (userWithEmail) {
        // Email exists from local auth - link Firebase to existing user
        user = userWithEmail;
        await AuthRepository.linkFirebaseUid(user.id, uid);
      } else {
        // New user - Create with Firebase info
        user = await AuthRepository.createUserFromFirebase({
          firebaseUid: uid,
          email,
          fullName: name || "Google User",
          avatarUrl: picture || null,
        });
      }

      // Step 5: Generate JWT tokens
      const tokens = generateTokens(user);

      // Step 6: Return response
      return { user, ...tokens };
    } catch (error) {
      if (error.code === "auth/id-token-expired") {
        throw new Error("Google ID Token expired");
      }
      if (error.code === "auth/id-token-revoked") {
        throw new Error("Google ID Token revoked");
      }
      if (error.code === "auth/invalid-id-token") {
        throw new Error("Invalid Google ID Token");
      }
      throw error;
    }
  },
};
