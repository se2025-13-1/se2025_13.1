import React, { useEffect, useState } from "react";
import { Order, OrderStatus } from "../types";
import { apiClient } from "../services/apiClient";
import { CheckCircle, Clock, Truck, XCircle, Search, Eye } from "./Icons";

const OrderList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch Orders từ API
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.getOrders("");
      if (res.data && Array.isArray(res.data)) {
        setOrders(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Update Status Handler
  const handleUpdateStatus = async (
    orderId: string,
    newStatus: OrderStatus
  ) => {
    try {
      await apiClient.updateOrderStatus(orderId, newStatus);
      // Cập nhật UI ngay lập tức
      setOrders(
        orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      alert("Failed to update order status");
    }
  };

  // Check if order status is final (cannot be changed)
  const isFinalStatus = (status: OrderStatus): boolean => {
    return (
      status === OrderStatus.SHIPPING ||
      status === OrderStatus.CANCELLED ||
      status === OrderStatus.COMPLETED
    );
  };

  // Filter logic
  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shipping_info?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: OrderStatus) => {
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

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.COMPLETED:
        return <CheckCircle size={16} className="mr-1" />;
      case OrderStatus.SHIPPING:
        return <Truck size={16} className="mr-1" />;
      case OrderStatus.CANCELLED:
        return <XCircle size={16} className="mr-1" />;
      default:
        return <Clock size={16} className="mr-1" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Orders</h1>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search orders..."
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">
            Loading orders...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Payment Status
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
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-600">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {order.shipping_info?.name || "Unknown"}
                      <div className="text-xs text-slate-500">
                        {order.shipping_info?.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      ${Number(order.total_amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      <span className="capitalize">
                        {order.payment_method || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          order.payment_status === "paid"
                            ? "bg-green-100 text-green-800"
                            : order.payment_status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {order.payment_status?.toUpperCase() || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)}
                        {order.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <select
                        className={`text-xs border-slate-200 rounded-md p-1 outline-none focus:border-indigo-500 ${
                          isFinalStatus(order.status)
                            ? "bg-slate-100 text-slate-500 cursor-not-allowed opacity-60"
                            : "bg-white text-slate-900 cursor-pointer"
                        }`}
                        value={order.status}
                        onChange={(e) =>
                          handleUpdateStatus(
                            order.id,
                            e.target.value as OrderStatus
                          )
                        }
                        disabled={isFinalStatus(order.status)}
                        title={
                          isFinalStatus(order.status)
                            ? "Cannot change status for completed, shipping, or cancelled orders"
                            : "Change order status"
                        }
                      >
                        <option value={OrderStatus.PENDING}>Pending</option>
                        <option value={OrderStatus.CONFIRMED}>Confirmed</option>
                        <option value={OrderStatus.SHIPPING}>Shipping</option>
                        <option value={OrderStatus.COMPLETED}>Completed</option>
                        <option value={OrderStatus.CANCELLED}>Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderList;
