import { OrderRepository } from "./order.repository.js";
import { CartRepository } from "../cart/cart.repository.js";
import { ProductRepository } from "../product/product.repository.js";
import { AddressRepository } from "../address/address.repository.js";

export const OrderService = {
  async createOrder(userId, payload) {
    const {
      addressId,
      paymentMethod,
      note,
      voucherCode,
      orderType,
      selectedCartItemIds,
      buyNowItems,
    } = payload;

    // 1. Lấy thông tin địa chỉ (Snapshot)
    const address = await AddressRepository.findById(addressId, userId);
    if (!address) throw new Error("Địa chỉ không hợp lệ");

    // Format lại địa chỉ để lưu snapshot gọn gàng
    const addressSnapshot = {
      name: address.recipient_name,
      phone: address.recipient_phone,
      full_address: `${address.address_detail}, ${address.ward}, ${address.district}, ${address.province}`,
    };

    // 2. Chuẩn hóa danh sách hàng cần mua
    let checkoutItems = [];

    if (orderType === "buy_now") {
      // --- MUA NGAY ---
      if (!buyNowItems || buyNowItems.length === 0)
        throw new Error("Không có sản phẩm để mua");

      const variants = await ProductRepository.findVariantsByIds(
        buyNowItems.map((i) => i.variant_id)
      );

      checkoutItems = variants.map((v) => {
        const reqItem = buyNowItems.find((i) => i.variant_id === v.id);
        return {
          product_variant_id: v.id,
          quantity: reqItem.quantity,
          unit_price: Number(v.price),
          product_name: v.product_name,
          variant_info: { color: v.color, size: v.size },
          stock: v.stock_quantity,
          thumbnail: v.thumbnail,
        };
      });
    } else {
      // --- MUA TỪ GIỎ ---
      const cartItems = await CartRepository.getCartDetailsByUserId(userId);

      if (selectedCartItemIds && selectedCartItemIds.length > 0) {
        // Mua một phần
        checkoutItems = cartItems.filter((item) =>
          selectedCartItemIds.includes(item.item_id)
        );
        if (checkoutItems.length !== selectedCartItemIds.length)
          throw new Error("Sản phẩm chọn không khớp trong giỏ");
      } else {
        // Mua tất cả
        checkoutItems = cartItems;
      }

      // Map lại cấu trúc cho thống nhất
      checkoutItems = checkoutItems.map((item) => ({
        product_variant_id: item.product_variant_id,
        quantity: item.quantity,
        unit_price: Number(item.price),
        product_name: item.product_name,
        variant_info: { color: item.color, size: item.size },
        stock: item.stock_quantity,
        thumbnail: item.thumbnail,
      }));
    }

    if (checkoutItems.length === 0) throw new Error("Danh sách sản phẩm trống");

    // 3. Tính toán tiền nong
    let subtotal = 0;
    const orderItemsData = checkoutItems.map((item) => {
      const total = item.unit_price * item.quantity;
      subtotal += total;
      return { ...item, total_price: total };
    });

    const shippingFee = 30000; // Hardcode tạm, sau này tính theo API GHN/GHTK
    const discountAmount = 0; // Logic voucher làm sau
    const totalAmount = subtotal + shippingFee - discountAmount;

    // 4. Gọi Repository Transaction
    return await OrderRepository.createTransaction({
      userId,
      addressSnapshot,
      financials: { subtotal, shippingFee, discountAmount, totalAmount },
      paymentMethod,
      note,
      items: orderItemsData,
      cleanupCart: orderType === "cart",
      cartItemIdsToDelete: orderType === "cart" ? selectedCartItemIds : null,
    });
  },

  async getMyOrders(userId, query) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const offset = (page - 1) * limit;
    return await OrderRepository.findByUserId(userId, { limit, offset });
  },

  async getOrderDetail(orderId, userId) {
    const order = await OrderRepository.findById(orderId, userId);
    if (!order) throw new Error("Đơn hàng không tìm thấy");
    return order;
  },

  async cancelOrder(orderId, userId) {
    return await OrderRepository.cancelOrder(orderId, userId);
  },
};
