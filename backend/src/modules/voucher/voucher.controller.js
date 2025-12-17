import { VoucherService } from "./voucher.service.js";

export const VoucherController = {
  // Public: Check voucher validity
  async check(req, res) {
    try {
      const { code, total_amount } = req.body;

      if (!code || !total_amount) {
        return res
          .status(400)
          .json({ error: "Thiếu mã code hoặc tổng tiền đơn hàng" });
      }

      const result = await VoucherService.validateAndCalculate(
        code,
        total_amount
      );

      return res.json({
        message: "Mã hợp lệ",
        data: result,
      });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  },

  // Admin: Get all vouchers
  async getAll(req, res) {
    try {
      const vouchers = await VoucherService.getAllVouchers();
      return res.json({ vouchers });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  // Admin: Get single voucher
  async getOne(req, res) {
    try {
      const { id } = req.params;
      const voucher = await VoucherService.getVoucherById(id);
      if (!voucher) {
        return res.status(404).json({ error: "Voucher not found" });
      }
      return res.json({ voucher });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  // Admin: Create voucher
  async create(req, res) {
    try {
      const {
        code,
        description,
        discount_type,
        discount_value,
        min_order_value,
        max_discount_amount,
        start_date,
        end_date,
        usage_limit,
      } = req.body;

      if (!code || !discount_type || !discount_value) {
        return res
          .status(400)
          .json({ error: "Code, discount_type, discount_value are required" });
      }

      const voucher = await VoucherService.createVoucher({
        code: code.toUpperCase(),
        description,
        discount_type,
        discount_value,
        min_order_value: min_order_value || 0,
        max_discount_amount,
        start_date,
        end_date,
        usage_limit,
      });

      return res.status(201).json({ message: "Voucher created", voucher });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  // Admin: Update voucher
  async update(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      if (updates.code) {
        updates.code = updates.code.toUpperCase();
      }

      const voucher = await VoucherService.updateVoucher(id, updates);
      if (!voucher) {
        return res.status(404).json({ error: "Voucher not found" });
      }

      return res.json({ message: "Voucher updated", voucher });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  // Admin: Delete voucher
  async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await VoucherService.deleteVoucher(id);
      if (!deleted) {
        return res.status(404).json({ error: "Voucher not found" });
      }
      return res.json({ message: "Voucher deleted" });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
};
