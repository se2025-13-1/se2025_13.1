import { UploadService } from "./upload.service.js";

export const UploadController = {
  async uploadSingle(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Vui lòng chọn file ảnh" });
      }

      const url = await UploadService.uploadImage(req.file);

      return res.json({
        message: "Upload thành công",
        url: url, // Frontend sẽ lấy link này để hiển thị hoặc lưu vào DB
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
};
