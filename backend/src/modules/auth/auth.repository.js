import { pgPool } from "../../config/postgres.js";

export const AuthRepository = {
  // 1. Tìm user theo email (để check login/duplicate)
  async findByEmail(email) {
    const query = `
      SELECT u.id, u.email, u.password_hash, u.role, u.is_active,
             p.full_name, p.avatar_url
      FROM auth_users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE u.email = $1
    `;
    const res = await pgPool.query(query, [email]);
    return res.rows[0];
  },

  // 2. Lấy chi tiết User (Gộp Auth + Profile + Addresses)
  async findById(id) {
    const query = `
      SELECT 
        u.id, u.email, u.role, 
        p.full_name, p.avatar_url, p.gender, p.birthday, p.phone, p.is_phone_verified,
        (
          SELECT json_agg(json_build_object(
            'id', a.id,
            'recipient_name', a.recipient_name,
            'phone', a.recipient_phone,
            'full_address', a.address_detail || ', ' || a.ward || ', ' || a.district || ', ' || a.province,
            'province', a.province,
            'district', a.district,
            'ward', a.ward,
            'is_default', a.is_default
          ))
          FROM user_addresses a
          WHERE a.user_id = u.id
        ) as addresses
      FROM auth_users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE u.id = $1
    `;
    const res = await pgPool.query(query, [id]);
    return res.rows[0];
  },

  // 3. Tạo User Tối giản (Chỉ Email + Pass + Name)
  async createUser({
    email,
    passwordHash,
    fullName,
    avatarUrl = null,
    role = "customer",
  }) {
    const client = await pgPool.connect();
    try {
      await client.query("BEGIN");

      // Insert Auth
      const userRes = await client.query(
        `INSERT INTO auth_users (email, password_hash, role, is_active) 
         VALUES ($1, $2, $3, true) 
         RETURNING id, email, role`,
        [email, passwordHash, role]
      );
      const newUser = userRes.rows[0];

      // Insert Profile (Phone để null)
      await client.query(
        `INSERT INTO user_profiles (user_id, full_name, avatar_url) 
         VALUES ($1, $2, $3)`,
        [newUser.id, fullName || "New Member", avatarUrl]
      );

      await client.query("COMMIT");
      return { ...newUser, full_name: fullName, avatar_url: avatarUrl };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  // 4. Cập nhật Profile (Cho phép sửa từng phần)
  async updateProfile(
    userId,
    { fullName, avatarUrl, gender, birthday, phone }
  ) {
    const client = await pgPool.connect();
    try {
      // Dùng COALESCE để: Nếu truyền null/undefined thì giữ nguyên giá trị cũ
      const query = `
        UPDATE user_profiles
        SET 
          full_name = COALESCE($1, full_name),
          avatar_url = COALESCE($2, avatar_url),
          gender = COALESCE($3, gender),
          birthday = COALESCE($4, birthday),
          phone = COALESCE($5, phone),
          updated_at = NOW()
        WHERE user_id = $6
        RETURNING *;
      `;
      const values = [fullName, avatarUrl, gender, birthday, phone, userId];
      const res = await client.query(query, values);
      return res.rows[0];
    } finally {
      client.release();
    }
  },
};
