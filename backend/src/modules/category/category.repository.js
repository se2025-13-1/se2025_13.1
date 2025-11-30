import { pgPool } from "../../config/postgres.js";

export const CategoryRepository = {
  // Tạo danh mục mới
  async create({ name, slug, parent_id, image_url }) {
    const query = `
      INSERT INTO categories (name, slug, parent_id, image_url)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const res = await pgPool.query(query, [
      name,
      slug,
      parent_id || null,
      image_url,
    ]);
    return res.rows[0];
  },

  // Lấy toàn bộ danh sách (Flat list - Dạng phẳng)
  async findAll() {
    const query = `SELECT * FROM categories ORDER BY created_at ASC`;
    const res = await pgPool.query(query);
    return res.rows;
  },

  // Lấy chi tiết 1 danh mục
  async findById(id) {
    const query = `SELECT * FROM categories WHERE id = $1`;
    const res = await pgPool.query(query, [id]);
    return res.rows[0];
  },

  // Cập nhật
  async update(id, { name, slug, parent_id, image_url }) {
    // Dùng COALESCE để giữ giá trị cũ nếu không truyền lên
    const query = `
      UPDATE categories
      SET 
        name = COALESCE($1, name),
        slug = COALESCE($2, slug),
        parent_id = COALESCE($3, parent_id),
        image_url = COALESCE($4, image_url)
      WHERE id = $5
      RETURNING *
    `;
    const res = await pgPool.query(query, [
      name,
      slug,
      parent_id,
      image_url,
      id,
    ]);
    return res.rows[0];
  },

  // Xóa
  async delete(id) {
    const query = `DELETE FROM categories WHERE id = $1 RETURNING id`;
    const res = await pgPool.query(query, [id]);
    return res.rows[0];
  },
};
