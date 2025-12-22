import { StatisticsRepository } from "./statistics.repository.js";
import { redisClient } from "../../config/redis.js";

export const StatisticsService = {
  async getGeneralStats(bypassCache = false) {
    const cacheKey = "stats:dashboard:general";

    // 1. Kiểm tra Cache (trừ khi bypassCache = true)
    if (!bypassCache && redisClient) {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        console.log("✅ Cache hit for dashboard stats");
        return JSON.parse(cachedData);
      }
    }

    console.log("🔄 Cache miss or bypassed, fetching from database...");

    // 2. Nếu không có Cache, gọi DB
    const stats = await StatisticsRepository.getDashboardStats();

    // 3. Lưu Cache (TTL: 60 giây = 1 phút, để data fresher)
    if (redisClient) {
      await redisClient.set(cacheKey, JSON.stringify(stats), { EX: 60 });
      console.log("💾 Cached dashboard stats for 1 minute");
    }

    return stats;
  },

  // Clear cache khi cần (gọi sau khi update order status)
  async clearDashboardCache() {
    const cacheKey = "stats:dashboard:general";
    if (redisClient) {
      await redisClient.del(cacheKey);
      console.log("🧹 Cleared dashboard cache");
    }
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

  async getTopProducts() {
    const cacheKey = "stats:top-products";

    if (redisClient) {
      const cached = await redisClient.get(cacheKey);
      if (cached) return JSON.parse(cached);
    }

    // Lấy Top 5
    const data = await StatisticsRepository.getTopProducts(5);

    // Cache 10 phút (600s)
    if (redisClient) {
      await redisClient.set(cacheKey, JSON.stringify(data), { EX: 600 });
    }

    return data;
  },

  async getOrderStatusStats() {
    const cacheKey = "stats:order-status";

    if (redisClient) {
      const cached = await redisClient.get(cacheKey);
      if (cached) return JSON.parse(cached);
    }

    const rawData = await StatisticsRepository.getOrderStatusStats();

    // 1. Định nghĩa bộ khung chuẩn (để đảm bảo luôn trả về đủ các trạng thái)
    const formattedData = {
      pending: 0,
      confirmed: 0,
      shipping: 0,
      completed: 0,
      cancelled: 0,
      returned: 0,
    };

    // 2. Map dữ liệu từ DB vào bộ khung
    rawData.forEach((item) => {
      // item.status là key, item.count là value
      if (formattedData.hasOwnProperty(item.status)) {
        formattedData[item.status] = Number(item.count);
      }
    });

    // 3. Chuyển đổi sang dạng Mảng để Frontend dễ vẽ biểu đồ (Recharts/ChartJS)
    // Output: [{ name: 'Pending', value: 10 }, ...]
    const chartData = Object.keys(formattedData).map((key) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1), // Viết hoa chữ cái đầu (Pending)
      value: formattedData[key],
      status_key: key, // Giữ key gốc để Frontend dùng nếu cần logic màu sắc
    }));

    // Cache 5 phút
    if (redisClient) {
      await redisClient.set(cacheKey, JSON.stringify(chartData), { EX: 300 });
    }

    return chartData;
  },
};
