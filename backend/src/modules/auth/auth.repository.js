import { pgPool } from "../../config/postgres.js";

export const userRepository = {
  findByEmail: async (email) => {
    const res = await pgPool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    return res.rows[0];
  },

  createUser: async ({ name, email, password_hash, phone }) => {
    const res = await pgPool.query(
      `INSERT INTO users (name, email, password_hash, phone, role, is_verified, created_at)
       VALUES ($1, $2, $3, $4, 'user', false, NOW())
       RETURNING id, name, email, phone, is_verified`,
      [name, email, password_hash, phone]
    );
    return res.rows[0];
  },

  verifyUser: async (email) => {
    await pgPool.query(
      `UPDATE users SET is_verified = true, updated_at = NOW() WHERE email = $1`,
      [email]
    );
  },

  deleteUnverifiedUser: async (email) => {
    await pgPool.query(
      `DELETE FROM users WHERE email = $1 AND is_verified = false`,
      [email]
    );
  },

  findProvider: async (provider, providerUserId) => {
    const res = await pgPool.query(
      `SELECT * FROM auth_providers WHERE provider = $1 AND provider_user_id = $2`,
      [provider, providerUserId]
    );
    return res.rows[0];
  },

  linkProvider: async ({
    user_id,
    provider,
    provider_user_id,
    access_token,
    refresh_token,
    token_expires_at,
  }) => {
    const res = await pgPool.query(
      `INSERT INTO auth_providers (user_id, provider, provider_user_id, access_token, refresh_token, token_expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        user_id,
        provider,
        provider_user_id,
        access_token,
        refresh_token,
        token_expires_at,
      ]
    );
    return res.rows[0];
  },
};
