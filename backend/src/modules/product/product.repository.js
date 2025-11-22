// src/modules/product/product.repository.js
import pgPool from "../../config/postgres.js";

/**
 * Postgres repository for product (basic info)
 */

export const ProductRepository = {
  async create({
    name,
    sku,
    price,
    discount = 0,
    stock = 0,
    category,
    short_description,
    image_url = [],
    is_active = true,
  }) {
    const client = await pgPool.connect();
    try {
      const q = `
        INSERT INTO products
          (name, sku, price, discount, stock, category, short_description, image_url, is_active)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        RETURNING *;
      `;
      const values = [
        name,
        sku,
        price,
        discount,
        stock,
        category,
        short_description,
        image_url,
        is_active,
      ];
      const res = await client.query(q, values);
      return res.rows[0];
    } finally {
      client.release();
    }
  },

  async findById(id) {
    const res = await pgPool.query(`SELECT * FROM products WHERE id = $1`, [
      id,
    ]);
    return res.rows[0] || null;
  },

  async update(id, patch) {
    // build dynamic update
    const fields = [];
    const values = [];
    let idx = 1;
    for (const [k, v] of Object.entries(patch)) {
      fields.push(`${k} = $${idx++}`);
      values.push(v);
    }
    if (fields.length === 0) return await this.findById(id);
    values.push(id);
    const q = `UPDATE products SET ${fields.join(
      ", "
    )}, updated_at = NOW() WHERE id = $${idx} RETURNING *`;
    const res = await pgPool.query(q, values);
    return res.rows[0];
  },

  async delete(id) {
    const res = await pgPool.query(
      `DELETE FROM products WHERE id = $1 RETURNING *`,
      [id]
    );
    return res.rows[0] || null;
  },

  async list({ page = 1, limit = 20, q = null, category = null }) {
    // simple pagination + search by name or SKU
    const offset = (page - 1) * limit;
    const clauses = ["is_active = true"];
    const values = [];
    let idx = 1;
    if (q) {
      clauses.push(`(LOWER(name) LIKE $${idx} OR LOWER(sku) LIKE $${idx})`);
      values.push(`%${q.toLowerCase()}%`);
      idx++;
    }
    if (category) {
      clauses.push(`category = $${idx}`);
      values.push(category);
      idx++;
    }
    values.push(limit, offset);
    const sql = `SELECT * FROM products WHERE ${clauses.join(
      " AND "
    )} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`;
    const res = await pgPool.query(sql, values);
    return res.rows;
  },
};
