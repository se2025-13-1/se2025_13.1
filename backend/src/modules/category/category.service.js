import { CategoryRepository } from "./category.repository.js";
import { redisClient } from "../../config/redis.js";

// Hàm tạo slug (tái sử dụng)
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
};

// Hàm đệ quy xây dựng cây danh mục
const buildCategoryTree = (categories, parentId = null) => {
  const categoryList = [];
  let category;

  if (parentId == null) {
    // Lấy các node gốc (không có cha)
    category = categories.filter((cat) => cat.parent_id == null);
  } else {
    // Lấy các node con của parentId
    category = categories.filter((cat) => cat.parent_id == parentId);
  }

  for (let cat of category) {
    categoryList.push({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      image_url: cat.image_url,
      parent_id: cat.parent_id,
      children: buildCategoryTree(categories, cat.id), // Đệ quy tìm con
    });
  }
  return categoryList;
};

export const CategoryService = {
  async createCategory(payload) {
    if (!payload.slug && payload.name) {
      payload.slug = generateSlug(payload.name);
    }

    const newCat = await CategoryRepository.create(payload);

    // Xóa cache để user thấy danh mục mới ngay
    if (redisClient) await redisClient.del("categories:tree");

    return newCat;
  },

  // Lấy danh sách dạng Cây (Cho Menu App)
  async getCategoryTree() {
    // 1. Check Cache
    if (redisClient) {
      const cached = await redisClient.get("categories:tree");
      if (cached) return JSON.parse(cached);
    }

    // 2. Lấy toàn bộ danh sách phẳng từ DB
    const flatCategories = await CategoryRepository.findAll();

    // 3. Xử lý thuật toán dựng cây
    const tree = buildCategoryTree(flatCategories);

    // 4. Lưu Cache (TTL lâu hơn product vì danh mục ít đổi, ví dụ 1 tiếng)
    if (redisClient) {
      await redisClient.set("categories:tree", JSON.stringify(tree), {
        EX: 3600,
      });
    }

    return tree;
  },

  // Lấy danh sách phẳng (Cho Admin dropdown chọn cha)
  async getFlatList() {
    return await CategoryRepository.findAll();
  },

  async updateCategory(id, payload) {
    if (payload.name && !payload.slug) {
      payload.slug = generateSlug(payload.name);
    }

    const updated = await CategoryRepository.update(id, payload);

    if (redisClient) await redisClient.del("categories:tree");
    return updated;
  },

  async deleteCategory(id) {
    const deleted = await CategoryRepository.delete(id);

    if (redisClient) await redisClient.del("categories:tree");
    return deleted;
  },
};
