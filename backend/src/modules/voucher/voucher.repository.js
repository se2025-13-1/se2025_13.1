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

  // 2. Tìm voucher theo ID
  async findById(id) {
    const query = `SELECT * FROM vouchers WHERE id = $1`;
    const res = await pgPool.query(query, [id]);
    return res.rows[0];
  },

  // 3. Lấy tất cả vouchers
  async findAll() {
    const query = `
      SELECT * FROM vouchers 
      ORDER BY created_at DESC
    `;
    const res = await pgPool.query(query);
    return res.rows;
  },

  // 4. Tạo voucher mới
  async create(data) {
    const {
      code,
      description,
      discount_type,
      discount_value,
      min_order_value,
      max_discount_amount,
      start_date,
      end_date,
      usage_limit,
    } = data;

    const query = `
      INSERT INTO vouchers (
        code, description, discount_type, discount_value,
        min_order_value, max_discount_amount, start_date, end_date,
        usage_limit, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
      RETURNING *
    `;

    const res = await pgPool.query(query, [
      code,
      description,
      discount_type,
      discount_value,
      min_order_value,
      max_discount_amount,
      start_date,
      end_date,
      usage_limit,
    ]);

    return res.rows[0];
  },

  // 5. Cập nhật voucher
  async update(id, data) {
    const updates = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = [
      "code",
      "description",
      "discount_type",
      "discount_value",
      "min_order_value",
      "max_discount_amount",
      "start_date",
      "end_date",
      "usage_limit",
      "is_active",
    ];

    for (const [key, value] of Object.entries(data)) {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (updates.length === 0) return null;

    values.push(id);
    const query = `
      UPDATE vouchers 
      SET ${updates.join(", ")}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const res = await pgPool.query(query, values);
    return res.rows[0];
  },

  // 6. Xóa voucher
  async delete(id) {
    const query = `DELETE FROM vouchers WHERE id = $1 RETURNING id`;
    const res = await pgPool.query(query, [id]);
    return res.rows[0];
  },

  // 7. Tăng số lượt dùng (Gọi khi đặt hàng thành công)
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
