import { ProductService } from "./product.service.js";

export const ProductController = {
  async create(req, res) {
    try {
      // Map data từ request sang schema DB mới
      const payload = {
        name: req.body.name,
        slug: req.body.slug, // Có thể null, service tự lo
        description: req.body.description || req.body.short_description,
        base_price:
          req.body.base_price !== undefined
            ? req.body.base_price
            : req.body.price, // Frontend gửi 'price', DB lưu 'base_price'
        category_id: req.body.category_id || req.body.category, // Hỗ trợ cả 2 key
        is_active: req.body.is_active,

        // Mảng quan trọng
        variants: req.body.variants || [], // [{color, size, sku, stock_quantity...}]
        images: req.body.images || [], // [{image_url, color_ref...}]
      };

      const created = await ProductService.createProduct(payload);

      return res.status(201).json({
        message: "Product created successfully",
        product: created,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        error: err.message || "Create product failed",
      });
    }
  },

  async getDetail(req, res) {
    try {
      const { id } = req.params;
      const product = await ProductService.getProductDetail(id);

      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      return res.json({ product });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Get product failed" });
    }
  },

  async list(req, res) {
    try {
      const { page = 1, limit = 20, q, category, category_id } = req.query;

      const rows = await ProductService.listProducts({
        page: Number(page),
        limit: Number(limit),
        q,
        category_id: category_id || category, // Mapping query param cũ
      });

      return res.json({ products: rows });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "List products failed" });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const body = req.body;

      // Chỉ lấy các field cho phép update ở bảng products
      const payload = {};
      if (body.name) payload.name = body.name;
      if (body.description || body.short_description)
        payload.description = body.description || body.short_description;
      if (body.base_price !== undefined) payload.base_price = body.base_price;
      if (body.is_active !== undefined) payload.is_active = body.is_active;
      if (body.category || body.category_id)
        payload.category_id = body.category_id || body.category;

      // Note: Hiện tại chưa hỗ trợ update Variants/Images qua API này
      // vì logic diff variants khá phức tạp.

      const updated = await ProductService.updateProduct(id, payload);

      if (!updated) {
        return res
          .status(404)
          .json({ error: "Product not found or update failed" });
      }

      return res.json({
        message: "Product updated",
        product: updated,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message || "Update failed" });
    }
  },

  async remove(req, res) {
    try {
      const { id } = req.params;
      const deleted = await ProductService.deleteProduct(id);

      if (!deleted) {
        return res.status(404).json({ error: "Product not found" });
      }

      return res.json({
        message: "Product deleted",
        product_id: deleted.id,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Delete failed" });
    }
  },
};
