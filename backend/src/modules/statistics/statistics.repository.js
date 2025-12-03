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
};
