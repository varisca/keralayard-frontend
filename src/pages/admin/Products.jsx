import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Package,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import toast from "react-hot-toast";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useAppContext } from "../../context/AppContext";

// ─────────────────────────────────────────────────────────────
// Toggle Switch Component
// ─────────────────────────────────────────────────────────────
const Toggle = ({ checked, onChange, activeColor = "#1B6B3A" }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none cursor-pointer`}
    style={{ backgroundColor: checked ? activeColor : "#D1D5DB" }}
    aria-checked={checked}
    role="switch"
  >
    <span
      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${
        checked ? "translate-x-4.5" : "translate-x-0.5"
      }`}
    />
  </button>
);

// ─────────────────────────────────────────────────────────────
// Confirmation Dialog
// ─────────────────────────────────────────────────────────────
const ConfirmDialog = ({ isOpen, productName, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <Trash2 size={18} className="text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Delete Product</h3>
            <p className="text-sm text-gray-500">This action cannot be undone</p>
          </div>
        </div>
        <p className="text-gray-700 text-sm mb-5">
          Are you sure you want to delete{" "}
          <span className="font-semibold">"{productName}"</span>?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Inline Stock Editor Component
// ─────────────────────────────────────────────────────────────
const InlineStockEditor = ({ product, isEmployee }) => {
  const [val, setVal] = useState(product.stock || 0);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    setVal(product.stock || 0);
  }, [product.stock]);

  const handleUpdate = async (newStock) => {
    if (isEmployee) return;
    const stockNum = Math.max(0, parseInt(newStock, 10) || 0);
    setVal(stockNum);
    
    if (stockNum === product.stock) return;

    setUpdating(true);
    try {
      await updateDoc(doc(db, "products", product.id), { stock: stockNum });
      toast.success(`Stock updated for ${product.name}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update stock");
      setVal(product.stock || 0);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-1 justify-center md:justify-start animate-fade-in" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        disabled={updating || isEmployee || val <= 0}
        onClick={() => handleUpdate(val - 1)}
        className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 disabled:opacity-40 flex items-center justify-center font-bold text-xs cursor-pointer focus:outline-none transition-colors"
      >
        –
      </button>
      <input
        type="number"
        disabled={updating || isEmployee}
        value={val}
        min="0"
        onChange={(e) => setVal(e.target.value)}
        onBlur={() => handleUpdate(val)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleUpdate(val);
            e.target.blur();
          }
        }}
        className="w-12 text-center text-xs border border-gray-200 rounded py-1 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none font-semibold text-gray-700 bg-white"
      />
      <button
        type="button"
        disabled={updating || isEmployee}
        onClick={() => handleUpdate(val + 1)}
        className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 disabled:opacity-40 flex items-center justify-center font-bold text-xs cursor-pointer focus:outline-none transition-colors"
      >
        +
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Products Page
// ─────────────────────────────────────────────────────────────
const Products = () => {
  const navigate = useNavigate();
  const { products, categories, user } = useAppContext();
  const isEmployee = user?.role === "employee";
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, name }
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 8;

  // Filtered products
  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.categoryName.toLowerCase().includes(search.toLowerCase());
      const matchCat =
        categoryFilter === "all" || p.categoryId === categoryFilter;
      
      let matchStock = true;
      if (stockFilter === "inStock") {
        matchStock = p.stock > 0;
      } else if (stockFilter === "lowStock") {
        matchStock = p.stock > 0 && p.stock <= 10;
      } else if (stockFilter === "outOfStock") {
        matchStock = p.stock === 0;
      }

      return matchSearch && matchCat && matchStock;
    });
  }, [products, search, categoryFilter, stockFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Toggle featured
  const toggleFeatured = async (id) => {
    if (isEmployee) {
      return toast.error("Access denied. Employees have view-only catalog rights.");
    }
    const prod = products.find((p) => p.id === id);
    if (!prod) return;
    try {
      await updateDoc(doc(db, "products", id), { featured: !prod.featured });
      toast.success("Featured status updated!");
    } catch (err) {
      console.error("Featured update error:", err);
      toast.error("Failed to update featured status");
    }
  };

  // Toggle active
  const toggleActive = async (id) => {
    if (isEmployee) {
      return toast.error("Access denied. Employees have view-only catalog rights.");
    }
    const prod = products.find((p) => p.id === id);
    if (!prod) return;
    try {
      await updateDoc(doc(db, "products", id), { active: !prod.active });
      toast.success("Product visibility updated!");
    } catch (err) {
      console.error("Active status update error:", err);
      toast.error("Failed to update product status");
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteDoc(doc(db, "products", deleteTarget.id));
      toast.success(`"${deleteTarget.name}" deleted from Firestore`);
      setDeleteTarget(null);
    } catch (err) {
      console.error("Delete product error:", err);
      toast.error("Failed to delete product");
    }
  };

  const formatINR = (n) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {filtered.length} product{filtered.length !== 1 ? "s" : ""} found
          </p>
        </div>
        {!isEmployee && (
          <button
            onClick={() => navigate("/admin/products/add")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: "#1B6B3A" }}
          >
            <Plus size={17} />
            Add Product
          </button>
        )}
      </div>

      {/* Role Restriction Banner */}
      {isEmployee && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex gap-3 items-start">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 text-orange-600">
            ⚠️
          </div>
          <div>
            <h4 className="font-semibold text-orange-950 text-sm">Employee View-Only Products Catalog</h4>
            <p className="text-orange-800 text-xs mt-0.5 leading-relaxed">
              Your account has view-only catalog clearance. You can browse all store items and inspect stock numbers,
              but cannot create new listings, edit active details, toggle product statuses, or delete inventory records.
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <Filter
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-8 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 bg-white appearance-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Stock Filter */}
        <div className="relative">
          <Package
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <select
            value={stockFilter}
            onChange={(e) => {
              setStockFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-8 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 bg-white appearance-none cursor-pointer"
          >
            <option value="all">All Stock Levels</option>
            <option value="inStock">In Stock Only</option>
            <option value="lowStock">Low Stock (≤10)</option>
            <option value="outOfStock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Package size={40} className="mb-3 opacity-40" />
            <p className="font-medium">No products found</p>
            <p className="text-sm">Try adjusting your search or filter</p>
          </div>
        ) : (
          <>
          <div className="md:hidden divide-y divide-gray-100">
            {paginated.map((product) => (
              <div key={product.id} className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl">🛍️</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 leading-tight">{product.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{product.categoryName} · {product.weight}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <p className="font-bold text-[#1B6B3A]">{formatINR(product.sellingPrice)}</p>
                      <p className="text-xs text-gray-400 line-through">{formatINR(product.mrp)}</p>
                    </div>
                  </div>
                  {!isEmployee ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                        className="p-2 rounded-xl text-gray-500 bg-gray-50 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Edit"
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ id: product.id, name: product.name })}
                        className="p-2 rounded-xl text-gray-500 bg-gray-50 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ) : null}
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded-xl bg-gray-50 p-2 flex flex-col justify-between">
                    <p className="text-gray-400 font-bold uppercase text-[9px]">Stock</p>
                    <div className="mt-1">
                      <InlineStockEditor product={product} isEmployee={isEmployee} />
                    </div>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-2">
                    <p className="text-gray-400 font-bold uppercase">Featured</p>
                    <div className="mt-1">
                      <Toggle checked={product.featured} onChange={() => toggleFeatured(product.id)} activeColor="#D4A017" />
                    </div>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-2">
                    <p className="text-gray-400 font-bold uppercase">Active</p>
                    <div className="mt-1">
                      <Toggle checked={product.active} onChange={() => toggleActive(product.id)} activeColor="#1B6B3A" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-medium">Product</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">
                    Category
                  </th>
                  <th className="text-left px-4 py-3 font-medium">Price</th>
                  <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">
                    Stock
                  </th>
                  <th className="text-center px-4 py-3 font-medium hidden lg:table-cell">
                    Featured
                  </th>
                  <th className="text-center px-4 py-3 font-medium hidden lg:table-cell">
                    Active
                  </th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    {/* Product name + image */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        {/* Thumbnail */}
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.parentNode.innerHTML = "🛍️";
                              }}
                            />
                          ) : (
                            <span className="text-lg">🛍️</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 truncate max-w-[160px]">
                            {product.name}
                          </p>
                          <p className="text-gray-400 text-xs">{product.weight}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg font-medium">
                        {product.categoryName}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3.5">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {formatINR(product.sellingPrice)}
                        </p>
                        <p className="text-gray-400 text-xs line-through">
                          {formatINR(product.mrp)}
                        </p>
                      </div>
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <div className="flex flex-col gap-1.5 justify-center">
                        <InlineStockEditor product={product} isEmployee={isEmployee} />
                        <span
                          className={`inline-block text-[10px] font-semibold text-center w-fit px-2 py-0.5 rounded ${
                            product.stock === 0
                              ? "bg-red-100 text-red-700"
                              : product.stock <= 10
                              ? "bg-orange-100 text-orange-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {product.stock === 0 ? "Out of stock" : product.stock <= 10 ? `Low Stock (${product.stock})` : "In Stock"}
                        </span>
                      </div>
                    </td>

                    {/* Featured Toggle */}
                    <td className="px-4 py-3.5 hidden lg:table-cell text-center">
                      <div className="flex justify-center">
                        <Toggle
                          checked={product.featured}
                          onChange={() => toggleFeatured(product.id)}
                          activeColor="#D4A017"
                        />
                      </div>
                    </td>

                    {/* Active Toggle */}
                    <td className="px-4 py-3.5 hidden lg:table-cell text-center">
                      <div className="flex justify-center">
                        <Toggle
                          checked={product.active}
                          onChange={() => toggleActive(product.id)}
                          activeColor="#1B6B3A"
                        />
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right">
                      {!isEmployee ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() =>
                              navigate(`/admin/products/edit/${product.id}`)
                            }
                            className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteTarget({ id: product.id, name: product.name })
                            }
                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium">Read-Only</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500 text-center sm:text-left">
              Showing {(currentPage - 1) * PAGE_SIZE + 1}–
              {Math.min(currentPage * PAGE_SIZE, filtered.length)} of{" "}
              {filtered.length}
            </p>
            <div className="flex items-center justify-center gap-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  onClick={() => setCurrentPage(pg)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    pg === currentPage
                      ? "text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  style={
                    pg === currentPage ? { backgroundColor: "#1B6B3A" } : {}
                  }
                >
                  {pg}
                </button>
              ))}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        productName={deleteTarget?.name}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default Products;
