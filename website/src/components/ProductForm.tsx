import React, { useState, useEffect } from "react";
import { Product, ProductVariant, ProductImage, Category } from "../types";
import { apiClient } from "../services/apiClient";
import { Plus, Trash2, X, Upload, Wand2 } from "./Icons"; // Đảm bảo đã có icon Wand2 trong Icons.tsx

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
  // --- 1. STATE QUẢN LÝ DỮ LIỆU ---
  const [categories, setCategories] = useState<Category[]>([]);

  // Basic Info (Đây là phần bạn đang thiếu)
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

  // Variants & Images
  const [variants, setVariants] = useState<ProductVariant[]>(
    initialProduct?.variants || []
  );
  const [images, setImages] = useState<ProductImage[]>(
    initialProduct?.images || []
  );

  // Loading States
  const [isUploading, setIsUploading] = useState(false);

  // Variant Input State (Dùng để thêm mới variant)
  const [vColor, setVColor] = useState("");
  const [vSize, setVSize] = useState("M");
  const [vPrice, setVPrice] = useState("");
  const [vStock, setVStock] = useState("10");

  // --- 2. EFFECTS ---
  useEffect(() => {
    const fetchCats = async () => {
      const res = await apiClient.getCategories();
      if (res.data) {
        setCategories(res.data);
        // Nếu tạo mới và chưa chọn danh mục, auto chọn cái đầu tiên
        if (!initialProduct && !categoryId && res.data.length > 0) {
          setCategoryId(res.data[0].id);
        }
      }
    };
    fetchCats();
  }, []);

  // --- 3. HANDLERS ---

  // Upload ảnh
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    try {
      const url = await apiClient.uploadImage(e.target.files[0]);
      if (url) {
        setImages([
          ...images,
          {
            id: Date.now().toString(),
            image_url: url,
            color_ref: null, // Mặc định là ảnh chung
            display_order: images.length,
          },
        ]);
      }
    } catch (error) {
      alert("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  // Thêm Variant
  const addVariant = () => {
    if (!vColor || !vSize) return alert("Color and Size are required");

    const newVariant: ProductVariant = {
      id: Date.now().toString(), // Temp ID
      sku: `${name.slice(0, 3).toUpperCase()}-${vColor
        .slice(0, 1)
        .toUpperCase()}-${vSize}`,
      color: vColor,
      size: vSize,
      price: parseFloat(vPrice) || parseFloat(basePrice) || 0,
      stock_quantity: parseInt(vStock) || 0,
    };

    setVariants([...variants, newVariant]);
    setVColor(""); // Reset color input
  };

  // Xóa Variant
  const removeVariant = (id: string) => {
    setVariants(variants.filter((v) => v.id !== id));
  };

  // Submit Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate cơ bản
    if (!name || !basePrice) {
      alert("Name and Base Price are required!");
      return;
    }

    const productData: Product = {
      id: initialProduct?.id || "",
      category_id: categoryId,
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
      description,
      base_price: parseFloat(basePrice), // Chuyển string sang number
      is_active: true,
      variants,
      images,
    };

    onSave(productData);
  };

  // Lấy danh sách màu để hiển thị trong dropdown chọn màu ảnh
  const availableColors = Array.from(
    new Set(variants.map((v) => v.color).filter(Boolean))
  );

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden max-w-4xl mx-auto my-4">
      <div className="bg-slate-50 px-8 py-4 border-b border-slate-200 flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">
          {initialProduct ? "Edit Product" : "Add New Product"}
        </h2>
        <button
          onClick={onCancel}
          className="text-slate-400 hover:text-slate-600"
        >
          <X size={24} />
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-8 space-y-8 h-[80vh] overflow-y-auto"
      >
        {/* --- PHẦN 1: THÔNG TIN CƠ BẢN (QUAN TRỌNG) --- */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-700 pb-2 border-b border-slate-100">
            Basic Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tên sản phẩm */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Cotton T-Shirt"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Slug
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="Auto-generated from name"
              />
            </div>

            {/* Danh mục */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Category *
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

            {/* Giá gốc */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Base Price ($) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
              />
            </div>
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* --- PHẦN 2: BIẾN THỂ (VARIANTS) --- */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-700 pb-2 border-b border-slate-100">
            Variants (Color & Size)
          </h3>

          {/* Form thêm variant */}
          <div className="flex flex-wrap items-end gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="flex-1 min-w-[100px]">
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Color
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md text-sm"
                placeholder="Red"
                value={vColor}
                onChange={(e) => setVColor(e.target.value)}
              />
            </div>
            <div className="w-24">
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Size
              </label>
              <select
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={vSize}
                onChange={(e) => setVSize(e.target.value)}
              >
                {["XS", "S", "M", "L", "XL", "XXL"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-28">
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Price ($)
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border rounded-md text-sm"
                placeholder={basePrice || "0"}
                value={vPrice}
                onChange={(e) => setVPrice(e.target.value)}
              />
            </div>
            <div className="w-24">
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Stock
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={vStock}
                onChange={(e) => setVStock(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={addVariant}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 flex items-center"
            >
              <Plus size={16} className="mr-1" /> Add
            </button>
          </div>

          {/* Bảng danh sách variant */}
          {variants.length > 0 && (
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">
                      SKU
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">
                      Color
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">
                      Size
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">
                      Price
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">
                      Stock
                    </th>
                    <th className="px-4 py-2 text-right"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {variants.map((v, idx) => (
                    <tr key={v.id || idx}>
                      <td className="px-4 py-2 text-sm font-mono text-slate-600">
                        {v.sku}
                      </td>
                      <td className="px-4 py-2 text-sm">{v.color}</td>
                      <td className="px-4 py-2 text-sm">
                        <span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold">
                          {v.size}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm">${v.price}</td>
                      <td className="px-4 py-2 text-sm">{v.stock_quantity}</td>
                      <td className="px-4 py-2 text-right">
                        <button
                          onClick={() => removeVariant(v.id!)}
                          className="text-rose-600 hover:text-rose-800"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* --- PHẦN 3: HÌNH ẢNH (IMAGES) --- */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-700 pb-2 border-b border-slate-100">
            Product Images
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Nút Upload */}
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

            {/* Danh sách ảnh */}
            {images.map((img, index) => (
              <div
                key={img.id || index}
                className="relative group border border-slate-200 rounded-lg overflow-hidden h-40"
              >
                <img
                  src={img.image_url}
                  alt="Product"
                  className="w-full h-24 object-cover"
                />

                {/* Chọn màu cho ảnh */}
                <div className="p-2 bg-white absolute bottom-0 w-full border-t border-slate-100">
                  <select
                    className="w-full text-xs border border-slate-300 rounded px-1 py-1 outline-none"
                    value={img.color_ref || "General"}
                    onChange={(e) => {
                      const val = e.target.value;
                      setImages(
                        images.map((i) =>
                          i.id === img.id
                            ? {
                                ...i,
                                color_ref: val === "General" ? null : val,
                              }
                            : i
                        )
                      );
                    }}
                  >
                    <option value="General">General (Thumbnail)</option>
                    {availableColors.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Nút xóa ảnh */}
                <button
                  type="button"
                  onClick={() =>
                    setImages(images.filter((i) => i.id !== img.id))
                  }
                  className="absolute top-1 right-1 bg-white/90 p-1 rounded-full text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end space-x-4 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md"
          >
            Save Product
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
