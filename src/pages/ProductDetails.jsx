import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import SEO from "../components/SEO";
import { dummyProducts, categories } from "../assets/keralaData";

const ProductDetails = () => {
  const { products, productsLoading, navigate, currency, addToCart, removeFromCart, cartItems } =
    useAppContext();

  const { id } = useParams();

  const sourceProducts =
    products && products.length > 0 ? products : dummyProducts;

  // Find product — keralaData uses `id`, legacy data uses `_id`
  const product = sourceProducts.find((p) => p.id === id || p._id === id);

  const images =
    product?.images?.filter(Boolean) ||
    (product?.image ? product.image.filter(Boolean) : []);

  const [mainImage, setMainImage] = useState(null);
  const [qty, setQty] = useState(0);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  // Set initial main image
  useEffect(() => {
    if (images.length > 0) {
      setMainImage(images[0]);
    }
  }, [product]);

  // Sync qty from cart
  useEffect(() => {
    if (product) {
      const pid = product.id || product._id;
      setQty(cartItems[pid] || 0);
    }
  }, [cartItems, product]);

  const handleAddToCart = () => {
    const pid = product.id || product._id;
    addToCart(pid);
  };

  const handleRemoveFromCart = () => {
    const pid = product.id || product._id;
    removeFromCart(pid);
  };

  const inCart = qty > 0;

  // Resolve category object
  const categoryObj = categories.find(
    (c) =>
      c.id === product?.categoryId ||
      c.name === product?.categoryName ||
      c.name === product?.category
  );

  // ── Not found ───────────────────────────────────────────────────────────
  if (!productsLoading && !product) {
    return (
      <div className="min-h-screen bg-warm flex flex-col items-center justify-center py-24 text-center px-4">
        <SEO
          title="Product Not Found"
          description="This Kerala Yard product is unavailable. Browse all Kerala groceries and traditional products online."
          noIndex
        />
        <span className="text-7xl mb-4">🌿</span>
        <h2 className="text-2xl font-bold text-dark mb-2">Product not found</h2>
        <p className="text-gray-500 text-sm mb-6">
          The product you're looking for doesn't exist or has been removed.
        </p>
        <button
          onClick={() => navigate("/products")}
          className="btn-primary px-6 py-2.5 text-sm"
        >
          Browse all products
        </button>
      </div>
    );
  }

  if (!product) return null;

  const pid = product.id || product._id;
  const mrp = product.mrp || product.price || 0;
  const sellingPrice = product.sellingPrice || product.offerPrice || mrp;
  const stock = product.stock ?? 99;
  const inStock = stock > 0;
  const description = Array.isArray(product.description)
    ? product.description.join(" ")
    : product.description || "";
  const weight = product.weight || "";
  const tags = product.tags || [];
  const categoryName =
    product.categoryName || product.category || categoryObj?.name || "";
  const categorySlug =
    categoryObj?.slug || categoryName.toLowerCase().replace(/\s+/g, "-");
  const primaryImage = images.filter(Boolean)[0] || "/hero_banner.png";
  const productDescription =
    description ||
    `Buy ${product.name} online from Kerala Yard. Authentic Kerala groceries delivered fresh.`;
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: productDescription,
    image: [`${window.location.origin}${primaryImage}`],
    brand: {
      "@type": "Brand",
      name: "Kerala Yard",
    },
    category: categoryName,
    sku: pid,
    offers: {
      "@type": "Offer",
      url: `${window.location.origin}/products/${categorySlug}/${pid}`,
      priceCurrency: "INR",
      price: sellingPrice,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <div className="min-h-screen bg-warm pt-36 md:pt-20 pb-16">
      <SEO
        title={`${product.name} Online`}
        description={productDescription.slice(0, 155)}
        keywords={`${product.name}, ${categoryName}, buy ${product.name} online, Kerala groceries, Kerala Yard`}
        image={primaryImage}
        type="product"
        jsonLd={productSchema}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Breadcrumb ────────────────────────────────────────────── */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-8 flex-wrap">
          <Link to="/" className="hover:text-primary transition">
            Home
          </Link>
          <span>/</span>
          <Link to="/products" className="hover:text-primary transition">
            Products
          </Link>
          {categoryName && (
            <>
              <span>/</span>
              <Link
                to={`/products/${categorySlug}`}
                className="hover:text-primary transition"
              >
                {categoryName}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-primary font-medium line-clamp-1">
            {product.name}
          </span>
        </nav>

        {/* ── Main Content ──────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row gap-10 lg:gap-16">

          {/* ── LEFT: Image Gallery ────────────────────────────────── */}
          <div className="flex flex-col gap-4 w-full md:w-5/12 lg:w-2/5">
            {/* Main image */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex items-center justify-center p-6 shadow-sm min-h-[280px] md:min-h-[360px]">
              {mainImage ? (
                <img
                  src={mainImage}
                  alt={product.name}
                  className="max-h-72 md:max-h-96 w-auto object-contain transition-all duration-300 hover:scale-105"
                />
              ) : (
                <div className="flex flex-col items-center gap-3 text-gray-300">
                  <span className="text-7xl">
                    {categoryObj?.icon || "🌿"}
                  </span>
                  <span className="text-sm">No image available</span>
                </div>
              )}
            </div>

            {/* Thumbnails — only if more than 1 image */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setMainImage(img)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl border-2 overflow-hidden bg-white transition-all ${
                      mainImage === img
                        ? "border-primary shadow-md"
                        : "border-gray-200 hover:border-primary/50"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${i + 1}`}
                      className="w-full h-full object-contain p-1"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Product Info ────────────────────────────────── */}
          <div className="flex flex-col w-full md:w-7/12 lg:w-3/5">

            {/* Category badge */}
            {categoryName && (
              <Link
                to={`/products/${categorySlug}`}
                className="inline-flex items-center gap-1.5 w-fit px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition mb-3"
              >
                {categoryObj?.icon && (
                  <span>{categoryObj.icon}</span>
                )}
                {categoryName}
              </Link>
            )}

            {/* Product name */}
            <h1 className="text-2xl md:text-3xl font-bold text-dark leading-snug mb-3">
              {product.name}
            </h1>

            {/* Price row */}
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <span className="text-3xl font-bold text-primary">
                {currency}{sellingPrice}
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-5">
              (inclusive of all taxes)
            </p>

            {/* Weight / quantity info */}
            {weight && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-gray-500">
                  <span className="font-medium text-gray-700">Pack size:</span>{" "}
                  {weight}
                </span>
              </div>
            )}

            {/* Stock status */}
            <div className="flex items-center gap-2 mb-5">
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full ${
                  inStock ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span
                className={`text-sm font-semibold ${
                  inStock ? "text-green-600" : "text-red-500"
                }`}
              >
                {inStock ? "In Stock" : "Out of Stock"}
              </span>
              {inStock && stock <= 10 && (
                <span className="text-xs text-orange-500 font-medium ml-1">
                  (Only {stock} left!)
                </span>
              )}
            </div>

            {/* Divider */}
            <hr className="border-gray-200 mb-5" />

            {/* Description */}
            {description && (
              <div className="mb-5">
                <p className="text-sm font-semibold text-dark mb-2">
                  About this product
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {description}
                </p>
              </div>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* ── Quantity Selector + CTA ────────────────────────── */}
            <div className="flex items-center gap-4 flex-wrap mt-auto pt-2">
              {/* Blinkit-style qty selector */}
              {inCart ? (
                <div className="flex items-center gap-0 rounded-xl overflow-hidden border-2 border-primary bg-white shadow-sm">
                  <button
                    onClick={handleRemoveFromCart}
                    className="w-11 h-11 flex items-center justify-center text-primary text-xl font-bold hover:bg-primary/10 transition cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="w-10 text-center font-bold text-dark text-base">
                    {qty}
                  </span>
                  <button
                    onClick={handleAddToCart}
                    className="w-11 h-11 flex items-center justify-center text-primary text-xl font-bold hover:bg-primary/10 transition cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={handleAddToCart}
                    disabled={!inStock}
                    className="flex-1 sm:flex-none btn-primary px-8 py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    🛒 Add to Cart
                  </button>
                </div>
              )}

              {inCart && (
                <button
                  onClick={() => {
                    navigate("/cart");
                    window.scrollTo(0, 0);
                  }}
                  className="flex-1 sm:flex-none btn-accent px-8 py-3 text-sm"
                >
                  Go to Cart →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
