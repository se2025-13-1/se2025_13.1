import { pgPool } from "../../config/postgres.js";

export const OrderRepository = {
  // 1. Tạo đơn hàng (Transaction lớn)
  async createTransaction({
    userId,
    addressSnapshot,
    financials,
    paymentMethod,
    note,
    items,
    cleanupCart,
    cartItemIdsToDelete,
  }) {
    const client = await pgPool.connect();
    try {
      await client.query("BEGIN");

      // BƯỚC 1: Tạo Order
      const insertOrderQuery = `
        INSERT INTO orders 
        (user_id, shipping_info, subtotal_amount, shipping_fee, discount_amount, total_amount, payment_method, note, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
        RETURNING id, created_at
      `;
      const orderValues = [
        userId,
        JSON.stringify(addressSnapshot), // Lưu cứng địa chỉ
        financials.subtotal,
        financials.shippingFee,
        financials.discountAmount,
        financials.totalAmount,
        paymentMethod,
        note,
      ];
      const orderRes = await client.query(insertOrderQuery, orderValues);
      const orderId = orderRes.rows[0].id;

      // BƯỚC 2: Xử lý từng sản phẩm (Tạo Order Item + Trừ kho)
      for (const item of items) {
        // 2.1 Trừ tồn kho (Giữ nguyên code cũ)
        const updateStockQuery = `
          UPDATE product_variants 
          SET stock_quantity = stock_quantity - $1
          WHERE id = $2 AND stock_quantity >= $1
          RETURNING id, product_id -- 👈 Lấy thêm product_id để update sold_count
        `;
        const stockRes = await client.query(updateStockQuery, [
          item.quantity,
          item.product_variant_id,
        ]);

        if (stockRes.rows.length === 0) {
          throw new Error(`Sản phẩm ${item.product_name} không đủ hàng.`);
        }

        const productId = stockRes.rows[0].product_id;

        // 👇 2.1.5 (MỚI): Tăng số lượng đã bán cho Sản phẩm cha
        await client.query(
          `UPDATE products SET sold_count = sold_count + $1 WHERE id = $2`,
          [item.quantity, productId]
        );

        // 2.2 Tạo Order Item
        const insertItemQuery = `
          INSERT INTO order_items 
          (order_id, product_variant_id, product_name, variant_info, quantity, unit_price, total_price)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        await client.query(insertItemQuery, [
          orderId,
          item.product_variant_id,
          item.product_name,
          JSON.stringify(item.variant_info), // Lưu cứng màu/size
          item.quantity,
          item.unit_price,
          item.total_price,
        ]);
      }

      // BƯỚC 3: Dọn dẹp giỏ hàng (Nếu mua từ giỏ)
      if (cleanupCart) {
        if (cartItemIdsToDelete && cartItemIdsToDelete.length > 0) {
          // Xóa một phần (Partial Checkout)
          await client.query(
            `DELETE FROM cart_items WHERE id = ANY($1::uuid[])`,
            [cartItemIdsToDelete]
          );
        } else {
          // Xóa tất cả (Buy All)
          await client.query(
            `DELETE FROM cart_items WHERE cart_id = (SELECT id FROM carts WHERE user_id = $1)`,
            [userId]
          );
        }
      }

      await client.query("COMMIT");
      return { id: orderId, ...financials, status: "pending" };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  // 2. Lấy danh sách đơn hàng của User
  async findByUserId(userId, { limit = 10, offset = 0 }) {
    const query = `
      SELECT id, total_amount, status, created_at, shipping_info->>'recipient_name' as recipient_name
      FROM orders 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `;
    const res = await pgPool.query(query, [userId, limit, offset]);
    return res.rows;
  },

  // 3. Lấy chi tiết đơn hàng (Kèm items)
  async findById(orderId, userId) {
    // Lấy thông tin chung
    const orderQuery = `SELECT * FROM orders WHERE id = $1 AND user_id = $2`;
    const orderRes = await pgPool.query(orderQuery, [orderId, userId]);
    if (orderRes.rows.length === 0) return null;

    // Lấy items
    const itemsQuery = `
      SELECT 
        oi.*, 
        (
          SELECT image_url FROM product_images pi 
          JOIN product_variants pv ON pv.product_id = pi.product_id
          WHERE pv.id = oi.product_variant_id 
          ORDER BY (CASE WHEN pi.color_ref IS NULL THEN 0 ELSE 1 END) ASC LIMIT 1
        ) as thumbnail
      FROM order_items oi 
      WHERE oi.order_id = $1
    `;
    const itemsRes = await pgPool.query(itemsQuery, [orderId]);

    return { ...orderRes.rows[0], items: itemsRes.rows };
  },

  // 4. Hủy đơn hàng (Chỉ khi còn pending)
  async cancelOrder(orderId, userId) {
    const client = await pgPool.connect();
    try {
      await client.query("BEGIN");

      // Check trạng thái
      const checkQuery = `SELECT status FROM orders WHERE id = $1 AND user_id = $2 FOR UPDATE`;
      const checkRes = await client.query(checkQuery, [orderId, userId]);

      if (checkRes.rows.length === 0) throw new Error("Đơn hàng không tồn tại");
      if (checkRes.rows[0].status !== "pending")
        throw new Error("Chỉ có thể hủy đơn hàng đang chờ xử lý");

      // Cập nhật status
      await client.query(
        `UPDATE orders SET status = 'cancelled', updated_at = NOW() WHERE id = $1`,
        [orderId]
      );

      // Hoàn lại tồn kho (Quan trọng)
      const itemsQuery = `SELECT product_variant_id, quantity FROM order_items WHERE order_id = $1`;
      const itemsRes = await client.query(itemsQuery, [orderId]);

      for (const item of itemsRes.rows) {
        await client.query(
          `UPDATE product_variants SET stock_quantity = stock_quantity + $1 WHERE id = $2`,
          [item.quantity, item.product_variant_id]
        );
      }

      await client.query(
        `UPDATE products SET sold_count = sold_count - $1 WHERE id = $2`,
        [item.quantity, item.product_id]
      );
      return { message: "Đã hủy đơn hàng thành công" };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  async findAll({ limit = 20, offset = 0 }) {
    const query = `
      SELECT 
        o.id, 
        o.total_amount, 
        o.status, 
        o.created_at, 
        o.shipping_info, -- Lấy thông tin người nhận từ JSONB
        u.email as user_email -- Lấy thêm email người đặt
      FROM orders o
      LEFT JOIN auth_users u ON o.user_id = u.id
      ORDER BY o.created_at DESC 
      LIMIT $1 OFFSET $2
    `;
    const res = await pgPool.query(query, [limit, offset]);
    return res.rows;
  },
};
