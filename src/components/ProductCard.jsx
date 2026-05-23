import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { categories } from '../assets/keralaData';

const ProductCard = ({ product }) => {
  const { addToCart, removeFromCart, cartItems, currency, navigate } = useAppContext();
  const [imgError, setImgError] = useState(false);

  if (!product) return null;

  // ── Field normalisation: support both keralaData schema and legacy schema ──
  const pid = product.id || product._id;
  const name = product.name;
  const weight = product.weight || product.unit || null;

  // Images: keralaData uses `images[]`, legacy uses `image[]`
  const rawImages = product.images || (product.image ? [product.image].flat() : []);
  const imageUrl = rawImages.filter(Boolean)[0] || null;

  // Prices: keralaData uses mrp + sellingPrice, legacy uses price + offerPrice
  const mrp = product.mrp || product.price || 0;
  const sellingPrice = product.sellingPrice || product.offerPrice || mrp;

  // Category info for routing
  const categoryId = product.categoryId || null;
  const categoryName = product.categoryName || product.category || '';
  const categoryObj = categories.find(
    (c) => c.id === categoryId || c.name === categoryName
  );
  const categorySlug = categoryObj?.slug || categoryName.toLowerCase().replace(/\s+/g, '-');

  // Current quantity in cart
  const qty = cartItems?.[pid] ?? 0;

  // Discount percentage
  const discount =
    mrp && sellingPrice && mrp > sellingPrice
      ? Math.round(((mrp - sellingPrice) / mrp) * 100)
      : 0;

  const handleAdd = (e) => {
    e.stopPropagation();
    addToCart(pid);
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    addToCart(pid);
  };

  const handleDecrement = (e) => {
    e.stopPropagation();
    removeFromCart(pid);
  };

  const goToProduct = () => {
    // Route: /products/:category/:id
    navigate(`/products/${categorySlug}/${pid}`);
    window.scrollTo(0, 0);
  };

  return (
    <div
      onClick={goToProduct}
      className="group relative bg-white rounded-2xl overflow-hidden cursor-pointer flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
      style={{ border: '1px solid #f0ede8' }}
    >
      {/* ── Image area ── */}
      <div className="relative w-full aspect-square bg-gray-50 overflow-hidden">

        {/* Quick-view eye icon (hover) */}
        <div className="absolute top-2.5 right-2.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm shadow flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#1B6B3A"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </div>
        </div>

        {/* Product image */}
        {imageUrl && !imgError ? (
          <img
            src={imageUrl}
            alt={name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl">
              {categoryObj?.icon || '🌿'}
            </span>
          </div>
        )}
      </div>

      {/* ── Content area ── */}
      <div className="flex flex-col flex-1 p-3 gap-1.5">
        {/* Weight / unit */}
        {weight && (
          <span className="text-[11px] text-gray-400 font-medium">{weight}</span>
        )}

        {/* Product name — max 2 lines */}
        <h3
          className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2 flex-1 min-h-[2.5rem]"
          title={name}
        >
          {name}
        </h3>

        {/* Price row */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-base font-bold" style={{ color: '#1B6B3A' }}>
            {currency}{sellingPrice?.toLocaleString('en-IN')}
          </span>
        </div>

        {/* ── Add / Quantity control ── */}
        <div className="mt-2" onClick={(e) => e.stopPropagation()}>
          {qty === 0 ? (
            /* Add button */
            <button
              onClick={handleAdd}
              className="w-full py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-95 shadow-sm"
              style={{ backgroundColor: '#1B6B3A' }}
            >
              Add
            </button>
          ) : (
            /* Quantity stepper */
            <div
              className="flex items-center rounded-xl overflow-hidden shadow-sm"
              style={{ border: '2px solid #1B6B3A' }}
            >
              <button
                onClick={handleDecrement}
                className="flex-1 h-9 text-lg font-bold transition-colors duration-150 hover:text-white active:scale-95"
                style={{ color: '#1B6B3A' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1B6B3A';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#1B6B3A';
                }}
                aria-label="Decrease quantity"
              >
                −
              </button>

              <span
                className="flex-1 h-9 flex items-center justify-center text-sm font-bold border-x"
                style={{ color: '#1B6B3A', borderColor: '#1B6B3A' }}
              >
                {qty}
              </span>

              <button
                onClick={handleIncrement}
                className="flex-1 h-9 text-lg font-bold transition-colors duration-150 active:scale-95"
                style={{ color: '#1B6B3A' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1B6B3A';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#1B6B3A';
                }}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;