// src/modules/product/productMeta.repository.js
import ProductMetadata from "../../models/ProductMetadata.js";

/**
 * Mongo repository for product metadata
 */

export const ProductMetaRepository = {
  async createForProduct(productId, meta = {}) {
    const payload = {
      productId,
      tags: meta.tags || [],
      specifications: meta.specifications || {},
      images: meta.images || [],
      relatedProducts: meta.relatedProducts || [],
      seo: meta.seo || {},
    };
    return ProductMetadata.create(payload);
  },

  async findByProductId(productId) {
    return ProductMetadata.findOne({ productId }).lean();
  },

  async updateByProductId(productId, patch) {
    // use upsert to create if missing
    return ProductMetadata.findOneAndUpdate(
      { productId },
      { $set: patch },
      { new: true, upsert: true }
    ).lean();
  },

  async deleteByProductId(productId) {
    return ProductMetadata.deleteOne({ productId });
  },
};
