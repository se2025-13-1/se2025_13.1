import { ProductRepository } from "./product.repository.js";
import { redisClient } from "../../config/redis.js";

// Hàm hỗ trợ tạo slug (URL friendly)
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
    // 1. Tự động tạo slug nếu thiếu
    if (!payload.slug && payload.name) {
      payload.slug = generateSlug(payload.name) + "-" + Date.now();
    }

    // 2. Gọi Repository (đã bao gồm Transaction lưu Product + Variants + Images)
    // Payload lúc này cần đúng chuẩn: { name, base_price, variants: [], images: [], ... }
    const createdBasic = await ProductRepository.create(payload);

    // 3. Xóa cache danh sách
    if (redisClient) await redisClient.del("products:all");

    // 4. Trả về chi tiết đầy đủ (query lại để lấy đủ cấu trúc variants/images)
    return await ProductRepository.findById(createdBasic.id);
  },

  async getProductDetail(productId) {
    const cacheKey = `product:${productId}:detail`;

    // Check Cache
    if (redisClient) {
      const cached = await redisClient.get(cacheKey);
      if (cached) return JSON.parse(cached);
    }

    // Query DB (Repository mới đã dùng JSON_AGG lấy variants & images)
    const product = await ProductRepository.findById(productId);

    if (!product) return null;

    // Set Cache
    if (redisClient) {
      await redisClient.set(cacheKey, JSON.stringify(product), { EX: 600 }); // 10 phút
    }

    return product;
  },

  async updateProduct(productId, payload) {
    // Lưu ý: Repository.update hiện tại chỉ update bảng 'products' (name, desc, price...)
    // Nếu muốn update variants/images, cần viết thêm logic riêng hoặc API riêng.
    const updated = await ProductRepository.update(productId, payload);

    // Invalidate caches
    if (redisClient) {
      await Promise.all([
        redisClient.del("products:all"),
        redisClient.del(`product:${productId}:detail`),
      ]);
    }

    return await ProductRepository.findById(productId);
  },

  async deleteProduct(productId) {
    // PostgreSQL CASCADE sẽ tự xóa variants và images liên quan
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
      await redisClient.set(cacheKey, JSON.stringify(rows), { EX: 300 }); // 5 phút
    }

    return rows;
  },
};
