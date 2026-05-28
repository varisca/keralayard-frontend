import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Grid3X3,
  ShoppingBag,
  Users,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useAppContext } from "../../context/AppContext";

const SIDEBAR_BG = "#1A1A2E";
const SIDEBAR_BORDER = "#2A2A45";
const ACTIVE_BG = "#1B6B3A";

const navLinks = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/admin",
    end: true,
  },
  {
    label: "Products",
    icon: Package,
    path: "/admin/products",
    end: false,
  },
  {
    label: "Categories",
    icon: Grid3X3,
    path: "/admin/categories",
    end: false,
  },
  {
    label: "Orders",
    icon: ShoppingBag,
    path: "/admin/orders",
    end: false,
  },
  {
    label: "Customers",
    icon: Users,
    path: "/admin/customers",
    end: false,
  },
  {
    label: "Users",
    icon: ShieldCheck,
    path: "/admin/users",
    end: false,
  },
];

const AdminLayout = () => {
  const { user, logout } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const isEmployee = user?.role === "employee";
  const filteredNavLinks = isEmployee
    ? navLinks.filter((link) => link.path === "/admin/orders")
    : navLinks;

  useEffect(() => {
    if (isEmployee && location.pathname !== "/admin/orders") {
      navigate("/admin/orders", { replace: true });
    }
  }, [isEmployee, location.pathname, navigate]);

  const displayName = user?.name || user?.displayName || "Admin";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const SidebarContent = ({ onLinkClick }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 py-5 border-b"
        style={{ borderColor: SIDEBAR_BORDER }}
      >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
          style={{ backgroundColor: ACTIVE_BG }}
        >
          🌿
        </div>
        <div className="hidden md:block">
          <p className="text-white font-bold text-sm leading-tight">
            Kerala Yard
          </p>
          <span
            className="text-xs font-semibold px-1.5 py-0.5 rounded"
            style={{ backgroundColor: "#D4A017", color: "#1A1A2E" }}
          >
            ADMIN
          </span>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        {filteredNavLinks.map(({ label, icon, path, end }) => (
          <NavLink
            key={path}
            to={path}
            end={end}
            onClick={onLinkClick}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group relative",
                isActive
                  ? "text-white font-semibold"
                  : "text-gray-400 hover:text-white hover:bg-white/5",
              ].join(" ")
            }
            style={({ isActive }) =>
              isActive ? { backgroundColor: ACTIVE_BG } : {}
            }
          >
            {({ isActive }) => (
              <>
                {React.createElement(icon, {
                  size: 18,
                  className: `flex-shrink-0 ${isActive ? "text-white" : "text-gray-400 group-hover:text-white"}`,
                })}
                <span className="hidden md:block text-sm">{label}</span>
                {isActive && (
                  <ChevronRight
                    size={14}
                    className="hidden md:block ml-auto text-white/60"
                  />
                )}
                {/* Tooltip for icon-only mobile */}
                <span
                  className="md:hidden absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50"
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User info at bottom */}
      <div
        className="px-4 py-4 border-t"
        style={{ borderColor: SIDEBAR_BORDER }}
      >
        <div className="flex items-center gap-3">
          {/* Avatar */}
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={displayName}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: "#1B6B3A", color: "#fff" }}
            >
              {initials}
            </div>
          )}
          <div className="hidden md:block min-w-0">
            <p className="text-white text-xs font-medium truncate">
              {displayName}
            </p>
            <p className="text-gray-500 text-xs truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* ── Desktop Sidebar ── */}
      <aside
        className="hidden md:flex flex-col w-64 flex-shrink-0"
        style={{ backgroundColor: SIDEBAR_BG }}
      >
        <SidebarContent onLinkClick={undefined} />
      </aside>

      {/* ── Mobile Sidebar (icon-only, w-16) ── */}
      <aside
        className="flex md:hidden flex-col w-16 flex-shrink-0"
        style={{ backgroundColor: SIDEBAR_BG }}
      >
        <SidebarContent onLinkClick={() => setMobileSidebarOpen(false)} />
      </aside>

      {/* ── Mobile Overlay Sidebar ── */}
      {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <aside
            className="fixed left-0 top-0 h-full w-64 z-50 flex flex-col md:hidden"
            style={{ backgroundColor: SIDEBAR_BG }}
          >
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
            <SidebarContent
              onLinkClick={() => setMobileSidebarOpen(false)}
            />
          </aside>
        </>
      )}

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center justify-between flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <button
              className="md:hidden text-gray-500 hover:text-gray-700"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>
            <div>
              <p className="text-gray-800 font-semibold text-sm md:text-base">
                Hello, {isEmployee ? "Employee" : "Admin"} 👋
              </p>
              <p className="text-gray-400 text-xs hidden md:block">
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* User avatar */}
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={displayName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: "#1B6B3A", color: "#fff" }}
              >
                {initials}
              </div>
            )}

            {/* Logout Button */}
            <button
              onClick={logout}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-red-600 border border-gray-200 hover:border-red-300 px-3 py-1.5 rounded-lg transition-colors duration-150"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
