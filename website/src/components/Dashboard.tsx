import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Package, ShoppingCart, Truck, Users, AlertCircle } from "./Icons";
import { apiClient } from "../services/apiClient";

// Interface khớp với dữ liệu Backend trả về
interface DashboardData {
  total_revenue: number;
  total_orders: number;
  total_users: number;
  low_stock_count: number;
  total_products: number;
  pending_orders: number;
}

interface RevenueData {
  date: string;
  revenue: number;
}

const StatCard = ({ title, value, icon: Icon, color, subtext }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start space-x-4">
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
    <div>
      <p className="text-slate-500 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
      <p className="text-xs text-slate-400 mt-1">{subtext}</p>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardData | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Gọi song song 2 API để tiết kiệm thời gian
        const [statsRes, revenueRes] = await Promise.all([
          apiClient.getDashboardStats(),
          apiClient.getRevenueChart(7), // Lấy 7 ngày gần nhất
        ]);

        console.log("📊 Dashboard Stats Response:", statsRes);

        if (statsRes.data) setStats(statsRes.data);
        if (revenueRes.data) setRevenueData(revenueRes.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">
        Loading dashboard data...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className="text-2xl font-bold text-slate-800">
          Dashboard Overview
        </h1>
        <span className="text-sm text-slate-500">Real-time data</span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        <StatCard
          title="Total Revenue"
          value={stats ? `${stats.total_revenue.toLocaleString()} đ` : "0 đ"}
          icon={ShoppingCart}
          color="bg-indigo-500"
          subtext="Completed orders"
        />
        <StatCard
          title="Total Orders"
          value={stats?.total_orders || 0}
          icon={Truck}
          color="bg-emerald-500"
          subtext="All time"
        />
        <StatCard
          title="Customers"
          value={stats?.total_users || 0}
          icon={Users}
          color="bg-blue-500"
          subtext="Registered users"
        />
        <StatCard
          title="Low Stock"
          value={stats?.low_stock_count || 0}
          icon={Package}
          color="bg-rose-500"
          subtext="Products need restock"
        />
        <StatCard
          title="Total Products"
          value={stats?.total_products || 0}
          icon={Package}
          color="bg-purple-500"
          subtext="All products"
        />
        <StatCard
          title="Pending Orders"
          value={stats?.pending_orders || 0}
          icon={AlertCircle}
          color="bg-orange-500"
          subtext="Awaiting confirmation"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">
            Revenue (Last 7 Days)
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  tickFormatter={(value) => value.split("-").slice(1).join("/")} // Format YYYY-MM-DD -> MM/DD
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b" }}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  formatter={(value: number | undefined) =>
                    value
                      ? [`${value.toLocaleString()} đ`, "Revenue"]
                      : ["N/A", "Revenue"]
                  }
                />
                <Bar
                  dataKey="revenue"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trend Line (Dùng lại data revenue để demo, thực tế có thể là Order Count) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">
            Revenue Trend
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  dy={10}
                  tickFormatter={(value) => value.split("-").slice(1).join("/")}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b" }}
                />
                <Tooltip
                  formatter={(value: number | undefined) =>
                    value
                      ? [`${value.toLocaleString()} đ`, "Revenue"]
                      : ["N/A", "Revenue"]
                  }
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#10b981" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
