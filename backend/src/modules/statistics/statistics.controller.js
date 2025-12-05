import { StatisticsService } from "./statistics.service.js";

export const StatisticsController = {
  async getDashboard(req, res) {
    try {
      const stats = await StatisticsService.getGeneralStats();
      return res.json({
        message: "Lấy thống kê thành công",
        data: stats,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  },

  async getRevenueChart(req, res) {
    try {
      const { range } = req.query;
      const data = await StatisticsService.getRevenueChart(range || 7);
      return res.json({ data });
    } catch (err) {
      return res.status(500).json({ err: message });
    }
  },

  async getTopProducts(req, res) {
    try {
      const data = await StatisticsService.getTopProducts();
      return res.json({ data });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async getOrderStatus(req, res) {
    try {
      const data = await StatisticsService.getOrderStatusStats();
      return res.json({ data });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
};
