import { pgPool } from "../../config/postgres.js";

export const AddressRepository = {
  // 1. Tạo địa chỉ mới
  async create({
    userId,
    recipientName,
    recipientPhone,
    province,
    district,
    ward,
    addressDetail,
    isDefault,
  }) {
    const client = await pgPool.connect();
    try {
      await client.query("BEGIN");

      // Logic: Nếu đây là địa chỉ đầu tiên của user, tự động set Default = true
      const countRes = await client.query(
        `SELECT COUNT(*) FROM user_addresses WHERE user_id = $1`,
        [userId]
      );
      const isFirst = parseInt(countRes.rows[0].count) === 0;

      const finalIsDefault = isFirst || isDefault;

      // Nếu set là default, thì phải bỏ default của các cái cũ đi
      if (finalIsDefault) {
        await client.query(
          `UPDATE user_addresses SET is_default = false WHERE user_id = $1`,
          [userId]
        );
      }

      const query = `
        INSERT INTO user_addresses 
        (user_id, recipient_name, recipient_phone, province, district, ward, address_detail, is_default)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      const values = [
        userId,
        recipientName,
        recipientPhone,
        province,
        district,
        ward,
        addressDetail,
        finalIsDefault,
      ];
      const res = await client.query(query, values);

      await client.query("COMMIT");
      return res.rows[0];
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  // 2. Lấy danh sách địa chỉ của User
  async findAllByUserId(userId) {
    // Sắp xếp: Mặc định lên đầu, sau đó đến mới nhất
    const query = `
      SELECT * FROM user_addresses 
      WHERE user_id = $1 
      ORDER BY is_default DESC, created_at DESC
    `;
    const res = await pgPool.query(query, [userId]);
    return res.rows;
  },

  // 3. Lấy chi tiết (Phải check cả userId để bảo mật)
  async findById(id, userId) {
    const query = `SELECT * FROM user_addresses WHERE id = $1 AND user_id = $2`;
    const res = await pgPool.query(query, [id, userId]);
    return res.rows[0];
  },

  // 4. Cập nhật địa chỉ
  async update(
    id,
    userId,
    {
      recipientName,
      recipientPhone,
      province,
      district,
      ward,
      addressDetail,
      isDefault,
    }
  ) {
    const client = await pgPool.connect();
    try {
      await client.query("BEGIN");

      // Nếu user muốn set cái này thành default
      if (isDefault === true) {
        await client.query(
          `UPDATE user_addresses SET is_default = false WHERE user_id = $1`,
          [userId]
        );
      }

      const query = `
        UPDATE user_addresses
        SET 
          recipient_name = COALESCE($1, recipient_name),
          recipient_phone = COALESCE($2, recipient_phone),
          province = COALESCE($3, province),
          district = COALESCE($4, district),
          ward = COALESCE($5, ward),
          address_detail = COALESCE($6, address_detail),
          is_default = COALESCE($7, is_default)
        WHERE id = $8 AND user_id = $9
        RETURNING *
      `;
      const values = [
        recipientName,
        recipientPhone,
        province,
        district,
        ward,
        addressDetail,
        isDefault,
        id,
        userId,
      ];
      const res = await client.query(query, values);

      await client.query("COMMIT");
      return res.rows[0];
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  // 5. Xóa địa chỉ
  async delete(id, userId) {
    const query = `DELETE FROM user_addresses WHERE id = $1 AND user_id = $2 RETURNING id`;
    const res = await pgPool.query(query, [id, userId]);
    return res.rows[0];
  },

  // 6. Đặt một địa chỉ làm mặc định (API riêng cho tiện)
  async setDefault(id, userId) {
    const client = await pgPool.connect();
    try {
      await client.query("BEGIN");

      // Reset tất cả về false
      await client.query(
        `UPDATE user_addresses SET is_default = false WHERE user_id = $1`,
        [userId]
      );

      // Set cái được chọn thành true
      const query = `
        UPDATE user_addresses SET is_default = true 
        WHERE id = $1 AND user_id = $2 
        RETURNING *
      `;
      const res = await client.query(query, [id, userId]);

      await client.query("COMMIT");
      return res.rows[0];
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },
};
