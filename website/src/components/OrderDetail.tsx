import React from "react";
import { Order, OrderItem, OrderStatus } from "../types";
import {
  X,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  Package,
  MapPin,
  CreditCard,
  DollarSign,
} from "./Icons";

interface OrderDetailProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (orderId: string, newStatus: OrderStatus) => void;
}

const OrderDetail: React.FC<OrderDetailProps> = ({
  order,
  isOpen,
  onClose,
  onStatusChange,
}) => {
  if (!isOpen || !order) return null;

  // Normalize order data to prevent undefined errors
  const safeOrder = {
    ...order,
    status: order.status || "pending",
    payment_status: order.payment_status || "unpaid",
    shipping_info: order.shipping_info || {},
    items: order.items || [],
  };

  const getStatusColor = (status: OrderStatus | string) => {
    switch (status) {
      case OrderStatus.COMPLETED:
        return "bg-emerald-100 text-emerald-800";
      case OrderStatus.SHIPPING:
        return "bg-blue-100 text-blue-800";
      case OrderStatus.CONFIRMED:
        return "bg-indigo-100 text-indigo-800";
      case OrderStatus.CANCELLED:
        return "bg-rose-100 text-rose-800";
      default:
        return "bg-amber-100 text-amber-800";
    }
  };

  const getStatusIcon = (status: OrderStatus | string) => {
    switch (status) {
      case OrderStatus.COMPLETED:
        return <CheckCircle size={20} />;
      case OrderStatus.SHIPPING:
        return <Truck size={20} />;
      case OrderStatus.CANCELLED:
        return <XCircle size={20} />;
      default:
        return <Clock size={20} />;
    }
  };

  const getPaymentStatusColor = (paymentStatus: string) => {
    switch (paymentStatus?.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "unpaid":
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 flex justify-between items-center border-b">
          <div>
            <h2 className="text-xl font-bold text-white">Order Details</h2>
            <p className="text-indigo-100 text-sm mt-1">
              Order ID: #{safeOrder.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-indigo-500 p-2 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center text-slate-600 text-sm mb-2">
                <Package size={16} className="mr-2" />
                Order Status
              </div>
              <div
                className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                  safeOrder.status
                )}`}
              >
                {getStatusIcon(safeOrder.status)}
                <span className="ml-2">{safeOrder.status.toUpperCase()}</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center text-slate-600 text-sm mb-2">
                <CreditCard size={16} className="mr-2" />
                Payment Status
              </div>
              <span
                className={`inline-block px-3 py-2 rounded-full text-sm font-semibold ${getPaymentStatusColor(
                  safeOrder.payment_status
                )}`}
              >
                {safeOrder.payment_status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Timeline */}
          <div className="border-l-2 border-indigo-200 pl-4 space-y-3">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">
                Created
              </p>
              <p className="text-slate-900 font-medium">
                {formatDate(safeOrder.created_at)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">
                Last Updated
              </p>
              <p className="text-slate-900 font-medium">
                {formatDate(safeOrder.updated_at)}
              </p>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="border rounded-lg p-4 bg-slate-50">
            <h3 className="flex items-center font-semibold text-slate-900 mb-3">
              <MapPin size={18} className="mr-2 text-indigo-600" />
              Shipping Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Recipient:</span>
                <span className="font-medium text-slate-900">
                  {safeOrder.shipping_info?.name ||
                    safeOrder.shipping_info?.recipient_name ||
                    "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Phone:</span>
                <span className="font-medium text-slate-900">
                  {safeOrder.shipping_info?.phone ||
                    safeOrder.shipping_info?.recipient_phone ||
                    "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Address:</span>
                <span className="font-medium text-slate-900 text-right max-w-xs">
                  {safeOrder.shipping_info?.address_detail || "N/A"}
                  {safeOrder.shipping_info?.ward && (
                    <>, {safeOrder.shipping_info.ward}</>
                  )}
                  {safeOrder.shipping_info?.district && (
                    <>, {safeOrder.shipping_info.district}</>
                  )}
                  {safeOrder.shipping_info?.province && (
                    <>, {safeOrder.shipping_info.province}</>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="border rounded-lg p-4 bg-slate-50">
            <h3 className="flex items-center font-semibold text-slate-900 mb-3">
              <CreditCard size={18} className="mr-2 text-indigo-600" />
              Payment Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Payment Method:</span>
                <span className="font-medium text-slate-900 capitalize">
                  {order.payment_method || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Payment Status:</span>
                <span
                  className={`font-medium px-2 py-1 rounded text-xs ${getPaymentStatusColor(
                    safeOrder.payment_status
                  )}`}
                >
                  {safeOrder.payment_status?.toUpperCase() || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="border rounded-lg p-4 bg-slate-50">
            <h3 className="flex items-center font-semibold text-slate-900 mb-4">
              <Package size={18} className="mr-2 text-indigo-600" />
              Order Items ({safeOrder.items?.length || 0})
            </h3>
            <div className="space-y-3">
              {safeOrder.items && safeOrder.items.length > 0 ? (
                safeOrder.items.map((item: OrderItem) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b pb-3 last:border-b-0"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">
                        {item.product_name}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {item.variant_info?.color && (
                          <span>Color: {item.variant_info.color} </span>
                        )}
                        {item.variant_info?.size && (
                          <span>| Size: {item.variant_info.size}</span>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-900">
                        Qty: {item.quantity}
                      </p>
                      <p className="text-sm text-slate-600">
                        ${Number(item.total_price).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-sm">No items found</p>
              )}
            </div>
          </div>

          {/* Financial Summary */}
          <div className="border rounded-lg p-4 bg-indigo-50">
            <h3 className="flex items-center font-semibold text-slate-900 mb-4">
              <DollarSign size={18} className="mr-2 text-indigo-600" />
              Financial Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal:</span>
                <span className="font-medium text-slate-900">
                  ₫
                  {Number(safeOrder.subtotal_amount || 0).toLocaleString(
                    "vi-VN"
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Shipping Fee:</span>
                <span className="font-medium text-slate-900">
                  ₫{Number(safeOrder.shipping_fee || 0).toLocaleString("vi-VN")}
                </span>
              </div>
              {safeOrder.discount_amount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount:</span>
                  <span className="font-medium">
                    -₫
                    {Number(safeOrder.discount_amount || 0).toLocaleString(
                      "vi-VN"
                    )}
                  </span>
                </div>
              )}
              <div className="border-t pt-2 mt-2 flex justify-between font-bold text-base">
                <span className="text-slate-900">Total Amount:</span>
                <span className="text-indigo-600">
                  ₫{Number(safeOrder.total_amount || 0).toLocaleString("vi-VN")}
                </span>
              </div>
            </div>
          </div>

          {/* Note Section */}
          {safeOrder.note && (
            <div className="border rounded-lg p-4 bg-amber-50">
              <h3 className="font-semibold text-slate-900 mb-2">Order Note</h3>
              <p className="text-slate-700 text-sm italic">{safeOrder.note}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {onStatusChange && safeOrder.status !== OrderStatus.COMPLETED && (
              <button
                onClick={() => {
                  onStatusChange(safeOrder.id, OrderStatus.COMPLETED);
                  onClose();
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-lg transition"
              >
                Mark as Completed
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-900 font-medium py-2 rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
