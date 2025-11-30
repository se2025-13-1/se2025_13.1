import { CategoryService } from "./category.service.js";

export const CategoryController = {
  async create(req, res) {
    try {
      const { name, parent_id, image_url } = req.body;
      if (!name) return res.status(400).json({ error: "Name is required" });

      const category = await CategoryService.createCategory({
        name,
        parent_id,
        image_url,
      });
      return res.status(201).json({ message: "Category created", category });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async getTree(req, res) {
    try {
      const tree = await CategoryService.getCategoryTree();
      return res.json({ categories: tree });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async getFlat(req, res) {
    try {
      const list = await CategoryService.getFlatList();
      return res.json({ categories: list });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const updated = await CategoryService.updateCategory(id, req.body);
      if (!updated)
        return res.status(404).json({ error: "Category not found" });
      return res.json({ message: "Category updated", category: updated });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async remove(req, res) {
    try {
      const { id } = req.params;
      const deleted = await CategoryService.deleteCategory(id);
      if (!deleted)
        return res.status(404).json({ error: "Category not found" });
      return res.json({ message: "Category deleted" });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
};
