import { pgPool } from "../../config/postgres.js";

export const ProductRepository = {
  // Tạo sản phẩm + Biến thể + Ảnh trong 1 Transaction
  async create(payload) {
    const {
      name,
      slug,
      category_id,
      description,
      base_price,
      is_active = true,
      variants = [], // Array: [{ color, size, sku, price, stock_quantity }]
      images = [], // Array: [{ image_url, color_ref, display_order }]
    } = payload;

    const client = await pgPool.connect();

    try {
      await client.query("BEGIN"); // Bắt đầu giao dịch

      // 1. Insert Product
      const insertProductQuery = `
        INSERT INTO products (name, slug, category_id, description, base_price, is_active)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, name, created_at;
      `;
      const productRes = await client.query(insertProductQuery, [
        name,
        slug, // Bạn nên xử lý slug generation ở Service hoặc Client
        category_id,
        description,
        base_price,
        is_active,
      ]);
      const productId = productRes.rows[0].id;

      // 2. Insert Variants (Nếu có)
      if (variants.length > 0) {
        const variantQuery = `
          INSERT INTO product_variants (product_id, sku, color, size, price, stock_quantity)
          VALUES ($1, $2, $3, $4, $5, $6)
        `;
        for (const v of variants) {
          // Nếu variant không có giá riêng, dùng base_price
          const varPrice = v.price || base_price;
          await client.query(variantQuery, [
            productId,
            v.sku,
            v.color,
            v.size,
            varPrice,
            v.stock_quantity || 0,
          ]);
        }
      }

      // 3. Insert Images (Nếu có)
      if (images.length > 0) {
        const imageQuery = `
          INSERT INTO product_images (product_id, image_url, color_ref, display_order)
          VALUES ($1, $2, $3, $4)
        `;
        for (const [index, img] of images.entries()) {
          await client.query(imageQuery, [
            productId,
            img.image_url,
            img.color_ref || null, // null nghĩa là ảnh chung
            img.display_order || index,
          ]);
        }
      }

      await client.query("COMMIT"); // Xác nhận thành công

      // Trả về ID để service query lại chi tiết
      return productRes.rows[0];
    } catch (err) {
      await client.query("ROLLBACK"); // Nếu lỗi thì hoàn tác sạch sẽ
      throw err;
    } finally {
      client.release();
    }
  },

  // Lấy chi tiết kèm Variants và Images (Dùng JSON Aggregation)
  async findById(id) {
    const query = `
      SELECT 
        p.*,
        c.name as category_name,
        (
          SELECT json_agg(json_build_object(
            'id', pv.id,
            'sku', pv.sku,
            'color', pv.color,
            'size', pv.size,
            'price', pv.price,
            'stock', pv.stock_quantity
          ))
          FROM product_variants pv 
          WHERE pv.product_id = p.id
        ) as variants,
        (
          SELECT json_agg(json_build_object(
            'id', pi.id,
            'url', pi.image_url,
            'color', pi.color_ref,
            'sort', pi.display_order
          ) ORDER BY pi.display_order ASC)
          FROM product_images pi 
          WHERE pi.product_id = p.id
        ) as images
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1
    `;

    const res = await pgPool.query(query, [id]);
    return res.rows[0] || null;
  },

  // Update sản phẩm (Cơ bản là update info, nâng cao cần xử lý variants riêng)
  async update(id, payload) {
    const { name, description, base_price, is_active, category_id } = payload;

    // Chỉ update thông tin cơ bản của Product
    // (Việc update variants/images nên làm API riêng hoặc logic phức tạp hơn check ID)
    const fields = [];
    const values = [];
    let idx = 1;

    if (name) {
      fields.push(`name = $${idx++}`);
      values.push(name);
    }
    if (description) {
      fields.push(`description = $${idx++}`);
      values.push(description);
    }
    if (base_price) {
      fields.push(`base_price = $${idx++}`);
      values.push(base_price);
    }
    if (is_active !== undefined) {
      fields.push(`is_active = $${idx++}`);
      values.push(is_active);
    }
    if (category_id) {
      fields.push(`category_id = $${idx++}`);
      values.push(category_id);
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const query = `
      UPDATE products 
      SET ${fields.join(", ")}, updated_at = NOW() 
      WHERE id = $${idx} 
      RETURNING *
    `;

    const res = await pgPool.query(query, values);
    return res.rows[0];
  },

  async delete(id) {
    // Nhờ ON DELETE CASCADE ở schema, variants và images sẽ tự bay màu
    const res = await pgPool.query(
      `DELETE FROM products WHERE id = $1 RETURNING id`,
      [id]
    );
    return res.rows[0] || null;
  },

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

    // Query này lấy sản phẩm và ẢNH ĐẦU TIÊN để hiển thị thumbnail list
    const sql = `
      SELECT 
        p.id, p.name, p.slug, p.base_price, p.category_id,
        c.name as category_name,
        (
          SELECT image_url FROM product_images pi 
          WHERE pi.product_id = p.id 
          ORDER BY pi.display_order ASC LIMIT 1
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
};
