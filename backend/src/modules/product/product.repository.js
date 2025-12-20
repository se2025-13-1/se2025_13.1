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
        p.rating_average,
        p.review_count,
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

  async update(id, payload) {
    const { name, description, base_price, is_active, category_id } = payload;

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
    // Hard Delete: Xóa toàn bộ product, variants, images, reviews, etc.
    // Vì có ON DELETE CASCADE, xóa product sẽ tự xóa child records
    const query = `
      DELETE FROM products 
      WHERE id = $1 
      RETURNING id
    `;

    const res = await pgPool.query(query, [id]);
    return res.rows[0] || null;
  },

  async findVariantsByIds(variantIds) {
    if (variantIds.length === 0) return [];
    const query = `
    SELECT 
      v.id, v.price, v.stock_quantity, v.sku, v.color, v.size,
      p.name as product_name,
      (
        SELECT image_url FROM product_images pi 
        WHERE pi.product_id = p.id 
        AND (pi.color_ref = v.color OR pi.color_ref IS NULL)
        ORDER BY (CASE WHEN pi.color_ref IS NULL THEN 0 ELSE 1 END) ASC LIMIT 1
      ) as thumbnail
    FROM product_variants v
    JOIN products p ON v.product_id = p.id
    WHERE v.id = ANY($1::uuid[])
  `;
    const res = await pgPool.query(query, [variantIds]);
    return res.rows;
  },

  async searchAndFilter({
    keyword,
    category_id,
    min_price,
    max_price,
    min_rating,
    sort_by,
    sort_order,
    limit = 20,
    offset = 0,
  }) {
    const client = await pgPool.connect();
    try {
      // 1. Khởi tạo điều kiện cơ bản
      const conditions = ["p.is_active = true"];
      const values = [];
      let idx = 1;

      // 2. Xây dựng điều kiện động (Dynamic Where)

      // Tìm theo tên hoặc slug (Keyword) - sử dụng unaccent để tìm không dấu
      if (keyword) {
        conditions.push(
          `(unaccent(p.name) ILIKE unaccent($${idx}) OR unaccent(p.slug) ILIKE unaccent($${idx}))`
        );
        values.push(`%${keyword}%`);
        idx++;
      }

      // Lọc theo danh mục
      if (category_id) {
        conditions.push(`p.category_id = $${idx}`);
        values.push(category_id);
        idx++;
      }

      // Lọc theo khoảng giá
      if (min_price) {
        conditions.push(`p.base_price >= $${idx}`);
        values.push(min_price);
        idx++;
      }
      if (max_price) {
        conditions.push(`p.base_price <= $${idx}`);
        values.push(max_price);
        idx++;
      }

      // Lọc theo đánh giá (VD: 4 sao trở lên)
      if (min_rating) {
        conditions.push(`p.rating_average >= $${idx}`);
        values.push(min_rating);
        idx++;
      }

      // 3. Xử lý Sắp xếp (Sorting)
      let orderByClause = "ORDER BY p.created_at DESC"; // Mặc định: Mới nhất

      if (sort_by) {
        const direction = sort_order === "asc" ? "ASC" : "DESC";
        switch (sort_by) {
          case "price":
            orderByClause = `ORDER BY p.base_price ${direction}`;
            break;
          case "rating":
            orderByClause = `ORDER BY p.rating_average ${direction}`;
            break;

          // 👇 SỬA CASE NÀY: Dùng cột sold_count trực tiếp
          case "sold":
            orderByClause = `ORDER BY p.sold_count ${direction}`;
            break;

          case "name":
            orderByClause = `ORDER BY p.name ${direction}`;
            break;
        }
      }

      // 4. Ghép câu lệnh SQL
      const whereClause =
        conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

      // Query lấy dữ liệu (Chỉ lấy thông tin cơ bản, variants và images sẽ join riêng)
      const dataQuery = `
        SELECT 
          p.id, p.name, p.slug, p.base_price, p.rating_average, p.review_count, p.is_active, p.sold_count,
          c.name as category_name,
          (
            SELECT image_url FROM product_images pi 
            WHERE pi.product_id = p.id AND pi.color_ref IS NULL
            LIMIT 1
          ) as thumbnail
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ${whereClause}
        ${orderByClause}
        LIMIT $${idx} OFFSET $${idx + 1}
      `;

      // Query đếm tổng (để phân trang)
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM products p 
        ${whereClause}
      `;

      // Chạy song song 2 query
      const [dataRes, countRes] = await Promise.all([
        client.query(dataQuery, [...values, limit, offset]),
        client.query(countQuery, values),
      ]);

      // Nếu có products, lấy variants và images riêng
      let products = dataRes.rows;
      if (products.length > 0) {
        const productIds = products.map((p) => p.id);

        // Lấy tất cả variants của các product này
        const variantsRes = await client.query(
          `SELECT product_id, id, sku, color, size, price, stock_quantity 
           FROM product_variants 
           WHERE product_id = ANY($1)
           ORDER BY product_id`,
          [productIds]
        );

        // Lấy tất cả images của các product này
        const imagesRes = await client.query(
          `SELECT product_id, id, image_url, color_ref, display_order 
           FROM product_images 
           WHERE product_id = ANY($1)
           ORDER BY product_id, 
            (CASE WHEN color_ref IS NULL THEN 0 ELSE 1 END) ASC,
            display_order ASC`,
          [productIds]
        );

        // Map variants và images vào products
        const variantsByProduct = {};
        const imagesByProduct = {};

        variantsRes.rows.forEach((v) => {
          if (!variantsByProduct[v.product_id])
            variantsByProduct[v.product_id] = [];
          variantsByProduct[v.product_id].push({
            id: v.id,
            sku: v.sku,
            color: v.color,
            size: v.size,
            price: v.price,
            stock_quantity: v.stock_quantity,
          });
        });

        imagesRes.rows.forEach((img) => {
          if (!imagesByProduct[img.product_id])
            imagesByProduct[img.product_id] = [];
          imagesByProduct[img.product_id].push({
            id: img.id,
            image_url: img.image_url,
            color_ref: img.color_ref,
            display_order: img.display_order,
          });
        });

        // Gắn variants và images vào products
        products = products.map((p) => ({
          ...p,
          variants: variantsByProduct[p.id] || [],
          images: imagesByProduct[p.id] || [],
        }));
      }

      return {
        products,
        total: parseInt(countRes.rows[0].total),
      };
    } finally {
      client.release();
    }
  },
};
