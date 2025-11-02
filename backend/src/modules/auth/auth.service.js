import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userRepository } from "./auth.repository.js";

export const authService = {
  register: async ({ name, email, password, phone, avatar_url }) => {
    // 1️⃣ Kiểm tra email đã tồn tại chưa
    const existing = await userRepository.findByEmail(email);
    if (existing) throw new Error("Email đã tồn tại");

    // 2️⃣ Mã hóa mật khẩu
    const password_hash = await bcrypt.hash(password, 10);

    // 3️⃣ Tạo user
    const user = await userRepository.createUser({
      name,
      email,
      password_hash,
      phone,
      role: "user",
      avatar_url: avatar_url || null,
    });

    // 4️⃣ Tạo JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return {
      message: "Đăng ký thành công",
      user,
      token,
    };
  },
};
