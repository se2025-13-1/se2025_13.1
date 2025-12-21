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

  async search(req, res) {
    try {
      // req.query chứa: { q, category_id, min_price, sort_by, page, limit ... }
      const result = await ProductService.searchProducts(req.query);
      return res.json(result);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const body = req.body;

      // Map data từ request
      const payload = {
        name: body.name,
        slug: body.slug,
        description: body.description || body.short_description,
        base_price:
          body.base_price !== undefined ? body.base_price : body.price,
        category_id: body.category_id || body.category,
        is_active: body.is_active !== undefined ? body.is_active : undefined,
        variants: body.variants || [], // [{id?, color, size, sku, price, stock_quantity}]
        images: body.images || [], // [{id?, image_url, color_ref, display_order}]
      };

      const updated = await ProductService.updateProduct(id, payload);

      if (!updated) {
        return res
          .status(404)
          .json({ error: "Product not found or update failed" });
      }

      return res.json({
        message: "Product updated successfully",
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

  async fixAllSlugs(req, res) {
    try {
      const result = await ProductService.fixAllSlugs();
      return res.json(result);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message || "Fix slugs failed" });
    }
  },
};
