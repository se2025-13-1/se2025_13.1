import React, { useState } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tag,
  Settings,
  LogOut,
  Menu,
  X,
  Ticket,
} from "./Icons";
import { useAuth } from "../contexts/AuthContext";

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
}) => {
  const { logout, user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    if (confirm("Are you sure you want to sign out?")) {
      logout();
    }
  };

  const NavItem = ({
    id,
    label,
    icon: Icon,
  }: {
    id: string;
    label: string;
    icon: any;
  }) => (
    <button
      onClick={() => {
        setActiveTab(id);
        setIsSidebarOpen(false);
      }}
      className={`w-full flex items-center space-x-3 px-6 py-4 transition-colors duration-200 ${
        activeTab === id
          ? "bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="h-20 flex items-center px-8 border-b border-slate-100">
          <div className="flex items-center space-x-2 text-indigo-600">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              F
            </div>
            <span className="text-xl font-bold tracking-tight">
              Fashion<span className="font-light">Admin</span>
            </span>
          </div>
          <button
            className="ml-auto lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        <nav className="mt-8 flex flex-col space-y-1">
          <NavItem id="dashboard" label="Dashboard" icon={LayoutDashboard} />
          <NavItem id="products" label="Products" icon={Package} />
          <NavItem id="orders" label="Orders" icon={ShoppingCart} />
          <NavItem id="categories" label="Categories" icon={Tag} />
          <NavItem id="vouchers" label="Vouchers" icon={Ticket} />
          <div className="pt-8 mt-8 border-t border-slate-100">
            <NavItem id="settings" label="Settings" icon={Settings} />
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-6 py-4 text-rose-500 hover:bg-rose-50 transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <button
            className="lg:hidden p-2 text-slate-500 hover:text-slate-700"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>

          <div className="flex items-center ml-auto space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-800">
                {user?.email || "Admin"}
              </p>
              <p className="text-xs text-slate-500">{user?.role}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              {user?.email
                ?.split("@")[0]
                .split("")
                .slice(0, 2)
                .map((n: string) => n.toUpperCase())
                .join("") || "AD"}
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
