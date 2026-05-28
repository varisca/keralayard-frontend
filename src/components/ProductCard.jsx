import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { categories as staticCategories } from '../assets/keralaData';

const ProductCard = ({ product }) => {
  const { addToCart, removeFromCart, cartItems, currency, navigate, categories } = useAppContext();
  const [imgError, setImgError] = useState(false);

  if (!product) return null;

  const pid = product.id || product._id;
  const name = product.name;
  const weight = product.weight || product.unit || null;
  const rawImages = product.images || (product.image ? [product.image].flat() : []);
  const imageUrl = rawImages.filter(Boolean)[0] || null;
  const mrp = product.mrp || product.price || 0;
  const sellingPrice = product.sellingPrice || product.offerPrice || mrp;
  const categoryId = product.categoryId || null;
  const categoryName = product.categoryName || product.category || '';
  const activeCategories = categories?.length ? categories : staticCategories;
  const categoryObj = activeCategories.find(
    (c) =>
      c.id === categoryId ||
      c.docId === categoryId ||
      c.name === categoryName ||
      c.slug === categoryName
  );
  const categorySlug =
    categoryObj?.slug ||
    categoryObj?.id ||
    categoryName.toLowerCase().replace(/\s+/g, '-');
  const qty = cartItems?.[pid] ?? 0;

  const goToProduct = () => {
    navigate(`/products/${categorySlug}/${pid}`);
    window.scrollTo(0, 0);
  };

  return (
    <div
      onClick={goToProduct}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-xl bg-white transition-all duration-200 hover:shadow-md"
      style={{ border: '1px solid #e9ecef' }}
    >
      <div className="relative aspect-[1/0.92] w-full overflow-hidden bg-gray-50">
        {imageUrl && !imgError ? (
          <img
            src={imageUrl}
            alt={name}
            onError={() => setImgError(true)}
            className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-4xl">{categoryObj?.icon || ''}</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-2.5">
        {weight && (
          <span className="text-[11px] font-medium text-gray-400">{weight}</span>
        )}

        <h3
          className="line-clamp-2 min-h-[2.1rem] flex-1 text-[13px] font-semibold leading-snug text-gray-800 md:text-sm"
          title={name}
        >
          {name}
        </h3>

        <span className="mt-0.5 text-sm font-bold text-[#1B6B3A] md:text-base">
          {currency}{sellingPrice?.toLocaleString('en-IN')}
        </span>

        <div className="mt-1.5" onClick={(e) => e.stopPropagation()}>
          {qty === 0 ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                addToCart(pid);
              }}
              className="w-full rounded-lg bg-[#1B6B3A] py-2 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-95"
            >
              Add
            </button>
          ) : (
            <div className="flex items-center overflow-hidden rounded-lg border border-[#1B6B3A]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromCart(pid);
                }}
                className="h-8 flex-1 text-lg font-bold text-[#1B6B3A] transition-colors hover:bg-[#1B6B3A]/10 active:scale-95"
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="flex h-8 flex-1 items-center justify-center border-x border-[#1B6B3A] text-sm font-bold text-[#1B6B3A]">
                {qty}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(pid);
                }}
                className="h-8 flex-1 text-lg font-bold text-[#1B6B3A] transition-colors hover:bg-[#1B6B3A]/10 active:scale-95"
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
