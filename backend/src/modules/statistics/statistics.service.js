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
};
