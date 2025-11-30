import { CartRepository } from "./cart.repository.js";

export const CartService = {
  // Lấy giỏ hàng của User
  async getMyCart(userId) {
    const cart = await CartRepository.findOrCreateCart(userId);
    const items = await CartRepository.getCartDetails(cart.id);

    // Tính tổng tiền tạm tính
    let totalAmount = 0;
    const formattedItems = items.map((item) => {
      const subtotal = Number(item.price) * item.quantity;
      totalAmount += subtotal;
      return { ...item, subtotal };
    });

    return {
      cart_id: cart.id,
      items: formattedItems,
      total_amount: totalAmount,
    };
  },

  // Thêm vào giỏ
  async addToCart(userId, { variant_id, quantity }) {
    const qty = parseInt(quantity);
    if (qty <= 0) throw new Error("Số lượng phải lớn hơn 0");

    // 1. Check tồn kho
    const variant = await CartRepository.getVariantStock(variant_id);
    if (!variant) throw new Error("Sản phẩm không tồn tại");

    // Lưu ý: Logic chuẩn là phải check (số lượng trong giỏ + số lượng thêm) <= tồn kho
    // Nhưng ở đây check đơn giản trước
    if (variant.stock_quantity < qty) {
      throw new Error(`Chỉ còn ${variant.stock_quantity} sản phẩm trong kho`);
    }

    const cart = await CartRepository.findOrCreateCart(userId);
    return await CartRepository.addItem(cart.id, variant_id, qty);
  },

  // Cập nhật số lượng
  async updateItem(userId, { item_id, quantity }) {
    const qty = parseInt(quantity);
    if (qty <= 0) return await CartRepository.removeItem(item_id); // Về 0 thì xóa luôn

    // Cần check tồn kho ở đây nữa (Nâng cao)

    return await CartRepository.updateQuantity(item_id, qty);
  },

  // Xóa sản phẩm
  async removeItem(item_id) {
    return await CartRepository.removeItem(item_id);
  },
};
