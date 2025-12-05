import { pgPool } from "../../config/postgres.js";

export const VoucherRepository = {
  // 1. Tìm voucher bằng Code (để validate)
  async findByCode(code) {
    const query = `
      SELECT * FROM vouchers 
      WHERE code = $1 
      AND is_active = true
    `;
    const res = await pgPool.query(query, [code]);
    return res.rows[0];
  },

  // 2. Tăng số lượt dùng (Gọi khi đặt hàng thành công)
  // Trả về null nếu hết lượt dùng (Concurrency safe)
  async incrementUsage(id) {
    const query = `
      UPDATE vouchers 
      SET used_count = used_count + 1 
      WHERE id = $1 
      AND used_count < usage_limit
      RETURNING id
    `;
    const res = await pgPool.query(query, [id]);
    return res.rows[0];
  },
};
