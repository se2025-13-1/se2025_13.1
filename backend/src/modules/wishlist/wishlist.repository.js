import { pgPool } from "../../config/postgres.js";

export const WishlistRepository = {
  // 1. Toggle (Thêm/Xóa) - Giữ nguyên logic
  async toggle(userId, productId) {
    const client = await pgPool.connect();
    try {
      // Check tồn tại
      const checkRes = await client.query(
        `SELECT * FROM wishlists WHERE user_id = $1 AND product_id = $2`,
        [userId, productId]
      );

      if (checkRes.rows.length > 0) {
        // Có rồi -> Xóa (Unlike)
        await client.query(
          `DELETE FROM wishlists WHERE user_id = $1 AND product_id = $2`,
          [userId, productId]
        );
        return { is_liked: false };
      } else {
        // Chưa có -> Thêm (Like)
        await client.query(
          `INSERT INTO wishlists (user_id, product_id) VALUES ($1, $2)`,
          [userId, productId]
        );
        return { is_liked: true };
      }
    } finally {
      client.release();
    }
  },

  // 2. Lấy danh sách (Quan trọng: Xử lý Hết hàng/Ngừng kinh doanh)
  async getList(userId) {
    const query = `
      SELECT 
        p.id, 
        p.name, 
        p.base_price, 
        p.is_active, 
        
        (
          SELECT image_url FROM product_images pi 
          WHERE pi.product_id = p.id 
          ORDER BY (CASE WHEN pi.color_ref IS NULL THEN 0 ELSE 1 END) ASC LIMIT 1
        ) as thumbnail,

        (
          SELECT COALESCE(SUM(stock_quantity), 0) 
          FROM product_variants pv 
          WHERE pv.product_id = p.id
        ) as total_stock

      FROM wishlists w
      JOIN products p ON w.product_id = p.id
      WHERE w.user_id = $1
      ORDER BY w.created_at DESC
    `;
    const res = await pgPool.query(query, [userId]);
    return res.rows;
  },

  // 3. Lấy danh sách ID (để tô đỏ trái tim ở trang chủ)
  async getWishlistIds(userId) {
    const res = await pgPool.query(
      `SELECT product_id FROM wishlists WHERE user_id = $1`,
      [userId]
    );
    return res.rows.map((row) => row.product_id);
  },
};
