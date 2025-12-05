import { WishlistRepository } from "./wishlist.repository.js";

export const WishlistService = {
  async toggleWishlist(userId, productId) {
    return await WishlistRepository.toggle(userId, productId);
  },

  async getMyWishlist(userId) {
    return await WishlistRepository.getList(userId);
  },

  async getMyWishlistIds(userId) {
    return await WishlistRepository.getWishlistIds(userId);
  },
};
