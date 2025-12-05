import { VoucherService } from "./voucher.service.js";

export const VoucherController = {
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
};
