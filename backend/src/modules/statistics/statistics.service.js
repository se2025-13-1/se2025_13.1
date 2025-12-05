import { StatisticsRepository } from "./statistics.repository.js";
import { redisClient } from "../../config/redis.js";

export const StatisticsService = {
  async getGeneralStats() {
    const cacheKey = "stats:dashboard:general";

    // 1. Kiểm tra Cache
    if (redisClient) {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
    }

    // 2. Nếu không có Cache, gọi DB
    const stats = await StatisticsRepository.getDashboardStats();

    // 3. Lưu Cache (TTL: 300 giây = 5 phút)
    if (redisClient) {
      await redisClient.set(cacheKey, JSON.stringify(stats), { EX: 300 });
    }

    return stats;
  },

  async getRevenueChart(range = 7) {
    const day = parseInt(range);
    const cacheKey = `stats:revenue:${day}`;

    if (redisClient) {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    const rawData = await StatisticsRepository.getRevenueStats(day);

    const fullData = [];
    const today = new Date();

    for (let i = day - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);

      const dateString = d.toISOString().split("T")[0];

      const found = rawData.find((item) => item.date === dateString);

      fullData.push({
        date: dateString,
        revenue: found ? Number(found.revenue) : 0,
      });
    }

    if (redisClient) {
      await redisClient.set(cacheKey, JSON.stringify(fullData), { EX: 600 });
    }

    return fullData;
  },
};
