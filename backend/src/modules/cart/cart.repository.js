import { pgPool } from "../../config/postgres.js";

export const CartRepository = {
  // 1. Tìm hoặc Tạo giỏ hàng cho User
  async findOrCreateCart(userId) {
    const client = await pgPool.connect();
    try {
      // Tìm giỏ hàng cũ
      const findQuery = `SELECT * FROM carts WHERE user_id = $1`;
      const res = await client.query(findQuery, [userId]);

      if (res.rows.length > 0) return res.rows[0];

      // Nếu chưa có -> Tạo mới
      const createQuery = `
        INSERT INTO carts (user_id) VALUES ($1) RETURNING *
      `;
      const newCart = await client.query(createQuery, [userId]);
      return newCart.rows[0];
    } finally {
      client.release();
    }
  },

  // 2. Lấy chi tiết giỏ hàng (Kèm thông tin sản phẩm)
  async getCartDetails(cartId) {
    const query = `
      SELECT 
        ci.id as item_id,
        ci.quantity,
        ci.product_variant_id,
        v.sku, v.color, v.size, v.price, v.stock_quantity,
        p.id as product_id, p.name as product_name, p.slug,
        (
          SELECT image_url FROM product_images pi 
          WHERE pi.product_id = p.id 
          AND (pi.color_ref = v.color OR pi.color_ref IS NULL)
          ORDER BY pi.display_order ASC LIMIT 1
        ) as thumbnail
      FROM cart_items ci
      JOIN product_variants v ON ci.product_variant_id = v.id
      JOIN products p ON v.product_id = p.id
      WHERE ci.cart_id = $1
      ORDER BY ci.created_at DESC
    `;
    const res = await pgPool.query(query, [cartId]);
    return res.rows;
  },

  // 3. Thêm sản phẩm (Upsert: Có rồi thì tăng số lượng, chưa có thì thêm mới)
  async addItem(cartId, variantId, quantity) {
    const query = `
      INSERT INTO cart_items (cart_id, product_variant_id, quantity)
      VALUES ($1, $2, $3)
      ON CONFLICT (cart_id, product_variant_id)
      DO UPDATE SET quantity = cart_items.quantity + $3, updated_at = NOW()
      RETURNING *
    `;
    const res = await pgPool.query(query, [cartId, variantId, quantity]);
    return res.rows[0];
  },

  // 4. Cập nhật số lượng (Set cứng số lượng)
  async updateQuantity(itemId, quantity) {
    const query = `
      UPDATE cart_items SET quantity = $1, updated_at = NOW()
      WHERE id = $2 RETURNING *
    `;
    const res = await pgPool.query(query, [quantity, itemId]);
    return res.rows[0];
  },

  // 5. Xóa sản phẩm khỏi giỏ
  async removeItem(itemId) {
    const query = `DELETE FROM cart_items WHERE id = $1 RETURNING id`;
    const res = await pgPool.query(query, [itemId]);
    return res.rows[0];
  },

  // 6. Xóa toàn bộ giỏ (Dùng khi Checkout xong)
  async clearCart(cartId) {
    await pgPool.query(`DELETE FROM cart_items WHERE cart_id = $1`, [cartId]);
  },

  // Helper: Lấy thông tin tồn kho của biến thể
  async getVariantStock(variantId) {
    const res = await pgPool.query(
      `SELECT stock_quantity, price FROM product_variants WHERE id = $1`,
      [variantId]
    );
    return res.rows[0];
  },

  async getCartDetailsByUserId(userId) {
    const query = `
    SELECT 
      ci.id as item_id,
      ci.quantity,
      ci.product_variant_id,
      v.price, v.stock_quantity, v.sku, v.color, v.size,
      p.name as product_name,
      (
        SELECT image_url FROM product_images pi 
        WHERE pi.product_id = p.id 
        AND (pi.color_ref = v.color OR pi.color_ref IS NULL)
        ORDER BY (CASE WHEN pi.color_ref IS NULL THEN 0 ELSE 1 END) ASC LIMIT 1
      ) as thumbnail
    FROM cart_items ci
    JOIN carts c ON ci.cart_id = c.id
    JOIN product_variants v ON ci.product_variant_id = v.id
    JOIN products p ON v.product_id = p.id
    WHERE c.user_id = $1
  `;
    const res = await pgPool.query(query, [userId]);
    return res.rows;
  },
};
