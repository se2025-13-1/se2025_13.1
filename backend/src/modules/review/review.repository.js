import { pgPool } from "../../config/postgres.js";

export const ReviewRepository = {
  // 1. Lấy thông tin Order Item để kiểm tra quyền review
  // Phải join nhiều bảng để lấy product_id và check status đơn hàng
  async findOrderItemForValidation(orderItemId, userId) {
    const query = `
      SELECT 
        oi.id, 
        oi.order_id, 
        o.status as order_status, 
        o.user_id,
        v.product_id -- Lấy ID sản phẩm cha từ biến thể
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN product_variants v ON oi.product_variant_id = v.id
      WHERE oi.id = $1 AND o.user_id = $2
    `;
    const res = await pgPool.query(query, [orderItemId, userId]);
    return res.rows[0];
  },

  // 2. Tạo Review
  async create({ userId, productId, orderItemId, rating, comment, images }) {
    const query = `
      INSERT INTO reviews (user_id, product_id, order_item_id, rating, comment, images)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const res = await pgPool.query(query, [
      userId,
      productId,
      orderItemId,
      rating,
      comment,
      images,
    ]);
    return res.rows[0];
  },

  // 3. Tính toán lại điểm trung bình và cập nhật Product (Quan trọng)
  async updateProductStats(productId) {
    const client = await pgPool.connect();
    try {
      // Tính toán
      const calcQuery = `
        SELECT 
          COUNT(*) as count, 
          AVG(rating) as avg 
        FROM reviews 
        WHERE product_id = $1 AND is_approved = true
      `;
      const calcRes = await client.query(calcQuery, [productId]);

      const count = parseInt(calcRes.rows[0].count) || 0;
      const avg = parseFloat(calcRes.rows[0].avg) || 0;

      // Update vào bảng Product
      const updateQuery = `
        UPDATE products 
        SET review_count = $1, rating_average = $2 
        WHERE id = $3
      `;
      await client.query(updateQuery, [count, avg.toFixed(1), productId]);

      return { count, avg };
    } finally {
      client.release();
    }
  },

  // 4. Lấy danh sách Review của sản phẩm (Public)
  async findByProductId(productId, { limit = 10, offset = 0 }) {
    const query = `
      SELECT 
        r.*,
        p.full_name as user_name,
        p.avatar_url as user_avatar,
        -- Lấy thông tin biến thể khách đã mua (Màu/Size) để hiện cho uy tín
        oi.variant_info
      FROM reviews r
      JOIN user_profiles p ON r.user_id = p.user_id
      JOIN order_items oi ON r.order_item_id = oi.id
      WHERE r.product_id = $1 AND r.is_approved = true
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const res = await pgPool.query(query, [productId, limit, offset]);
    return res.rows;
  },
};
