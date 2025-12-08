import React, { useState, useEffect } from "react";
import { Product, ProductVariant, ProductImage, Category } from "../types"; // Đảm bảo type ProductImage có field color_ref
import { generateProductDescription } from "../services/geminiService";
import { apiClient } from "../services/apiClient";
import { Wand2, Plus, Trash2, X, Upload, Image as ImageIcon } from "./Icons";

interface ProductFormProps {
  initialProduct?: Product;
  onSave: (product: Product) => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({
  initialProduct,
  onSave,
  onCancel,
}) => {
  // --- STATE ---
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState(initialProduct?.name || "");
  const [slug, setSlug] = useState(initialProduct?.slug || "");
  const [description, setDescription] = useState(
    initialProduct?.description || ""
  );
  const [basePrice, setBasePrice] = useState(
    initialProduct?.base_price.toString() || ""
  );
  const [categoryId, setCategoryId] = useState(
    initialProduct?.category_id || ""
  );

  // Variants State
  const [variants, setVariants] = useState<ProductVariant[]>(
    initialProduct?.variants || []
  );

  // Images State (Mới)
  const [images, setImages] = useState<ProductImage[]>(
    initialProduct?.images || []
  );
  const [isUploading, setIsUploading] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);

  // Variant Input State
  const [vColor, setVColor] = useState("");
  const [vSize, setVSize] = useState("M");
  const [vPrice, setVPrice] = useState("");
  const [vStockQuantity, setVStockQuantity] = useState("10");

  // --- EFFECTS ---
  useEffect(() => {
    // Load danh mục từ API
    const fetchCats = async () => {
      const res = await apiClient.getCategories();
      if (res.data) {
        setCategories(res.data);
        // Nếu chưa chọn category và có dữ liệu, chọn cái đầu tiên
        if (!categoryId && res.data.length > 0) {
          setCategoryId(res.data[0].id);
        }
      }
    };
    fetchCats();
  }, []);

  // --- HANDLERS ---

  // 1. Upload Ảnh
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setIsUploading(true);
    const file = e.target.files[0];

    try {
      const url = await apiClient.uploadImage(file);
      if (url) {
        const newImage: ProductImage = {
          id: Date.now().toString(), // Temp ID
          image_url: url,
          color_ref: null, // Mặc định là ảnh chung (null)
          display_order: images.length,
        };
        setImages([...images, newImage]);
      }
    } catch (error) {
      alert("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  // 2. Gán màu cho ảnh
  const updateImageColor = (imgId: string, color: string) => {
    setImages(
      images.map((img) =>
        img.id === imgId
          ? { ...img, color_ref: color === "General" ? null : color }
          : img
      )
    );
  };

  // 3. Xóa ảnh
  const removeImage = (imgId: string) => {
    setImages(images.filter((img) => img.id !== imgId));
  };

  // 4. AI Generate
  const handleAiGenerate = async () => {
    if (!name) return alert("Please enter a product name first.");
    setIsGenerating(true);
    const categoryName =
      categories.find((c) => c.id === categoryId)?.name || "Fashion";
    const generated = await generateProductDescription(
      name,
      categoryName,
      `${vColor} ${vSize} clothing`
    );
    setDescription(generated);
    setIsGenerating(false);
  };

  // 5. Thêm Variant
  const addVariant = () => {
    if (!vColor || !vSize) return;
    const newVariant: ProductVariant = {
      id: Date.now().toString(),
      product_id: initialProduct?.id || "",
      sku: `${name.substring(0, 3).toUpperCase()}-${vColor
        .substring(0, 1)
        .toUpperCase()}-${vSize}`,
      color: vColor,
      size: vSize,
      price: parseFloat(vPrice) || parseFloat(basePrice) || 0,
      stock_quantity: parseInt(vStockQuantity) || 0,
    };
    setVariants([...variants, newVariant]);
    setVColor(""); // Reset color input
  };

  // 6. Submit Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate: Phải có ít nhất 1 ảnh
    if (images.length === 0) {
      alert("Please upload at least one image.");
      return;
    }

    const product: Product = {
      id: initialProduct?.id || "", // Backend sẽ tự tạo ID nếu rỗng
      category_id: categoryId,
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
      description,
      base_price: parseFloat(basePrice) || 0,
      is_active: true,
      variants,
      images, // Gửi kèm mảng ảnh đã xử lý
    };
    onSave(product);
  };

  // Lấy danh sách các màu duy nhất từ variants để hiển thị trong dropdown chọn màu ảnh
  const availableColors = Array.from(
    new Set(variants.map((v) => v.color).filter(Boolean))
  );

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden max-w-4xl mx-auto">
      {/* Header ... (Giữ nguyên) */}

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        {/* Basic Info ... (Giữ nguyên phần Name, Slug, Price) */}

        {/* Category Dropdown (Dynamic) */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Category
          </label>
          <select
            className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* ... (Phần Description giữ nguyên) ... */}

        {/* --- SECTION: VARIANTS --- */}
        <div className="space-y-4">
          {/* ... (Giữ nguyên phần thêm Variant và Table Variant) ... */}
        </div>

        {/* --- SECTION: IMAGES (MỚI) --- */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-700 pb-2 border-b border-slate-100">
            Product Images
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Upload Button */}
            <label className="border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center h-40 cursor-pointer hover:bg-slate-50 transition-colors">
              {isUploading ? (
                <span className="text-sm text-slate-500">Uploading...</span>
              ) : (
                <>
                  <Upload size={24} className="text-slate-400 mb-2" />
                  <span className="text-sm text-slate-500">Upload Image</span>
                </>
              )}
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
              />
            </label>

            {/* Image List */}
            {images.map((img, index) => (
              <div
                key={img.id || index}
                className="relative group border border-slate-200 rounded-lg overflow-hidden"
              >
                <img
                  src={img.image_url}
                  alt="Product"
                  className="w-full h-24 object-cover"
                />

                {/* Color Selector for Image */}
                <div className="p-2 bg-white">
                  <select
                    className="w-full text-xs border border-slate-300 rounded px-1 py-1 outline-none"
                    value={img.color_ref || "General"}
                    onChange={(e) => updateImageColor(img.id!, e.target.value)}
                  >
                    <option value="General">General (Thumbnail)</option>
                    {availableColors.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => removeImage(img.id!)}
                  className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end space-x-4 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg"
          >
            Save Product
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
