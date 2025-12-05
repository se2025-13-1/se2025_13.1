import { pgPool } from "../../config/postgres.js";

export const StatisticsRepository = {
  async getDashboardStats() {
    const client = await pgPool.connect();
    try {
      // 1. Tính Tổng Doanh Thu (Chỉ tính đơn thành công)
      // COALESCE để nếu không có đơn nào thì trả về 0 thay vì null
      const revenueQuery = `
        SELECT COALESCE(SUM(total_amount), 0) as total 
        FROM orders 
        WHERE status = 'completed'
      `;

      // 2. Đếm Tổng Đơn Hàng (Tất cả trạng thái)
      const ordersQuery = `SELECT COUNT(*) as total FROM orders`;

      // 3. Đếm Tổng Khách Hàng (Trừ admin ra)
      const usersQuery = `SELECT COUNT(*) as total FROM auth_users WHERE role = 'customer'`;

      // 4. Đếm Sản phẩm sắp hết hàng (Ví dụ: tồn kho < 10)
      const lowStockQuery = `SELECT COUNT(*) as total FROM product_variants WHERE stock_quantity < 10`;

      // Chạy song song 4 câu lệnh
      const [revenueRes, ordersRes, usersRes, lowStockRes] = await Promise.all([
        client.query(revenueQuery),
        client.query(ordersQuery),
        client.query(usersQuery),
        client.query(lowStockQuery),
      ]);

      return {
        total_revenue: Number(revenueRes.rows[0].total),
        total_orders: Number(ordersRes.rows[0].total),
        total_users: Number(usersRes.rows[0].total),
        low_stock_count: Number(lowStockRes.rows[0].total),
      };
    } finally {
      client.release();
    }
  },

  async getRevenueStats(days) {
    const client = await pgPool.connect();
    try {
      const query = `
        SELECT
          TO_CHAR(created_at, 'YYYY-MM-DD') as date,
          SUM(total_amount) as revenue
        FROM orders
        WHERE status = 'completed'
          AND created_at >= NOW() - ($1 || 'day') :: INTERVAL
        GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
        ORDER BY date ASC;
        `;
      const res = await client.query(query, [days]);
      return res.rows;
    } finally {
      client.release();
    }
  },

  async getTopProducts(limit = 5) {
    const client = await pgPool.connect();
    try {
      const bestSellerQuery = `
        SELECT
          p.id,
          p.name,
          p.base_price,
          SUM(oi.quantity) as total_sold,
          (
            SELECT img.url FROM product_images pi
            WHERE pi.product_id = p.id
            ORDER BY (CASE WHEN pi.color_ref IS NULL THEN 0 ELSE 1 END) ASC LIMIT 1
          ) as thumbnail
        FROM order_items oi
        JOIN oders o ON oi.order_id = o.id
        JOIN product_variants pv ON oi.product_variant_id = pv.id
        JOIN products p ON pv.product_id = p.id
        WHERE o.status = 'completed'
        GROUP BY p.id, p.name, p.base_price
        ORDER BY total_sold DESC
        LIMIT $1;
      `;

      const highStockQuery = `
        SELECT 
          p.id, 
          p.name, 
          SUM(pv.stock_quantity) as total_stock,
          (
            SELECT image_url FROM product_images pi 
            WHERE pi.product_id = p.id 
            ORDER BY (CASE WHEN pi.color_ref IS NULL THEN 0 ELSE 1 END) ASC LIMIT 1
          ) as thumbnail
        FROM product_variants pv
        JOIN products p ON pv.product_id = p.id
        GROUP BY p.id, p.name
        ORDER BY total_stock DESC
        LIMIT $1
      `;

      const [bestSellers, highStock] = await Promise.all([
        client.query(bestSellerQuery, [limit]),
        client.query(highStockQuery, [limit]),
      ]);

      return {
        best_sellers: bestSellers.rows,
        high_stock: highStock.rows,
      };
    } finally {
      client.release();
    }
  },
};
