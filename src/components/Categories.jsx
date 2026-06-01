import React from 'react'
import { useAppContext } from '../context/AppContext'

const Categories = () => {
  const { categories, categoriesLoading, navigate } = useAppContext()

  if (categoriesLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="w-8 h-8 border-4 border-dashed border-[#1B6B3A] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <section className="mt-14">
      {/* Section header */}
      <div className="flex flex-col items-center text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-dark">
          Shop by Category
        </h2>
        {/* Gold bottom border accent */}
        <div className="mt-2 w-16 h-1 rounded-full bg-[#D4A017]" />
        <p className="mt-3 text-gray-500 text-sm md:text-base">
          Explore the finest Kerala pantry essentials
        </p>
      </div>

      {/* Mobile: horizontal scroll strip | Desktop: grid */}
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 md:pb-0 md:grid md:grid-cols-4 lg:grid-cols-8 md:gap-4">
        {categories.filter((c) => c.active !== false).map((category) => (
          <button
            key={category.id}
            onClick={() => navigate(`/products/${category.slug}`)}
            className="flex-shrink-0 w-[120px] md:w-auto group flex flex-col items-center gap-3 cursor-pointer"
          >
            {/* Tile */}
            <div
              className="w-full aspect-square rounded-2xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105 group-hover:shadow-md"
              style={{ backgroundColor: category.bgColor }}
            >
              {category.image ? (
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-14 h-14 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    e.currentTarget.nextSibling.style.display = 'block'
                  }}
                />
              ) : null}
              <span
                className="text-4xl leading-none"
                style={{ display: category.image ? 'none' : 'block' }}
              >
                {category.icon}
              </span>
            </div>

            {/* Category name */}
            <span className="text-xs md:text-sm font-medium text-dark text-center leading-tight group-hover:text-[#1B6B3A] transition-colors duration-200">
              {category.name}
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}

export default Categories
