import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Users,
  AlertTriangle,
  IndianRupee,
  Clock,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";
import { dummyProducts, dummyOrders } from "../../assets/keralaData";

// ─────────────────────────────────────────────────────────────
// Helper: format INR
// ─────────────────────────────────────────────────────────────
const formatINR = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

// ─────────────────────────────────────────────────────────────
// Helper: status badge
// ─────────────────────────────────────────────────────────────
const STATUS_COLORS = {
  placed: "bg-blue-100 text-blue-700",
  confirmed: "bg-indigo-100 text-indigo-700",
  processing: "bg-indigo-100 text-indigo-700",
  packed: "bg-yellow-100 text-yellow-700",
  shipped: "bg-orange-100 text-orange-700",
  "out-for-delivery": "bg-orange-100 text-orange-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const StatusBadge = ({ status }) => {
  const colorClass = STATUS_COLORS[status] || "bg-gray-100 text-gray-700";
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${colorClass}`}
    >
      {status.replace(/-/g, " ")}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────────────────────
const StatCard = ({ title, value, icon: Icon, iconBg, iconColor, subtitle }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
    <div
      className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}
    >
      <Icon size={22} className={iconColor} />
    </div>
    <div className="min-w-0">
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      <p className="text-gray-900 text-2xl font-bold mt-0.5">{value}</p>
      {subtitle && (
        <p className="text-gray-400 text-xs mt-0.5">{subtitle}</p>
      )}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();

  const totalOrders = dummyOrders.length;
  const totalRevenue = dummyOrders.reduce((sum, o) => sum + o.amount, 0);
  const pendingOrders = dummyOrders.filter(
    (o) => o.status !== "delivered" && o.status !== "cancelled"
  ).length;
  const totalCustomers = 24; // static placeholder

  const lowStockProducts = dummyProducts.filter((p) => p.stock < 10);
  const recentOrders = [...dummyOrders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Overview of your Kerala Yard store
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm">
          <Clock size={14} />
          <span>
            {new Date().toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Orders"
          value={totalOrders}
          icon={ShoppingBag}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          subtitle="All time"
        />
        <StatCard
          title="Revenue"
          value={formatINR(totalRevenue)}
          icon={IndianRupee}
          iconBg="bg-green-50"
          iconColor="text-green-600"
          subtitle="From delivered orders"
        />
        <StatCard
          title="Pending Orders"
          value={pendingOrders}
          icon={TrendingUp}
          iconBg="bg-orange-50"
          iconColor="text-orange-600"
          subtitle="Needs attention"
        />
        <StatCard
          title="Customers"
          value={totalCustomers}
          icon={Users}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
          subtitle="Registered users"
        />
      </div>

      {/* ── Bottom Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-gray-900 font-semibold text-base">
              Recent Orders
            </h2>
            <button
              onClick={() => navigate("/admin/orders")}
              className="flex items-center gap-1 text-sm font-medium hover:underline"
              style={{ color: "#1B6B3A" }}
            >
              View all <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                  <th className="text-left px-5 py-3 font-medium">Order #</th>
                  <th className="text-left px-5 py-3 font-medium">Customer</th>
                  <th className="text-left px-5 py-3 font-medium">Amount</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-mono text-gray-700 font-medium text-xs">
                      #{order.id.replace("order_", "").toUpperCase()}
                    </td>
                    <td className="px-5 py-3.5 text-gray-700">
                      {order.address.fullName}
                    </td>
                    <td className="px-5 py-3.5 text-gray-800 font-semibold">
                      {formatINR(order.amount)}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
            <AlertTriangle size={16} className="text-orange-500" />
            <h2 className="text-gray-900 font-semibold text-base">
              Low Stock Alerts
            </h2>
          </div>

          <div className="divide-y divide-gray-50">
            {lowStockProducts.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <CheckCircle2 size={32} className="text-green-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">All products are well stocked!</p>
              </div>
            ) : (
              lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between px-5 py-3.5"
                >
                  <div className="min-w-0">
                    <p className="text-gray-800 text-sm font-medium truncate pr-2">
                      {product.name}
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      {product.categoryName}
                    </p>
                  </div>
                  <span
                    className={`flex-shrink-0 inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      product.stock === 0
                        ? "bg-red-100 text-red-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {product.stock === 0 ? "Out" : `${product.stock} left`}
                  </span>
                </div>
              ))
            )}
          </div>

          {lowStockProducts.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100">
              <button
                onClick={() => navigate("/admin/products")}
                className="text-sm font-medium w-full text-center hover:underline"
                style={{ color: "#1B6B3A" }}
              >
                Manage Products →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Products",
            value: dummyProducts.length,
            icon: Package,
            path: "/admin/products",
          },
          {
            label: "Categories",
            value: 8,
            icon: TrendingUp,
            path: "/admin/categories",
          },
          {
            label: "Delivered",
            value: dummyOrders.filter((o) => o.status === "delivered").length,
            icon: CheckCircle2,
            path: "/admin/orders",
          },
          {
            label: "Low Stock",
            value: lowStockProducts.length,
            icon: AlertTriangle,
            path: "/admin/products",
          },
        ].map(({ label, value, icon: Icon, path }) => (
          <button
            key={label}
            onClick={() => navigate(path)}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 hover:border-green-200 hover:shadow-md transition-all group text-left"
          >
            <Icon
              size={18}
              className="text-gray-400 group-hover:text-green-600 transition-colors"
            />
            <div>
              <p className="text-gray-800 font-bold text-lg leading-none">
                {value}
              </p>
              <p className="text-gray-500 text-xs mt-0.5">{label}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
