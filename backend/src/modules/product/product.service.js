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
      payload.slug = generateSlug(payload.name);
    }

    // 4. Gọi Repo
    const createdBasic = await ProductRepository.create(payload);

    // 5. Xóa Cache - Xóa tất cả cache liên quan đến products
    if (redisClient) {
      // Xóa cache list cơ bản
      await redisClient.del("products:all");

      // Xóa tất cả cache search patterns
      const searchKeys = await redisClient.keys("products:search:*");
      if (searchKeys.length > 0) {
        await redisClient.del(searchKeys);
      }

      // Xóa cache list patterns
      const listKeys = await redisClient.keys("products:list:*");
      if (listKeys.length > 0) {
        await redisClient.del(listKeys);
      }
    }

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
    // Nếu cập nhật tên mà không có slug, tự động tạo slug từ tên mới
    if (payload.name && !payload.slug) {
      payload.slug = generateSlug(payload.name);
    }

    const updated = await ProductRepository.update(productId, payload);

    if (redisClient) {
      // Xóa cache chi tiết sản phẩm
      await redisClient.del(`product:${productId}:detail`);

      // Xóa cache list cơ bản
      await redisClient.del("products:all");

      // Xóa tất cả cache search patterns
      const searchKeys = await redisClient.keys("products:search:*");
      if (searchKeys.length > 0) {
        await redisClient.del(searchKeys);
      }

      // Xóa cache list patterns
      const listKeys = await redisClient.keys("products:list:*");
      if (listKeys.length > 0) {
        await redisClient.del(listKeys);
      }
    }

    return await ProductRepository.findById(productId);
  },

  async deleteProduct(productId) {
    const deleted = await ProductRepository.delete(productId);

    if (deleted && redisClient) {
      // Xóa cache chi tiết sản phẩm
      await redisClient.del(`product:${productId}:detail`);

      // Xóa cache list cơ bản
      await redisClient.del("products:all");

      // Xóa tất cả cache search patterns
      const searchKeys = await redisClient.keys("products:search:*");
      if (searchKeys.length > 0) {
        await redisClient.del(searchKeys);
      }

      // Xóa cache list patterns
      const listKeys = await redisClient.keys("products:list:*");
      if (listKeys.length > 0) {
        await redisClient.del(listKeys);
      }
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

    // Xóa cache - Xóa tất cả cache liên quan đến products
    if (redisClient) {
      // Xóa cache list cơ bản
      await redisClient.del("products:all");

      // Xóa tất cả cache search patterns
      const searchKeys = await redisClient.keys("products:search:*");
      if (searchKeys.length > 0) {
        await redisClient.del(searchKeys);
      }

      // Xóa cache list patterns
      const listKeys = await redisClient.keys("products:list:*");
      if (listKeys.length > 0) {
        await redisClient.del(listKeys);
      }
    }

    return { message: `Fixed ${fixedCount} slugs` };
  },
};
