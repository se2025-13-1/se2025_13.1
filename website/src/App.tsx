import React, { useState } from "react";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import ProductList from "./components/ProductList";
import OrderList from "./components/OrderList";
import CategoryList from "./components/CategoryList";
import VoucherList from "./components/VoucherList";
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
        return <Dashboard />;
      case "products":
        return <ProductList />;
      case "orders":
        return <OrderList />;
      case "categories":
        return <CategoryList />;
      case "vouchers":
        return <VoucherList />;
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
