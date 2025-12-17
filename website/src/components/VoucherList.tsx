import React, { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  AlertCircle,
  Calendar,
  Percent,
  DollarSign,
} from "./Icons";
import { Voucher } from "../types";
import { apiClient } from "../services/apiClient";

const VoucherList: React.FC = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discount_type: "percent" as "percent" | "fixed",
    discount_value: "",
    min_order_value: "0",
    max_discount_amount: "",
    start_date: "",
    end_date: "",
    usage_limit: "100",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch vouchers
  const fetchVouchers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.getVouchers();
      if (res.data && Array.isArray(res.data)) {
        setVouchers(res.data);
      }
    } catch (err) {
      setError("Failed to load vouchers");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  // Handle form open
  const handleOpenForm = (voucher?: Voucher) => {
    if (voucher) {
      setEditingVoucher(voucher);
      setFormData({
        code: voucher.code,
        description: voucher.description || "",
        discount_type: voucher.discount_type,
        discount_value: voucher.discount_value.toString(),
        min_order_value: voucher.min_order_value.toString(),
        max_discount_amount: voucher.max_discount_amount?.toString() || "",
        start_date: voucher.start_date ? voucher.start_date.split("T")[0] : "",
        end_date: voucher.end_date ? voucher.end_date.split("T")[0] : "",
        usage_limit: voucher.usage_limit?.toString() || "100",
      });
    } else {
      setEditingVoucher(null);
      setFormData({
        code: "",
        description: "",
        discount_type: "percent",
        discount_value: "",
        min_order_value: "0",
        max_discount_amount: "",
        start_date: "",
        end_date: "",
        usage_limit: "100",
      });
    }
    setFormError(null);
    setIsFormOpen(true);
  };

  // Handle form close
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingVoucher(null);
    setFormError(null);
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.code.trim() || !formData.discount_value) {
      setFormError("Code and discount value are required");
      return;
    }

    if (!formData.discount_type) {
      setFormError("Discount type (Percent or Fixed) is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        code: formData.code.toUpperCase(),
        description: formData.description,
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        min_order_value: parseInt(formData.min_order_value) || 0,
        max_discount_amount: formData.max_discount_amount
          ? parseInt(formData.max_discount_amount)
          : undefined,
        start_date: formData.start_date,
        end_date: formData.end_date,
        usage_limit: parseInt(formData.usage_limit) || 100,
      };

      if (editingVoucher) {
        await apiClient.updateVoucher(editingVoucher.id, payload);
      } else {
        await apiClient.createVoucher(payload);
      }

      handleCloseForm();
      await fetchVouchers();
    } catch (err: any) {
      setFormError(err.message || "Failed to save voucher");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string, code: string) => {
    if (window.confirm(`Are you sure you want to delete voucher "${code}"?`)) {
      try {
        await apiClient.deleteVoucher(id);
        await fetchVouchers();
      } catch (err) {
        alert("Failed to delete voucher");
        console.error(err);
      }
    }
  };

  // Format discount display
  const formatDiscount = (voucher: Voucher) => {
    if (voucher.discount_type === "percent") {
      return `${voucher.discount_value}%`;
    }
    return `${parseInt(voucher.discount_value.toString()).toLocaleString()}đ`;
  };

  // Check if voucher is active
  const isVoucherActive = (voucher: Voucher) => {
    if (!voucher.is_active) return false;
    const now = new Date();
    const start = voucher.start_date ? new Date(voucher.start_date) : null;
    const end = voucher.end_date ? new Date(voucher.end_date) : null;
    if (start && now < start) return false;
    if (end && now > end) return false;
    if (voucher.used_count >= (voucher.usage_limit || 0)) return false;
    return true;
  };

  // Filter vouchers
  const filteredVouchers = vouchers.filter((v) =>
    v.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800">
          Vouchers Management
        </h1>
        <button
          onClick={() => handleOpenForm()}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} />
          <span>New Voucher</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-3 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Search vouchers by code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="text-red-600" size={20} />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="p-8 text-center text-slate-500">
          Loading vouchers...
        </div>
      ) : filteredVouchers.length === 0 ? (
        <div className="p-8 text-center text-slate-500">
          <div className="bg-slate-100 p-4 rounded-full inline-block mb-4">
            <span className="text-4xl">🎟️</span>
          </div>
          <p>No vouchers found</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredVouchers.map((voucher) => (
            <div
              key={voucher.id}
              className={`relative rounded-xl border-2 overflow-hidden p-6 transition-all hover:shadow-lg ${
                isVoucherActive(voucher)
                  ? "bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              {/* Dashed separator line */}
              <div className="absolute right-32 top-0 bottom-0 border-r-2 border-dashed border-slate-300 opacity-40"></div>

              {/* Left side content */}
              <div className="pr-32">
                {/* Code */}
                <h3 className="text-2xl font-bold text-slate-800 mb-1 tracking-widest font-mono">
                  {voucher.code}
                </h3>

                {/* Description */}
                {voucher.description && (
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                    {voucher.description}
                  </p>
                )}

                {/* Status badge */}
                <div className="mb-4">
                  <span
                    className={`inline-flex items-center space-x-1 text-xs font-semibold px-3 py-1 rounded-full ${
                      isVoucherActive(voucher)
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-300 text-slate-700"
                    }`}
                  >
                    <span>{isVoucherActive(voucher) ? "✓" : "−"}</span>
                    <span>
                      {isVoucherActive(voucher) ? "Active" : "Inactive"}
                    </span>
                  </span>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {/* Min Order */}
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase mb-1">
                      Min Order
                    </p>
                    <p className="font-bold text-lg text-slate-800">
                      {parseInt(
                        voucher.min_order_value.toString()
                      ).toLocaleString()}
                      <span className="text-sm font-normal">đ</span>
                    </p>
                  </div>

                  {/* Usage */}
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase mb-1">
                      Usage
                    </p>
                    <p className="font-bold text-lg text-slate-800">
                      {voucher.used_count}
                      <span className="text-sm font-normal">
                        /{voucher.usage_limit || "∞"}
                      </span>
                    </p>
                  </div>

                  {/* Valid Until */}
                  <div className="col-span-2">
                    <p className="text-xs text-slate-500 font-semibold uppercase mb-1 flex items-center space-x-1">
                      <Calendar size={14} />
                      <span>Expires</span>
                    </p>
                    <p className="font-semibold text-slate-800">
                      {voucher.end_date
                        ? new Date(voucher.end_date).toLocaleDateString()
                        : "No expiry"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right side: Discount and actions */}
              <div className="absolute right-6 top-6 bottom-6 flex flex-col items-end justify-between w-28">
                {/* Discount display */}
                <div className="text-center">
                  <div
                    className={`${
                      isVoucherActive(voucher)
                        ? "bg-gradient-to-b from-indigo-600 to-indigo-700 text-white shadow-lg"
                        : "bg-slate-300 text-slate-600"
                    } rounded-lg px-3 py-3 font-bold min-h-20 flex flex-col items-center justify-center`}
                  >
                    <div className="text-xs font-medium opacity-90">
                      {voucher.discount_type === "percent" ? "SAVE" : "OFF"}
                    </div>
                    <div className="text-3xl font-black leading-none">
                      {
                        formatDiscount(voucher).split(
                          voucher.discount_type === "percent" ? "%" : "đ"
                        )[0]
                      }
                    </div>
                    <div className="text-xs font-medium opacity-90">
                      {voucher.discount_type === "percent" ? "%" : "đ"}
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col items-center space-y-1">
                  <button
                    onClick={() => handleOpenForm(voucher)}
                    className={`p-2 rounded-lg transition-colors ${
                      isVoucherActive(voucher)
                        ? "text-indigo-600 hover:bg-indigo-100"
                        : "text-slate-500 hover:bg-slate-200"
                    }`}
                    title="Edit"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(voucher.id, voucher.code)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full my-8">
            {/* Form Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-800">
                {editingVoucher ? "Edit Voucher" : "New Voucher"}
              </h2>
              <button
                onClick={handleCloseForm}
                className="p-1 hover:bg-slate-100 rounded"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Error */}
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {formError}
                </div>
              )}

              {/* Code */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Voucher Code *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                  placeholder="e.g., SUMMER20"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Summer sale promotion"
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Type *
                  </label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discount_type: e.target.value as "percent" | "fixed",
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed (đ)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Value *
                  </label>
                  <input
                    type="number"
                    value={formData.discount_value}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discount_value: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="20"
                  />
                </div>
              </div>

              {/* Min Order Value */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Minimum Order Value (đ)
                </label>
                <input
                  type="number"
                  value={formData.min_order_value}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      min_order_value: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="100000"
                />
              </div>

              {/* Max Discount Amount */}
              {formData.discount_type === "percent" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Max Discount Amount (đ)
                  </label>
                  <input
                    type="number"
                    value={formData.max_discount_amount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        max_discount_amount: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="500000"
                  />
                </div>
              )}

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData({ ...formData, end_date: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Usage Limits */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Usage Limit
                  </label>
                  <input
                    type="number"
                    value={formData.usage_limit}
                    onChange={(e) =>
                      setFormData({ ...formData, usage_limit: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="100"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoucherList;
