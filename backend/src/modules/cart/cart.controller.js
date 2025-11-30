import { CartService } from "./cart.service.js";

export const CartController = {
  async getCart(req, res) {
    try {
      const userId = req.user.id;
      const cart = await CartService.getMyCart(userId);
      return res.json(cart);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async add(req, res) {
    try {
      const userId = req.user.id;
      const { variant_id, quantity } = req.body;

      if (!variant_id)
        return res.status(400).json({ error: "Thiếu variant_id" });

      await CartService.addToCart(userId, {
        variant_id,
        quantity: quantity || 1,
      });

      // Trả về giỏ hàng mới nhất để Frontend cập nhật UI
      const cart = await CartService.getMyCart(userId);
      return res.json({ message: "Đã thêm vào giỏ", cart });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const userId = req.user.id;
      const { item_id } = req.params; // ID của dòng trong cart_items
      const { quantity } = req.body;

      await CartService.updateItem(userId, { item_id, quantity });

      const cart = await CartService.getMyCart(userId);
      return res.json({ message: "Đã cập nhật số lượng", cart });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  },

  async remove(req, res) {
    try {
      const userId = req.user.id;
      const { item_id } = req.params;

      await CartService.removeItem(item_id);

      const cart = await CartService.getMyCart(userId);
      return res.json({ message: "Đã xóa sản phẩm", cart });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
};
