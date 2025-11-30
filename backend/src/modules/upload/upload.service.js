import { supabase } from "../../config/supabase.js";

export const UploadService = {
  async uploadImage(file, folder = "products") {
    // 1. Tạo tên file unique để tránh trùng
    const fileName = `${folder}/${Date.now()}-${file.originalname.replace(
      /\s/g,
      "-"
    )}`;

    // 2. Upload lên Supabase Storage
    const { data, error } = await supabase.storage
      .from("products") // Tên bucket bạn đã tạo
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // 3. Lấy Public URL để trả về cho Frontend
    const { data: publicUrlData } = supabase.storage
      .from("products")
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  },
};
