import { OrderService } from "./order.service.js";

export const OrderController = {
  async create(req, res) {
    try {
      const userId = req.user.id;
      const {
        address_id,
        payment_method,
        note,
        voucher_code,
        type,
        cart_item_ids,
        items,
      } = req.body;

      if (!address_id)
        return res
          .status(400)
          .json({ error: "Vui lòng chọn địa chỉ giao hàng" });

      const order = await OrderService.createOrder(userId, {
        addressId: address_id,
        paymentMethod: payment_method || "cod",
        note,
        voucherCode: voucher_code,
        orderType: type || "cart",
        selectedCartItemIds: cart_item_ids,
        buyNowItems: items,
      });

      return res.status(201).json({ message: "Đặt hàng thành công", order });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  },

  async list(req, res) {
    try {
      const userId = req.user.id;
      const orders = await OrderService.getMyOrders(userId, req.query);
      return res.json({ orders });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async detail(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const order = await OrderService.getOrderDetail(id, userId);
      return res.json({ order });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async cancel(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const result = await OrderService.cancelOrder(id, userId);
      return res.json(result);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  },

  async complete(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const result = await OrderService.completeOrder(id, userId);
      return res.json(result);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  },

  async listAll(req, res) {
    try {
      const orders = await OrderService.getAllOrders(req.query);
      return res.json({ orders });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async detailAdmin(req, res) {
    try {
      const { id } = req.params;
      const order = await OrderService.getOrderDetailAdmin(id);
      return res.json({ order });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
};
