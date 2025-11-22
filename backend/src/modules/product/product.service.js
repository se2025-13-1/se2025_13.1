// src/modules/product/product.service.js
import { ProductRepository } from "./product.repository.js";
import { ProductMetaRepository } from "./productMeta.repository.js";
import { redisClient } from "../../config/redis.js"; // optional caching

export const ProductService = {
  async createProduct(payload) {
    // payload: { name, sku, price, discount, stock, category, short_description, image_url, metadata: { tags, images,... } }
    const { metadata = {}, ...productData } = payload;

    // Use PG transaction inside ProductRepository.create if needed; we use single insert then metadata create
    const created = await ProductRepository.create(productData);

    // create metadata document linking to the product id
    await ProductMetaRepository.createForProduct(created.id, metadata);

    // invalidate list cache
    if (redisClient) await redisClient.del("products:all");

    return created;
  },

  async getProductDetail(productId) {
    const cacheKey = `product:${productId}:detail`;
    if (redisClient) {
      const cached = await redisClient.get(cacheKey);
      if (cached) return JSON.parse(cached);
    }

    const product = await ProductRepository.findById(productId);
    if (!product) return null;
    const metadata = await ProductMetaRepository.findByProductId(productId);

    const combined = { ...product, metadata: metadata || null };

    if (redisClient)
      await redisClient.set(cacheKey, JSON.stringify(combined), { EX: 600 });
    return combined;
  },

  async updateProduct(productId, { productPatch = {}, metadataPatch = {} }) {
    // Update Postgres product first
    const updatedProduct = Object.keys(productPatch).length
      ? await ProductRepository.update(productId, productPatch)
      : await ProductRepository.findById(productId);

    // Update metadata in Mongo
    let updatedMeta = null;
    if (Object.keys(metadataPatch).length) {
      updatedMeta = await ProductMetaRepository.updateByProductId(
        productId,
        metadataPatch
      );
    } else {
      updatedMeta = await ProductMetaRepository.findByProductId(productId);
    }

    // invalidate caches
    if (redisClient) {
      await Promise.all([
        redisClient.del("products:all"),
        redisClient.del(`product:${productId}:detail`),
      ]);
    }

    return { ...updatedProduct, metadata: updatedMeta || null };
  },

  async deleteProduct(productId) {
    // Delete product in Postgres
    const deleted = await ProductRepository.delete(productId);
    // Delete metadata in Mongo
    await ProductMetaRepository.deleteByProductId(productId);

    // invalidate cache
    if (redisClient) {
      await Promise.all([
        redisClient.del("products:all"),
        redisClient.del(`product:${productId}:detail`),
      ]);
    }

    return deleted;
  },

  async listProducts(query) {
    // basic list supports pagination + search
    const cacheKey = `products:list:${JSON.stringify(query)}`;
    if (redisClient) {
      const cached = await redisClient.get(cacheKey);
      if (cached) return JSON.parse(cached);
    }

    const rows = await ProductRepository.list(query);

    // Optionally attach small metadata (like first image) by querying Mongo in batch (optional)
    // For simplicity, return rows as-is
    if (redisClient)
      await redisClient.set(cacheKey, JSON.stringify(rows), { EX: 300 });
    return rows;
  },
};
