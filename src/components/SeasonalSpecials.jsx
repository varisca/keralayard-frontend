import React from 'react'
import { Link } from 'react-router-dom'

const SeasonalSpecials = () => {
  return (
    <section className="mt-16 w-full overflow-hidden">
      <div
        className="relative w-full min-h-[380px] md:min-h-[440px] flex items-center"
        style={{
          backgroundImage: "url('/seasonal_banner.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Warm festive overlay — left-heavy gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(139,69,19,0.88) 0%, rgba(180,90,20,0.72) 40%, rgba(212,160,23,0.25) 70%, rgba(0,0,0,0.08) 100%)',
          }}
        />

        {/* Bottom vignette for depth */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 60%)',
          }}
        />

        {/* Decorative floral motif (SVG circle elements) */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10 hidden md:block">
          <svg width="320" height="320" viewBox="0 0 320 320" fill="none">
            <circle cx="160" cy="160" r="155" stroke="#D4A017" strokeWidth="2" />
            <circle cx="160" cy="160" r="120" stroke="#D4A017" strokeWidth="1.5" strokeDasharray="8 6" />
            <circle cx="160" cy="160" r="85" stroke="#D4A017" strokeWidth="1" />
            <circle cx="160" cy="160" r="50" stroke="#D4A017" strokeWidth="1.5" strokeDasharray="4 4" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 px-6 md:px-12 lg:px-20 xl:px-28 max-w-2xl">
          {/* Badge */}
          <div className="animate-fade-in-up">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold border border-[#D4A017]/60 bg-[#D4A017]/20 text-[#D4A017] mb-4 backdrop-blur-sm">
              🌸 Onam Specials
            </span>
          </div>

          {/* Heading */}
          <h2 className="animate-fade-in-up animation-delay-100 text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-3">
            Celebrate with{' '}
            <span className="text-[#D4A017]">Authentic Kerala</span>
          </h2>

          {/* Subtext */}
          <p className="animate-fade-in-up animation-delay-200 text-white/80 text-sm md:text-base leading-relaxed mb-6 max-w-md">
            Prepare the perfect Onam Sadya — from fragrant matta rice and
            spiced coconut curries to tangy pickles and crispy papadams.
            Everything you need for a royal feast, delivered fresh.
          </p>

          {/* Feature chips */}
          <div className="animate-fade-in-up animation-delay-300 flex flex-wrap gap-2 mb-7">
            {[
              '🍚 Matta Rice',
              '🥥 Coconut Curries',
              '🌶️ Sadya Spices',
              '🫙 Pickles & Papadams',
            ].map((item) => (
              <span
                key={item}
                className="px-3 py-1 rounded-full text-xs font-medium bg-white/15 text-white border border-white/25 backdrop-blur-sm"
              >
                {item}
              </span>
            ))}
          </div>

          {/* CTA */}
          <Link
            to="/products"
            className="animate-fade-in-up animation-delay-400 inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
            style={{
              backgroundColor: '#D4A017',
              boxShadow: '0 4px 20px rgba(212,160,23,0.4)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#B8860B'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#D4A017'
            }}
          >
            Shop Onam Collection
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

          {/* Countdown strip */}
          <div className="animate-fade-in-up animation-delay-500 mt-6 flex items-center gap-2 text-white/60 text-xs">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            Limited time offer · Fresh stock updated daily
          </div>
        </div>
      </div>
    </section>
  )
}

export default SeasonalSpecials
