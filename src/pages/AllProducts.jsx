import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import ProductCard from "../components/ProductCard";
import { dummyProducts, categories } from "../assets/keralaData";

// ── Skeleton placeholder card ─────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-xl border border-gray-200 p-3 flex flex-col gap-3 animate-pulse">
    <div className="skeleton h-36 w-full rounded-lg" />
    <div className="skeleton h-3 w-1/3 rounded" />
    <div className="skeleton h-4 w-2/3 rounded" />
    <div className="skeleton h-3 w-1/2 rounded" />
    <div className="flex justify-between items-center mt-1">
      <div className="skeleton h-5 w-16 rounded" />
      <div className="skeleton h-8 w-16 rounded" />
    </div>
  </div>
);

const AllProducts = () => {
  const { products, productsLoading, searchQuery, setSearchQuery, navigate } =
    useAppContext();

  // Use context products; fall back to keralaData dummies so the page is never empty
  const sourceProducts =
    products && products.length > 0 ? products : dummyProducts;

  const [activeCategory, setActiveCategory] = useState("all");
  const [filtered, setFiltered] = useState(sourceProducts);
  const [localSearch, setLocalSearch] = useState(searchQuery || "");

  // Sync external searchQuery into local state (e.g. typed in Navbar)
  useEffect(() => {
    setLocalSearch(searchQuery || "");
  }, [searchQuery]);

  // Re-filter whenever source data, search, or category changes
  useEffect(() => {
    let result = [...sourceProducts];

    if (activeCategory !== "all") {
      result = result.filter(
        (p) =>
          p.categoryId === activeCategory ||
          p.categoryName?.toLowerCase() ===
            categories
              .find((c) => c.id === activeCategory)
              ?.name?.toLowerCase()
      );
    }

    if (localSearch.trim()) {
      const q = localSearch.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.categoryName?.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    setFiltered(result);
  }, [sourceProducts, activeCategory, localSearch]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setLocalSearch(val);
    setSearchQuery(val); // keep context in sync
  };

  const handleCategoryClick = (catId) => {
    setActiveCategory(catId);
  };

  return (
    <div className="min-h-screen bg-warm pt-36 md:pt-40 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Page Header ───────────────────────────────────────────── */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-dark">
            All Kerala Products
          </h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">
            Authentic flavours from God's Own Country, delivered to your door.
          </p>
          <div className="w-16 h-1 bg-primary rounded-full mt-3" />
        </div>

        {/* ── Search Bar ────────────────────────────────────────────── */}
        <div className="relative mb-6 max-w-xl">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
            />
          </svg>
          <input
            type="text"
            value={localSearch}
            onChange={handleSearchChange}
            placeholder="Search products, categories, tags…"
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
          />
          {localSearch && (
            <button
              onClick={() => {
                setLocalSearch("");
                setSearchQuery("");
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* ── Category Filter Pills ──────────────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-8">
          {/* All pill */}
          <button
            onClick={() => handleCategoryClick("all")}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
              activeCategory === "all"
                ? "bg-primary text-white border-primary shadow-md"
                : "bg-white text-gray-600 border-gray-200 hover:border-primary/50 hover:text-primary"
            }`}
          >
            🛒 All
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                activeCategory === cat.id
                  ? "bg-primary text-white border-primary shadow-md"
                  : "bg-white text-gray-600 border-gray-200 hover:border-primary/50 hover:text-primary"
              }`}
            >
              <span>{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>

        {/* ── Results Count ─────────────────────────────────────────── */}
        {!productsLoading && (
          <p className="text-xs text-gray-500 mb-4">
            {filtered.length} product{filtered.length !== 1 ? "s" : ""} found
            {activeCategory !== "all"
              ? ` in "${categories.find((c) => c.id === activeCategory)?.name}"`
              : ""}
            {localSearch ? ` for "${localSearch}"` : ""}
          </p>
        )}

        {/* ── Loading Skeletons ──────────────────────────────────────── */}
        {productsLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* ── Empty State ────────────────────────────────────────────── */}
        {!productsLoading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="text-7xl mb-4">🌿</span>
            <h3 className="text-xl font-semibold text-dark mb-2">
              No products found
            </h3>
            <p className="text-gray-500 text-sm mb-6 max-w-xs">
              We couldn't find what you're looking for. Try a different search
              term or browse all categories.
            </p>
            <button
              onClick={() => {
                setLocalSearch("");
                setSearchQuery("");
                setActiveCategory("all");
              }}
              className="btn-primary px-6 py-2.5 text-sm"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* ── Product Grid ───────────────────────────────────────────── */}
        {!productsLoading && filtered.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {filtered.map((product) => (
              <ProductCard key={product.id || product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllProducts;
