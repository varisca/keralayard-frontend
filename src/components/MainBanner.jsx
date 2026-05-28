import React from 'react'
import { Link } from 'react-router-dom'

const MainBanner = () => {
  return (
    <section
      aria-label="Kerala Yard hero"
      className="relative w-full min-h-[520px] md:min-h-[620px] lg:min-h-[680px] flex items-center overflow-hidden"
      style={{
        backgroundImage: "url('/hero_banner.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'right center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#1B6B3A',
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, rgba(27,107,58,1) 0%, rgba(27,107,58,1) 40%, rgba(27,107,58,0.85) 45%, rgba(27,107,58,0) 80%)',
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to right, transparent 50%, rgba(0,0,0,0.18) 100%)',
        }}
      />

      <div className="relative z-10 px-6 md:px-12 lg:px-20 xl:px-28 max-w-2xl">
        <div className="animate-fade-in-up animation-delay-100">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm border border-white/30 text-white mb-5">
            100% Authentic Kerala Products
          </span>
        </div>

        <h1 className="animate-fade-in-up animation-delay-200 text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
          Authentic Kerala,{' '}
          <span className="text-[#D4A017]">Delivered Fresh</span>
        </h1>

        <p className="animate-fade-in-up animation-delay-300 text-white/80 text-base md:text-lg leading-relaxed mb-8 max-w-lg">
          Banana chips, coconut oil, spices and more, straight from{' '}
          <span className="text-white font-medium">God's Own Country</span>
        </p>

        <div className="animate-fade-in-up animation-delay-400 flex flex-wrap items-center gap-4">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg font-semibold text-white bg-[#1B6B3A] border-2 border-white/30 hover:bg-[#155530] hover:border-white/50 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Shop Now
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>

          {/* <Link
            to="/products"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg font-semibold text-white bg-transparent border-2 border-white/70 hover:bg-white/15 hover:border-white transition-all duration-200 hover:-translate-y-0.5"
          >
            Explore Deals
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link> */}
        </div>

        <div className="animate-fade-in-up animation-delay-500 flex flex-wrap items-center gap-5 mt-8">
          {[
            { label: '🚚Free delivery above Rs. 1000' },
            { label: '🌿No preservatives' },
          ].map((badge) => (
            <div key={badge.label} className="flex items-center gap-1.5 text-white/75 text-sm">
              <span>{badge.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default MainBanner
