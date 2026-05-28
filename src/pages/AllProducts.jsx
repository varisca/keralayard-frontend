import { useEffect, useMemo, useState } from "react";
import { useAppContext } from "../context/AppContext";
import ProductCard from "../components/ProductCard";
import SEO from "../components/SEO";
import { dummyProducts, categories as staticCategories } from "../assets/keralaData";

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
    searchQuery,
    setSearchQuery,
    categories,
  } = useAppContext();

  const sourceProducts = products && products.length > 0 ? products : dummyProducts;
  const activeCategories =
    categories && categories.length > 0 ? categories : staticCategories;

  const [activeCategory, setActiveCategory] = useState("all");
  const [filtered, setFiltered] = useState(sourceProducts);
  const [localSearch, setLocalSearch] = useState(searchQuery || "");

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
    setLocalSearch(searchQuery || "");
  }, [searchQuery]);

  useEffect(() => {
    let result = sourceProducts.filter(isVisibleProduct);
    const categoryObj = activeCategories.find((c) => c.id === activeCategory);

    if (categoryObj) {
      result = result.filter((p) => productMatchesCategory(p, categoryObj));
    }

    if (localSearch.trim()) {
      const q = normalise(localSearch);
      result = result.filter(
        (p) =>
          normalise(p.name).includes(q) ||
          normalise(p.categoryName).includes(q) ||
          normalise(p.category).includes(q) ||
          normalise(p.description).includes(q) ||
          p.tags?.some((tag) => normalise(tag).includes(q))
      );
    }

    setFiltered(result);
  }, [sourceProducts, activeCategories, activeCategory, localSearch]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearch(value);
    setSearchQuery(value);
  };

  const selectedCategory = activeCategories.find((c) => c.id === activeCategory);

  return (
    <div className="min-h-screen bg-warm pb-24 md:pt-8 md:pb-16">
      <SEO
        title="Shop Kerala Products Online"
        description="Browse Kerala Yard products online, including banana chips, coconut oil, spices, pickles, breakfast mixes, and homemade Kerala snacks."
        keywords="shop Kerala products online, Kerala groceries, banana chips online, coconut oil online, Kerala spices, Kerala snacks"
      />

      <div className="max-w-7xl mx-auto">
        <div className="px-4 sm:px-6 lg:px-8 pt-6 md:pt-0 pb-5">
          <h1 className="text-2xl md:text-4xl font-bold text-dark">
            All Kerala Products
          </h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">
            Authentic flavours from God's Own Country, delivered to your door.
          </p>
          <div className="w-16 h-1 bg-primary rounded-full mt-3" />

          <div className="relative mt-6 max-w-xl">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
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
              placeholder="Search products, categories, tags..."
              className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
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
                x
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-[92px_minmax(0,1fr)] md:grid-cols-[220px_minmax(0,1fr)] border-t border-gray-200 bg-white md:rounded-2xl md:border md:shadow-sm md:mx-6 lg:mx-8">
          <aside className="bg-gray-50 border-r border-gray-200">
            <div className="sticky top-0 md:top-24 max-h-[calc(100vh-88px)] overflow-y-auto">
              <button
                onClick={() => setActiveCategory("all")}
                className={`w-full min-h-[78px] md:min-h-0 md:py-4 px-2 md:px-4 flex flex-col md:flex-row items-center md:items-start justify-center md:justify-between gap-1 md:gap-3 text-center md:text-left border-b border-gray-200 transition ${
                  activeCategory === "all"
                    ? "bg-white text-primary border-l-4 border-l-primary"
                    : "text-gray-600 hover:bg-white"
                }`}
              >
                <span className="text-lg md:hidden">All</span>
                <span className="text-xs md:text-sm font-semibold leading-tight">All</span>
                <span className="hidden md:inline text-xs text-gray-400">{categoryCounts.all || 0}</span>
              </button>

              {activeCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full min-h-[86px] md:min-h-0 md:py-4 px-2 md:px-4 flex flex-col md:flex-row items-center md:items-start justify-center md:justify-between gap-1 md:gap-3 text-center md:text-left border-b border-gray-200 transition ${
                    activeCategory === cat.id
                      ? "bg-white text-primary border-l-4 border-l-primary"
                      : "text-gray-600 hover:bg-white"
                  }`}
                >
                  <span className="text-xl leading-none">{cat.icon || ""}</span>
                  <span className="flex-1 text-[11px] md:text-sm font-semibold leading-tight line-clamp-2">
                    {cat.name}
                  </span>
                  <span className="hidden md:inline text-xs text-gray-400">
                    {categoryCounts[cat.id] || 0}
                  </span>
                </button>
              ))}
            </div>
          </aside>

          <main className="min-w-0 p-3 md:p-6">
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
                <span className="text-5xl mb-4">{selectedCategory?.icon || ""}</span>
                <h3 className="text-lg font-semibold text-dark mb-2">
                  No products found
                </h3>
                <p className="text-gray-500 text-sm mb-6 max-w-xs">
                  Try another category or clear your search.
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
