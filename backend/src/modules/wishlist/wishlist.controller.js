import { WishlistService } from "./wishlist.service.js";

export const WishlistController = {
  async toggle(req, res) {
    try {
      const userId = req.user.id;
      const { product_id } = req.body;
      const result = await WishlistService.toggleWishlist(userId, product_id);
      return res.json(result); // { is_liked: true/false }
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async list(req, res) {
    try {
      const userId = req.user.id;
      const products = await WishlistService.getMyWishlist(userId);
      return res.json({ products });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async listIds(req, res) {
    try {
      const userId = req.user.id;
      const ids = await WishlistService.getMyWishlistIds(userId);
      return res.json({ ids });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
};
