import React, { Suspense, lazy } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAppContext } from "./context/AppContext";

// Layouts & Shared
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Loading from "./components/Loading";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Login from "./components/Login";
import ScrollToTop from "./components/ScrollToTop";
import SEO from "./components/SEO";

// Customer Pages (lazy loaded)
const Home = lazy(() => import("./pages/Home"));
const AllProducts = lazy(() => import("./pages/AllProducts"));
const ProductCategory = lazy(() => import("./pages/ProductCategory"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const MyOrders = lazy(() => import("./pages/MyOrders"));
const Profile = lazy(() => import("./pages/Profile"));
const AddAddress = lazy(() => import("./pages/AddAddress"));

// Admin Pages (lazy loaded)
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminProducts = lazy(() => import("./pages/admin/Products"));
const AddEditProduct = lazy(() => import("./pages/admin/AddEditProduct"));
const AdminCategories = lazy(() => import("./pages/admin/Categories"));
const AdminOrders = lazy(() => import("./pages/admin/Orders"));
const AdminCustomers = lazy(() => import("./pages/admin/Customers"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminStaff = lazy(() => import("./pages/admin/Staff"));

const App = () => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");
  const isPrivatePath =
    isAdminPath ||
    ["/cart", "/checkout", "/my-orders", "/profile", "/add-address"].some(
      (path) => location.pathname.startsWith(path)
    );
  const { showUserLogin, authLoading } = useAppContext();

  if (authLoading) return <Loading fullScreen />;

  return (
    <div className="min-h-screen bg-white text-gray-800" style={{ fontFamily: "'Inter', sans-serif" }}>
      <ScrollToTop />
      {isPrivatePath && (
        <SEO
          title="Kerala Yard"
          description="Kerala Yard account, checkout, cart, and admin pages."
          noIndex
        />
      )}
      {!isAdminPath && <Navbar />}
      {showUserLogin && <Login />}

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { borderRadius: "12px", fontSize: "14px" },
        }}
      />

      <Suspense fallback={<Loading />}>
        <div className={isAdminPath ? "" : ""}>
          <Routes>
            {/* ── Customer Routes ── */}
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<AllProducts />} />
            <Route path="/products/:category" element={<ProductCategory />} />
            <Route path="/products/:category/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />

            {/* Protected Customer Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/my-orders" element={<MyOrders />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/add-address" element={<AddAddress />} />
            </Route>

            {/* ── Admin Routes ── */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="products/add" element={<AddEditProduct />} />
                <Route path="products/edit/:id" element={<AddEditProduct />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="users" element={<AdminStaff />} />
              </Route>
            </Route>
          </Routes>
        </div>
      </Suspense>

      {!isAdminPath && <Footer />}
    </div>
  );
};

export default App;
