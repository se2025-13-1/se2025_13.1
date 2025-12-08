import React, { useState } from "react";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import ProductList from "./components/ProductList";
import OrderList from "./components/OrderList";
import LoginPage from "./components/LoginPage";
import { useAuth } from "./contexts/AuthContext";
import "./App.css";

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Nếu chưa đăng nhập, hiện trang Login
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Router đơn giản
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />; // ✅ Không truyền props nữa
      case "products":
        return <ProductList />; // ✅ Không truyền props nữa
      case "orders":
        return <OrderList />; // ✅ Không truyền props nữa (Xem Bước 2)
      case "categories":
        return (
          <div className="flex flex-col items-center justify-center h-96 text-slate-400">
            <div className="bg-slate-100 p-4 rounded-full mb-4">
              <span className="text-4xl">🏷️</span>
            </div>
            <h2 className="text-xl font-semibold text-slate-600">
              Categories Management
            </h2>
            <p>Feature implementation for hierarchical category tree.</p>
          </div>
        );
      default:
        return (
          <div className="p-10 text-center text-slate-500">
            Feature coming soon...
          </div>
        );
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

const App: React.FC = () => {
  return <AppContent />;
};

export default App;
