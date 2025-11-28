import { AddressService } from "./address.service.js";

export const AddressController = {
  async create(req, res) {
    try {
      const userId = req.user.id;
      const {
        recipient_name,
        recipient_phone,
        province,
        district,
        ward,
        address_detail,
        is_default,
      } = req.body;

      // Validate cơ bản
      if (
        !recipient_name ||
        !recipient_phone ||
        !province ||
        !district ||
        !address_detail
      ) {
        return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
      }

      const address = await AddressService.createAddress(userId, {
        recipientName: recipient_name,
        recipientPhone: recipient_phone,
        province,
        district,
        ward,
        addressDetail: address_detail,
        isDefault: is_default,
      });

      return res
        .status(201)
        .json({ message: "Thêm địa chỉ thành công", address });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async list(req, res) {
    try {
      const userId = req.user.id;
      const addresses = await AddressService.getMyAddresses(userId);
      return res.json({ addresses });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const {
        recipient_name,
        recipient_phone,
        province,
        district,
        ward,
        address_detail,
        is_default,
      } = req.body;

      const updated = await AddressService.updateAddress(id, userId, {
        recipientName: recipient_name,
        recipientPhone: recipient_phone,
        province,
        district,
        ward,
        addressDetail: address_detail,
        isDefault: is_default,
      });

      return res.json({ message: "Cập nhật thành công", address: updated });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async remove(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      await AddressService.deleteAddress(id, userId);
      return res.json({ message: "Xóa địa chỉ thành công" });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async setDefault(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const updated = await AddressService.setAsDefault(id, userId);
      return res.json({ message: "Đã đặt làm mặc định", address: updated });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
};
