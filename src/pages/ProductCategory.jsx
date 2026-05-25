import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import ProductCard from "../components/ProductCard";
import { dummyProducts, categories as staticCategories } from "../assets/keralaData";

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

const ProductCategory = () => {
  const { category } = useParams();
  const { products, productsLoading, categories: contextCategories, navigate } = useAppContext();

  const sourceProducts =
    products && products.length > 0 ? products : dummyProducts;

  const activeCategories =
    contextCategories && contextCategories.length > 0 ? contextCategories : staticCategories;

  // Resolve the category object from the slug or id
  const categoryObj =
    activeCategories.find(
      (c) =>
        c.slug === category ||
        c.id === category ||
        c.name.toLowerCase() === category?.toLowerCase()
    ) || null;

  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    if (!sourceProducts.length) return;

    // Only show active products on storefront
    const activeProducts = sourceProducts.filter((p) => p.active !== false);

    const result = activeProducts.filter((p) => {
      if (categoryObj) {
        return (
          p.categoryId === categoryObj.id ||
          p.categoryName?.toLowerCase() === categoryObj.name?.toLowerCase()
        );
      }
      // Fallback: match by raw param
      return (
        p.categoryId === category ||
        p.categoryName?.toLowerCase() === category?.toLowerCase() ||
        p.slug?.includes(category)
      );
    });

    setFiltered(result);
  }, [sourceProducts, category, categoryObj]);

  const displayName = categoryObj?.name || category || "Category";
  const displayIcon = categoryObj?.icon || "🌿";

  return (
    <div className="min-h-screen bg-warm pt-36 md:pt-40 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Breadcrumb ────────────────────────────────────────────── */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
          <Link to="/" className="hover:text-primary transition">
            Home
          </Link>
          <span>/</span>
          <Link to="/products" className="hover:text-primary transition">
            Products
          </Link>
          <span>/</span>
          <span className="text-primary font-medium">{displayName}</span>
        </nav>

        {/* ── Category Header ───────────────────────────────────────── */}
        <div
          className="rounded-2xl p-6 md:p-10 mb-10 flex items-center gap-6"
          style={{ backgroundColor: categoryObj?.bgColor || "#F0F8F0" }}
        >
          {/* Icon badge */}
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/60 flex items-center justify-center text-4xl md:text-5xl shadow-sm flex-shrink-0">
            {displayIcon}
          </div>

          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-dark leading-tight">
              {displayName}
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              {productsLoading
                ? "Loading…"
                : `${filtered.length} product${filtered.length !== 1 ? "s" : ""} available`}
            </p>
            <div className="w-12 h-1 bg-primary rounded-full mt-3" />
          </div>
        </div>

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
              No products in this category
            </h3>
            <p className="text-gray-500 text-sm mb-6 max-w-xs">
              We're working on adding more authentic Kerala products here. Check
              back soon!
            </p>
            <button
              onClick={() => navigate("/products")}
              className="btn-primary px-6 py-2.5 text-sm"
            >
              Browse all products
            </button>
          </div>
        )}

        {/* ── Product Grid ───────────────────────────────────────────── */}
        {!productsLoading && filtered.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {filtered.map((product) => (
                <ProductCard
                  key={product.id || product._id}
                  product={product}
                />
              ))}
            </div>

            {/* Browse all CTA */}
            <div className="flex justify-center mt-12">
              <button
                onClick={() => {
                  navigate("/products");
                  window.scrollTo(0, 0);
                }}
                className="border border-primary text-primary hover:bg-primary hover:text-white px-8 py-2.5 rounded-full text-sm font-medium transition-all"
              >
                Browse all products →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductCategory;
