import { useEffect, useMemo, useState } from "react";
import { useAppContext } from "../context/AppContext";
import ProductCard from "../components/ProductCard";
import SEO from "../components/SEO";
import { Search } from "lucide-react";

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

const normalise = (value = "") => (value ?? "").toString().trim().toLowerCase();

const slugify = (value = "") =>
  normalise(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const isVisibleProduct = (product) =>
  product.active !== false &&
  product.isActive !== false &&
  product.status !== "inactive" &&
  product.status !== "draft";

const getCategoryTokens = (category = {}) =>
  [
    category.id,
    category.docId,
    category.slug,
    category.name,
    slugify(category.slug),
    slugify(category.name),
  ]
    .filter(Boolean)
    .map(normalise);

const getProductCategoryTokens = (product = {}) =>
  [
    product.categoryId,
    product.categoryDocId,
    product.categorySlug,
    product.categoryName,
    product.category,
    product.category?.id,
    product.category?.slug,
    product.category?.name,
    slugify(product.categoryName),
    slugify(product.category),
  ]
    .filter(Boolean)
    .map(normalise);

const productMatchesCategory = (product, category) => {
  const productTokens = getProductCategoryTokens(product);
  const categoryTokens = getCategoryTokens(category);
  return productTokens.some((token) => categoryTokens.includes(token));
};

const AllProducts = () => {
  const {
    products,
    productsLoading,
    categories,
  } = useAppContext();

  const sourceProducts = products || [];
  
  // Filter active categories so deactivated ones disappear
  const activeCategories = useMemo(() => {
    return (categories || []).filter((c) => c.active !== false);
  }, [categories]);

  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filtered, setFiltered] = useState(sourceProducts);

  const categoryCounts = useMemo(() => {
    const counts = { all: 0 };
    sourceProducts
      .filter(isVisibleProduct)
      .forEach((product) => {
        counts.all += 1;
        activeCategories.forEach((cat) => {
          if (productMatchesCategory(product, cat)) {
            counts[cat.id] = (counts[cat.id] || 0) + 1;
          }
        });
      });
    return counts;
  }, [activeCategories, sourceProducts]);

  useEffect(() => {
    let result = sourceProducts.filter(isVisibleProduct);
    const categoryObj = activeCategories.find((c) => c.id === activeCategory);
    if (categoryObj) {
      result = result.filter((p) => productMatchesCategory(p, categoryObj));
    }
    
    // Direct catalog search filtering
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }
    
    setFiltered(result);
  }, [sourceProducts, activeCategories, activeCategory, searchQuery]);

  const selectedCategory = activeCategories.find((c) => c.id === activeCategory);

  return (
    <div className="min-h-screen bg-warm pb-24 md:pt-8 md:pb-16">
      <SEO
        title="Shop Kerala Products Online"
        description="Browse Kerala Yard products online, including banana chips, coconut oil, spices, pickles, breakfast mixes, and homemade Kerala snacks."
        keywords="shop Kerala products online, Kerala groceries, banana chips online, coconut oil online, Kerala spices, Kerala snacks"
      />

      <div className="max-w-7xl mx-auto">
        <div className="hidden md:block px-4 sm:px-6 lg:px-8 pt-6 md:pt-0 pb-5">
          <h1 className="text-2xl md:text-4xl font-bold text-dark">
            All Kerala Products
          </h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">
            Authentic flavours from God's Own Country, delivered to your door.
          </p>
          <div className="w-16 h-1 bg-primary rounded-full mt-3" />

        </div>

        <div className="grid grid-cols-[92px_minmax(0,1fr)] md:grid-cols-[220px_minmax(0,1fr)] border-t border-gray-200 bg-white md:rounded-2xl md:border md:shadow-sm md:mx-6 lg:mx-8">
          <aside className="bg-gray-50 border-r border-gray-200">
            <div className="sticky top-[96px] md:top-24 max-h-[calc(100vh-96px-64px-env(safe-area-inset-bottom))] md:max-h-[calc(100vh-88px)] overflow-y-auto no-scrollbar">
              <button
                onClick={() => setActiveCategory("all")}
                className={`w-full min-h-[52px] md:min-h-0 md:py-4 px-3 md:px-4 flex flex-row items-center justify-between gap-2 border-b border-gray-200 transition ${
                  activeCategory === "all"
                    ? "bg-white text-primary border-l-4 border-l-primary"
                    : "text-gray-600 hover:bg-white"
                }`}
              >
                <span className="text-xs md:text-sm font-semibold leading-tight">All</span>
                <span className="text-xs text-gray-400 flex-shrink-0">{categoryCounts.all || 0}</span>
              </button>

              {activeCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full min-h-[52px] md:min-h-0 md:py-4 px-3 md:px-4 flex flex-row items-center justify-between gap-2 border-b border-gray-200 transition ${
                    activeCategory === cat.id
                      ? "bg-white text-primary border-l-4 border-l-primary"
                      : "text-gray-600 hover:bg-white"
                  }`}
                >
                  <span className="flex-1 text-[11px] md:text-sm font-semibold leading-tight text-left line-clamp-2">
                    {cat.name}
                  </span>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {categoryCounts[cat.id] || 0}
                  </span>
                </button>
              ))}
            </div>
          </aside>

          <main className="min-w-0 p-3 md:p-6">
            {/* Direct Search Bar */}
            <div className="relative mb-6 w-full max-w-md">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search spices, banana chips, coconut oil..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
              />
            </div>

            {!productsLoading && (
              <div className="mb-4">
                <h2 className="text-base md:text-xl font-bold text-dark">
                  {selectedCategory?.name || "All Products"}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {filtered.length} product{filtered.length !== 1 ? "s" : ""} found
                </p>
              </div>
            )}

            {productsLoading && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            )}

            {!productsLoading && filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <h3 className="text-lg font-semibold text-dark mb-2">
                  No products found
                </h3>
                <p className="text-gray-500 text-sm mb-6 max-w-xs">
                  Try another category.
                </p>
                <button
                  onClick={() => setActiveCategory("all")}
                  className="btn-primary px-6 py-2.5 text-sm"
                >
                  Show all
                </button>
              </div>
            )}

            {!productsLoading && filtered.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
                {filtered.map((product) => (
                  <ProductCard key={product.id || product._id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AllProducts;
