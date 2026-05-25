import React from 'react'
import { Link } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { dummyProducts } from '../assets/keralaData'

/* ─────────────────────────────────────────────────────────────────
   Kerala-schema product card (mirrors BestSeller's KeralaCard)
   ───────────────────────────────────────────────────────────────── */
const KeralaCard = ({ product }) => {
  const { currency, addToCart, removeFromCart, cartItems, navigate } =
    useAppContext()

  const inCart = cartItems[product.id] || 0
  const discount = Math.round(
    ((product.mrp - product.sellingPrice) / product.mrp) * 100
  )
  const imageUrl =
    product.images && product.images[0] ? product.images[0] : null

  return (
    <div
      onClick={() => {
        navigate(`/products/${product.categoryId}/${product.id}`)
        window.scrollTo(0, 0)
      }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer flex flex-col overflow-hidden group"
    >
      {/* Image area */}
      <div className="relative bg-[#F5F0E8] flex items-center justify-center h-40 md:h-44 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="h-32 md:h-36 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center gap-1 opacity-40">
            <span className="text-5xl">🛒</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-0.5">
          {product.categoryName}
        </p>
        <p className="text-sm font-semibold text-dark leading-snug line-clamp-2 mb-1 flex-1">
          {product.name}
        </p>
        {product.weight && (
          <p className="text-xs text-gray-400 mb-2">{product.weight}</p>
        )}

        {/* Price + cart button */}
        <div
          className="flex items-center justify-between mt-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div>
            <span className="text-base font-bold text-[#1B6B3A]">
              {currency}
              {product.sellingPrice}
            </span>
          </div>

          {inCart === 0 ? (
            <button
              onClick={() => addToCart(product.id)}
              className="flex items-center gap-1 bg-[#1B6B3A]/10 border border-[#1B6B3A]/40 text-[#1B6B3A] text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-[#1B6B3A]/20 transition-colors duration-150"
            >
              + Add
            </button>
          ) : (
            <div className="flex items-center gap-1.5 bg-[#1B6B3A]/15 rounded-lg px-2 py-1 select-none">
              <button
                onClick={() => removeFromCart(product.id)}
                className="text-[#1B6B3A] font-bold text-base w-5 h-5 flex items-center justify-center hover:bg-[#1B6B3A]/20 rounded"
              >
                −
              </button>
              <span className="text-[#1B6B3A] font-semibold text-sm w-4 text-center">
                {inCart}
              </span>
              <button
                onClick={() => addToCart(product.id)}
                className="text-[#1B6B3A] font-bold text-base w-5 h-5 flex items-center justify-center hover:bg-[#1B6B3A]/20 rounded"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   PopularProducts section
   ───────────────────────────────────────────────────────────────── */
const PopularProducts = () => {
  const { products } = useAppContext()

  const source = products && products.length > 0 ? products : dummyProducts
  // Only show active products on storefront
  const popular = source.filter((p) => p.active !== false).slice(0, 8)

  return (
    <section className="mt-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-dark">
            Popular Right Now
          </h2>
          <div className="mt-2 w-14 h-1 rounded-full bg-[#D4A017]" />
          <p className="mt-2 text-gray-500 text-sm md:text-base">
            Trending picks from our Kerala collection
          </p>
        </div>
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-[#1B6B3A] font-semibold text-sm hover:underline underline-offset-4 flex-shrink-0"
        >
          View All
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </Link>
      </div>

      {/* Grid */}
      {popular.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
          {popular.map((product) => (
            <KeralaCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-center py-10">No products found.</p>
      )}

      {/* Bottom CTA */}
      <div className="flex justify-center mt-10">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white bg-[#1B6B3A] hover:bg-[#155530] transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          Browse All Products
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </Link>
      </div>
    </section>
  )
}

export default PopularProducts
