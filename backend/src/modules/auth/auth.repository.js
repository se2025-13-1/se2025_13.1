import { pgPool } from "../../config/postgres.js";

export const userRepository = {
  // Tìm user theo email
  findByEmail: async (email) => {
    const res = await pgPool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    return res.rows[0];
  },

  // Tạo user mới
  createUser: async ({
    name,
    email,
    password_hash,
    phone,
    role,
    avatar_url,
  }) => {
    const res = await pgPool.query(
      `INSERT INTO users (name, email, password_hash, phone, role, avatar_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, phone, role, avatar_url, created_at`,
      [name, email, password_hash, phone, role, avatar_url]
    );
    return res.rows[0];
  },

  // (Sau này dùng cho OAuth)
  createAuthProvider: async ({
    user_id,
    provider,
    provider_user_id,
    access_token,
    refresh_token,
    token_expires_at,
  }) => {
    await pgPool.query(
      `INSERT INTO auth_providers (user_id, provider, provider_user_id, access_token, refresh_token, token_expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        user_id,
        provider,
        provider_user_id,
        access_token,
        refresh_token,
        token_expires_at,
      ]
    );
  },
};
