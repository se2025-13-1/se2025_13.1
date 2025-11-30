import multer from "multer";

// Lưu file vào bộ nhớ tạm (RAM) để xử lý trước khi đẩy lên Cloud
const storage = multer.memoryStorage();

export const uploadMiddleware = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ được upload file ảnh!"), false);
    }
  },
});
