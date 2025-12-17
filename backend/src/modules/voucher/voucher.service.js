import { VoucherRepository } from "./voucher.repository.js";

export const VoucherService = {
  // Hàm này dùng cho cả API Check Voucher và API Create Order
  async validateAndCalculate(code, orderSubtotal) {
    if (!code) return { discountAmount: 0, voucherId: null };

    const voucher = await VoucherRepository.findByCode(code);

    // 1. Các bước kiểm tra cơ bản
    if (!voucher) throw new Error("Mã giảm giá không tồn tại");

    const now = new Date();
    if (now < new Date(voucher.start_date))
      throw new Error("Mã giảm giá chưa đến đợt áp dụng");
    if (now > new Date(voucher.end_date))
      throw new Error("Mã giảm giá đã hết hạn");
    if (voucher.used_count >= voucher.usage_limit)
      throw new Error("Mã giảm giá đã hết lượt sử dụng");

    // 2. Kiểm tra giá trị đơn hàng
    if (Number(orderSubtotal) < Number(voucher.min_order_value)) {
      throw new Error(
        `Đơn hàng phải tối thiểu ${Number(
          voucher.min_order_value
        ).toLocaleString()}đ để dùng mã này`
      );
    }

    // 3. Tính toán tiền giảm
    let discountAmount = 0;

    if (voucher.discount_type === "fixed") {
      // Giảm tiền mặt (VD: 20k)
      discountAmount = Number(voucher.discount_value);
    } else {
      // Giảm phần trăm (VD: 10%)
      discountAmount =
        (Number(orderSubtotal) * Number(voucher.discount_value)) / 100;

      // Check giảm tối đa (VD: Giảm 10% nhưng max 50k)
      if (
        voucher.max_discount_amount &&
        discountAmount > Number(voucher.max_discount_amount)
      ) {
        discountAmount = Number(voucher.max_discount_amount);
      }
    }

    // Đảm bảo tiền giảm không lớn hơn tiền hàng
    if (discountAmount > Number(orderSubtotal)) {
      discountAmount = Number(orderSubtotal);
    }

    return {
      voucherId: voucher.id,
      code: voucher.code,
      discountAmount: Math.floor(discountAmount), // Làm tròn số nguyên
    };
  },

  // Admin: Get all vouchers
  async getAllVouchers() {
    return await VoucherRepository.findAll();
  },

  // Admin: Get single voucher
  async getVoucherById(id) {
    return await VoucherRepository.findById(id);
  },

  // Admin: Create voucher
  async createVoucher(data) {
    return await VoucherRepository.create(data);
  },

  // Admin: Update voucher
  async updateVoucher(id, data) {
    return await VoucherRepository.update(id, data);
  },

  // Admin: Delete voucher
  async deleteVoucher(id) {
    return await VoucherRepository.delete(id);
  },
};
