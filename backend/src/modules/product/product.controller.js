// src/modules/product/product.controller.js
import { ProductService } from "./product.service.js";

export const ProductController = {
  async create(req, res) {
    try {
      const payload = req.body;
      const created = await ProductService.createProduct(payload);
      return res
        .status(201)
        .json({ message: "Product created", product: created });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ error: err.message || "Create product failed" });
    }
  },

  async getDetail(req, res) {
    try {
      const { id } = req.params;
      const product = await ProductService.getProductDetail(id);
      if (!product) return res.status(404).json({ error: "Product not found" });
      return res.json({ product });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ error: err.message || "Get product failed" });
    }
  },

  async list(req, res) {
    try {
      const { page = 1, limit = 20, q, category } = req.query;
      const rows = await ProductService.listProducts({
        page: Number(page),
        limit: Number(limit),
        q,
        category,
      });
      return res.json({ products: rows });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ error: err.message || "List products failed" });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      // Accept both product fields and metadata fields in body
      const {
        name,
        sku,
        price,
        discount,
        stock,
        category,
        short_description,
        image_url,
        is_active,
        metadata,
      } = req.body;
      const productPatch = {};
      if (name !== undefined) productPatch.name = name;
      if (sku !== undefined) productPatch.sku = sku;
      if (price !== undefined) productPatch.price = price;
      if (discount !== undefined) productPatch.discount = discount;
      if (stock !== undefined) productPatch.stock = stock;
      if (category !== undefined) productPatch.category = category;
      if (short_description !== undefined)
        productPatch.short_description = short_description;
      if (image_url !== undefined) productPatch.image_url = image_url;
      if (is_active !== undefined) productPatch.is_active = is_active;

      const metadataPatch = metadata || {};

      const updated = await ProductService.updateProduct(id, {
        productPatch,
        metadataPatch,
      });
      return res.json({ message: "Product updated", product: updated });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message || "Update failed" });
    }
  },

  async remove(req, res) {
    try {
      const { id } = req.params;
      const deleted = await ProductService.deleteProduct(id);
      if (!deleted) return res.status(404).json({ error: "Product not found" });
      return res.json({ message: "Product deleted", product: deleted });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message || "Delete failed" });
    }
  },
};
