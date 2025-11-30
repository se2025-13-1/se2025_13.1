import { pgPool } from "../../config/postgres.js";

export const ProductRepository = {
  // 1. Create (Giữ nguyên logic Transaction, chỉ cần đảm bảo nhận đúng payload)
  async create(payload) {
    const {
      name,
      slug,
      category_id,
      description,
      base_price,
      is_active = true,
      variants = [],
      images = [],
    } = payload;

    const client = await pgPool.connect();
    try {
      await client.query("BEGIN");

      // Insert Product
      const insertProductQuery = `
        INSERT INTO products (name, slug, category_id, description, base_price, is_active)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, name;
      `;
      const productRes = await client.query(insertProductQuery, [
        name,
        slug,
        category_id,
        description,
        base_price,
        is_active,
      ]);
      const productId = productRes.rows[0].id;

      // Insert Variants
      if (variants.length > 0) {
        const variantQuery = `
          INSERT INTO product_variants (product_id, sku, color, size, price, stock_quantity)
          VALUES ($1, $2, $3, $4, $5, $6)
        `;
        for (const v of variants) {
          await client.query(variantQuery, [
            productId,
            v.sku,
            v.color,
            v.size,
            v.price || base_price,
            v.stock_quantity || 0,
          ]);
        }
      }

      // Insert Images
      if (images.length > 0) {
        const imageQuery = `
          INSERT INTO product_images (product_id, image_url, color_ref, display_order)
          VALUES ($1, $2, $3, $4)
        `;
        for (const [index, img] of images.entries()) {
          await client.query(imageQuery, [
            productId,
            img.image_url,
            img.color_ref || null, // Quan trọng: Frontend gửi null nếu là ảnh chung
            img.display_order || index,
          ]);
        }
      }

      await client.query("COMMIT");
      return productRes.rows[0];
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  // 2. FindById (Cập nhật: Sắp xếp ảnh chung lên đầu)
  async findById(id) {
    const query = `
      SELECT 
        p.*,
        c.name as category_name,
        COALESCE((
          SELECT json_agg(json_build_object(
            'id', pv.id, 'sku', pv.sku, 'color', pv.color, 'size', pv.size, 
            'price', pv.price, 'stock', pv.stock_quantity
          ))
          FROM product_variants pv WHERE pv.product_id = p.id
        ), '[]'::json) as variants,
        
        COALESCE((
          SELECT json_agg(json_build_object(
            'id', pi.id, 'url', pi.image_url, 'color', pi.color_ref, 'sort', pi.display_order
          ) ORDER BY 
            -- 👇 LOGIC MỚI: Ảnh chung (null) lên đầu (0), ảnh màu xuống dưới (1)
            (CASE WHEN pi.color_ref IS NULL THEN 0 ELSE 1 END) ASC,
            pi.display_order ASC
          )
          FROM product_images pi WHERE pi.product_id = p.id
        ), '[]'::json) as images

      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1
    `;
    const res = await pgPool.query(query, [id]);
    return res.rows[0] || null;
  },

  // 3. List (Cập nhật: Thumbnail ưu tiên ảnh chung)
  async list({ page = 1, limit = 20, q = null, category_id = null }) {
    const offset = (page - 1) * limit;
    const clauses = ["p.is_active = true"];
    const values = [];
    let idx = 1;

    if (q) {
      clauses.push(`(LOWER(p.name) LIKE $${idx})`);
      values.push(`%${q.toLowerCase()}%`);
      idx++;
    }
    if (category_id) {
      clauses.push(`p.category_id = $${idx}`);
      values.push(category_id);
      idx++;
    }

    values.push(limit, offset);

    const sql = `
      SELECT 
        p.id, p.name, p.slug, p.base_price, p.category_id,
        c.name as category_name,
        (
          SELECT image_url FROM product_images pi 
          WHERE pi.product_id = p.id 
          ORDER BY 
            -- 👇 LOGIC MỚI: Ưu tiên lấy ảnh chung làm thumbnail
            (CASE WHEN pi.color_ref IS NULL THEN 0 ELSE 1 END) ASC,
            pi.display_order ASC 
          LIMIT 1
        ) as thumbnail
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${clauses.join(" AND ")}
      ORDER BY p.created_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `;

    const res = await pgPool.query(sql, values);
    return res.rows;
  },

  // ... (Các hàm update, delete giữ nguyên)
  async update(id, payload) {
    /* ...Code cũ... */ return this.findById(id);
  },
  async delete(id) {
    /* ...Code cũ... */
  },
};
