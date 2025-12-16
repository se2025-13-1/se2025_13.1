import { pgPool } from "../../config/postgres.js";

export const NotificationRepository = {
  // 1. Lưu/Cập nhật Token thiết bị (Upsert)
  async registerDevice(userId, token, platform) {
    const query = `
      INSERT INTO user_devices (user_id, fcm_token, platform, updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (fcm_token) 
      DO UPDATE SET user_id = $1, updated_at = NOW()
    `;
    await pgPool.query(query, [userId, token, platform]);
  },

  // 2. Lấy danh sách Token của 1 User (để gửi push)
  async getUserTokens(userId) {
    const res = await pgPool.query(
      `SELECT fcm_token FROM user_devices WHERE user_id = $1`,
      [userId]
    );
    return res.rows.map((r) => r.fcm_token);
  },

  // 3. Xóa Token (khi logout hoặc token chết)
  async removeDevice(token) {
    await pgPool.query(`DELETE FROM user_devices WHERE fcm_token = $1`, [
      token,
    ]);
  },

  // 4. Tạo thông báo mới vào DB
  async create({ userId, title, body, type, data }) {
    const query = `
      INSERT INTO notifications (user_id, title, body, type, data)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const res = await pgPool.query(query, [
      userId,
      title,
      body,
      type,
      JSON.stringify(data),
    ]);
    return res.rows[0];
  },

  // 5. Lấy danh sách thông báo của User
  async listByUser(userId, limit = 20, offset = 0) {
    const query = `
      SELECT * FROM notifications 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `;
    const res = await pgPool.query(query, [userId, limit, offset]);
    return res.rows;
  },

  // 6. Đếm số thông báo chưa đọc
  async countUnread(userId) {
    const res = await pgPool.query(
      `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false`,
      [userId]
    );
    return parseInt(res.rows[0].count);
  },

  // 7. Đánh dấu đã đọc
  async markAsRead(id, userId) {
    await pgPool.query(
      `UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
  },
};
