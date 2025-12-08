import React, { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MoreVertical,
  Package,
  AlertCircle,
} from "./Icons";
import ProductForm from "./ProductForm";
import { Product } from "../types";
import { apiClient } from "../services/apiClient";

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(
    undefined
  );
  const [searchTerm, setSearchTerm] = useState("");

  // Hàm fetch dữ liệu
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.getProducts();
      // Backend trả về { products: [...] } hoặc mảng trực tiếp tùy cấu hình
      // apiClient đã xử lý, ta chỉ cần check res.data
      if (Array.isArray(res.data)) {
        setProducts(res.data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      setError("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await apiClient.deleteProduct(id);
        setProducts(products.filter((p) => p.id !== id));
      } catch (err) {
        alert("Failed to delete product");
      }
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingProduct(undefined);
    setIsFormOpen(true);
  };

  const handleSave = async (productData: Product) => {
    try {
      if (editingProduct) {
        await apiClient.updateProduct(editingProduct.id, productData);
      } else {
        await apiClient.createProduct(productData);
      }
      setIsFormOpen(false);
      fetchProducts(); // Reload list
    } catch (err) {
      console.error("Save failed", err);
      alert("Failed to save product");
    }
  };

  // Filter products
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper để lấy ảnh đại diện (Thumbnail)
  const getThumbnail = (product: Product) => {
    if (!product.images || product.images.length === 0) return null;
    // Ưu tiên ảnh chung (color_ref === null), nếu không có lấy ảnh đầu tiên
    const generalImg = product.images.find((img) => !img.color_ref);
    return generalImg ? generalImg.image_url : product.images[0].image_url;
  };

  if (isFormOpen) {
    return (
      <ProductForm
        initialProduct={editingProduct}
        onSave={handleSave}
        onCancel={() => setIsFormOpen(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Products</h1>
        <button
          onClick={handleAddNew}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} />
          <span>Add Product</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">
            Loading products...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-500 flex flex-col items-center">
            <AlertCircle size={32} className="mb-2" />
            {error}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center">
            <Package size={48} className="mb-4 opacity-50" />
            <p>No products found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Variants
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredProducts.map((product) => {
                  const thumbnail = getThumbnail(product);
                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-slate-100 overflow-hidden border border-slate-200">
                            {thumbnail ? (
                              <img
                                className="h-10 w-10 object-cover"
                                src={thumbnail}
                                alt=""
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-slate-400">
                                <Package size={20} />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-900">
                              {product.name}
                            </div>
                            <div className="text-xs text-slate-500">
                              SKU: {product.variants?.[0]?.sku || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {/* Tạm thời hiển thị ID, sau này có thể map sang tên Category */}
                        {product.category_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        ${Number(product.base_price).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {product.variants?.length || 0} variants
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            product.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-slate-100 text-slate-800"
                          }`}
                        >
                          {product.is_active ? "Active" : "Draft"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-rose-600 hover:text-rose-900 p-1 hover:bg-rose-50 rounded"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
