import { ProductRepository } from "./product.repository.js";
import { redisClient } from "../../config/redis.js";

const generateSlug = (name) => {
  // Bảng ánh xạ ký tự tiếng Việt sang không dấu
  const vietnameseMap = {
    á: "a",
    à: "a",
    ả: "a",
    ã: "a",
    ạ: "a",
    ă: "a",
    ắ: "a",
    ằ: "a",
    ẳ: "a",
    ẵ: "a",
    ặ: "a",
    â: "a",
    ấ: "a",
    ầ: "a",
    ẩ: "a",
    ẫ: "a",
    ậ: "a",
    é: "e",
    è: "e",
    ẻ: "e",
    ẽ: "e",
    ẹ: "e",
    ê: "e",
    ế: "e",
    ề: "e",
    ễ: "e",
    ệ: "e",
    í: "i",
    ì: "i",
    ỉ: "i",
    ĩ: "i",
    ị: "i",
    ó: "o",
    ò: "o",
    ỏ: "o",
    õ: "o",
    ọ: "o",
    ô: "o",
    ố: "o",
    ồ: "o",
    ổ: "o",
    ỗ: "o",
    ộ: "o",
    ơ: "o",
    ớ: "o",
    ờ: "o",
    ởa: "o",
    ỡ: "o",
    ợ: "o",
    ú: "u",
    ù: "u",
    ủ: "u",
    ũ: "u",
    ụ: "u",
    ư: "u",
    ứ: "u",
    ừ: "u",
    ử: "u",
    ữ: "u",
    ự: "u",
    ý: "y",
    ỳ: "y",
    ỷ: "y",
    ỹ: "y",
    ỵ: "y",
    đ: "d",
    Á: "a",
    À: "a",
    Ả: "a",
    Ã: "a",
    Ạ: "a",
    Ă: "a",
    Ắ: "a",
    Ằ: "a",
    Ẳ: "a",
    Ẵ: "a",
    Ặ: "a",
    Â: "a",
    Ấ: "a",
    Ầ: "a",
    Ẩ: "a",
    Ẫ: "a",
    Ậ: "a",
    É: "e",
    È: "e",
    Ẻ: "e",
    Ẽ: "e",
    Ẹ: "e",
    Ê: "e",
    Ế: "e",
    Ề: "e",
    Ễ: "e",
    Ệ: "e",
    Í: "i",
    Ì: "i",
    Ỉ: "i",
    Ĩ: "i",
    Ị: "i",
    Ó: "o",
    Ò: "o",
    Ỏ: "o",
    Õ: "o",
    Ọ: "o",
    Ô: "o",
    Ố: "o",
    Ồ: "o",
    Ổ: "o",
    Ỗ: "o",
    Ộ: "o",
    Ơ: "o",
    Ớ: "o",
    Ờ: "o",
    Ở: "o",
    Ỡ: "o",
    Ợ: "o",
    Ú: "u",
    Ù: "u",
    Ủ: "u",
    Ũ: "u",
    Ụ: "u",
    Ư: "u",
    Ứ: "u",
    Ừ: "u",
    Ử: "u",
    Ữ: "u",
    Ự: "u",
    Ý: "y",
    Ỳ: "y",
    Ỷ: "y",
    Ỹ: "y",
    Ỵ: "y",
    Đ: "d",
  };

  // Chuyển từng ký tự theo bảng ánh xạ
  let slug = name
    .split("")
    .map((char) => vietnameseMap[char] || char)
    .join("")
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return slug;
};

export const ProductService = {
  async createProduct(payload) {
    // 1. Chuẩn hóa input
    if (!Array.isArray(payload.variants)) payload.variants = [];
    if (!Array.isArray(payload.images)) payload.images = [];

    // 2. VALIDATE LOGIC MỚI: Kiểm tra tính hợp lệ của màu ảnh
    // Lấy danh sách các màu có trong variants (VD: Set{'Red', 'Blue'})
    const validColors = new Set(
      payload.variants.map((v) => v.color).filter((c) => c)
    );

    for (const img of payload.images) {
      // Nếu ảnh có gán màu, mà màu đó không có trong danh sách biến thể -> Báo lỗi
      if (img.color_ref && !validColors.has(img.color_ref)) {
        throw new Error(
          `Ảnh gán màu '${img.color_ref}' không khớp với bất kỳ biến thể nào.`
        );
      }
    }

    // 3. Tạo Slug
    if (!payload.slug && payload.name) {
      payload.slug = generateSlug(payload.name) + "-" + Date.now();
    }

    // 4. Gọi Repo
    const createdBasic = await ProductRepository.create(payload);

    // 5. Xóa Cache
    if (redisClient) await redisClient.del("products:all");

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

  async searchProducts(query) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const offset = (page - 1) * limit;

    console.log(`[SEARCH] Query params:`, {
      keyword: query.q,
      sort_by: query.sort_by,
      sort_order: query.sort_order,
      limit,
      offset,
    });

    // Tạo Cache Key dựa trên tham số tìm kiếm
    // VD: products:search:{"q":"ao","min_price":"100"}
    const cacheKey = `products:search:${JSON.stringify(query)}`;

    if (redisClient) {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        console.log(`[SEARCH] Cache hit for key: ${cacheKey}`);
        return JSON.parse(cached);
      }
    }

    const { products, total } = await ProductRepository.searchAndFilter({
      keyword: query.q, // ?q=...
      category_id: query.category_id,
      min_price: query.min_price,
      max_price: query.max_price,
      min_rating: query.rating, // ?rating=4
      sort_by: query.sort_by, // ?sort_by=price
      sort_order: query.sort_order, // ?sort_order=asc
      limit,
      offset,
    });

    console.log(`[SEARCH] Found ${products.length} products, total: ${total}`);
    console.log(
      `[SEARCH] Products:`,
      products.map((p) => ({
        id: p.id,
        name: p.name,
        is_active: p.is_active,
        created_at: p.created_at,
        sold_count: p.sold_count,
      }))
    );

    const result = {
      data: products,
      pagination: {
        page,
        limit,
        total_items: total,
        total_pages: Math.ceil(total / limit),
      },
    };

    // Cache ngắn hạn (60s) vì giá và tồn kho có thể đổi
    if (redisClient) {
      await redisClient.set(cacheKey, JSON.stringify(result), { EX: 60 });
    }

    return result;
  },

  async fixAllSlugs() {
    const allProducts = await ProductRepository.list({});
    let fixedCount = 0;

    for (const product of allProducts) {
      const newSlug = generateSlug(product.name) + "-" + product.id.slice(0, 8);

      if (newSlug !== product.slug) {
        await ProductRepository.update(product.id, { slug: newSlug });
        fixedCount++;
      }
    }

    // Xóa cache
    if (redisClient) await redisClient.del("products:all");

    return { message: `Fixed ${fixedCount} slugs` };
  },
};
