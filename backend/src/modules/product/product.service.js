import { ProductRepository } from "./product.repository.js";
import { redisClient } from "../../config/redis.js";

const generateSlug = (name) => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
};

export const ProductService = {
  async createProduct(payload) {
    // 1. Validate cơ bản
    if (!Array.isArray(payload.variants)) payload.variants = [];
    if (!Array.isArray(payload.images)) payload.images = [];

    // 2. Tự động tạo slug
    if (!payload.slug && payload.name) {
      payload.slug = generateSlug(payload.name) + "-" + Date.now();
    }

    // 3. Gọi Repository
    const createdBasic = await ProductRepository.create(payload);

    // 4. Xóa cache
    if (redisClient) await redisClient.del("products:all");

    // 5. Trả về chi tiết
    return await ProductRepository.findById(createdBasic.id);
  },

  async getProductDetail(productId) {
    const cacheKey = `product:${productId}:detail`;

    if (redisClient) {
      const cached = await redisClient.get(cacheKey);
      if (cached) return JSON.parse(cached);
    }

    const product = await ProductRepository.findById(productId);

    if (!product) return null;

    if (redisClient) {
      await redisClient.set(cacheKey, JSON.stringify(product), { EX: 600 });
    }

    return product;
  },

  async updateProduct(productId, payload) {
    const updated = await ProductRepository.update(productId, payload);

    if (redisClient) {
      await Promise.all([
        redisClient.del("products:all"),
        redisClient.del(`product:${productId}:detail`),
      ]);
    }

    return await ProductRepository.findById(productId);
  },

  async deleteProduct(productId) {
    const deleted = await ProductRepository.delete(productId);

    if (deleted && redisClient) {
      await Promise.all([
        redisClient.del("products:all"),
        redisClient.del(`product:${productId}:detail`),
      ]);
    }

    return deleted;
  },

  async listProducts(query) {
    const cacheKey = `products:list:${JSON.stringify(query)}`;

    if (redisClient) {
      const cached = await redisClient.get(cacheKey);
      if (cached) return JSON.parse(cached);
    }

    const rows = await ProductRepository.list(query);

    if (redisClient) {
      await redisClient.set(cacheKey, JSON.stringify(rows), { EX: 300 });
    }

    return rows;
  },
};
