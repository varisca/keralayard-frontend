import React, { useState } from 'react'

/* ─── Info card data ─────────────────────────────────────────────── */
const infoCards = [
  {
    id: 'delivery',
    icon: '🚚',
    title: 'Fast Delivery',
    desc: 'Express delivery across Kerala within 24–48 hours. Free shipping on orders above ₹499. Track your parcel in real-time from warehouse to your door.',
    highlight: 'Deliver within 48 hrs',
  },
  {
    id: 'fresh',
    icon: '🌿',
    title: 'Fresh & Authentic',
    desc: 'Sourced directly from certified Kerala farms and artisan producers. No artificial preservatives — just pure, traditional goodness in every packet.',
    highlight: '100% No preservatives',
  },
  {
    id: 'packaging',
    icon: '📦',
    title: 'Secure Packaging',
    desc: 'Eco-friendly, tamper-proof packaging designed to keep your Kerala delicacies fresh and intact, whether it is fragile glass jars or delicate snacks.',
    highlight: 'Eco-friendly materials',
  },
]

/* ─── Pincode checker ───────────────────────────────────────────── */
const AVAILABLE_PINCODES = [
  '695001', '695002', '695003', '695004',
  '673001', '673002', '673003',
  '682001', '682002', '682003', '682011', '682016', '682017', '682020',
  '680001', '680002', '680003',
  '678001', '678002',
  '676001', '676002', '676003',
]

const PincodeChecker = () => {
  const [pincode, setPincode] = useState('')
  const [status, setStatus] = useState(null) // 'available' | 'unavailable' | null
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const checkPincode = () => {
    const trimmed = pincode.trim()

    if (!/^\d{6}$/.test(trimmed)) {
      setError('Please enter a valid 6-digit pincode.')
      setStatus(null)
      return
    }

    setError('')
    setLoading(true)
    setStatus(null)

    // Simulate async check
    setTimeout(() => {
      const available = AVAILABLE_PINCODES.includes(trimmed)
      setStatus(available ? 'available' : 'unavailable')
      setLoading(false)
    }, 600)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') checkPincode()
  }

  return (
    <div className="mt-12 bg-white rounded-2xl border border-[#1B6B3A]/20 shadow-sm p-6 md:p-8">
      <div className="max-w-lg mx-auto text-center">
        <span className="text-3xl mb-3 block">📍</span>
        <h3 className="text-lg md:text-xl font-bold text-dark mb-1">
          Check Delivery Availability
        </h3>
        <p className="text-gray-500 text-sm mb-5">
          Enter your pincode to see if we deliver to your area
        </p>

        {/* Input row */}
        <div className="flex gap-3">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={pincode}
            onChange={(e) => {
              setPincode(e.target.value.replace(/\D/g, ''))
              if (status) setStatus(null)
              if (error) setError('')
            }}
            onKeyDown={handleKeyDown}
            placeholder="Enter 6-digit pincode"
            className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1B6B3A] focus:outline-none text-dark placeholder-gray-400 text-sm transition-colors duration-150"
          />
          <button
            onClick={checkPincode}
            disabled={loading}
            className="px-5 py-3 rounded-xl font-semibold text-white bg-[#1B6B3A] hover:bg-[#155530] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 text-sm flex-shrink-0 flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Checking…
              </>
            ) : (
              'Check'
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <p className="mt-2 text-red-500 text-sm text-left">{error}</p>
        )}

        {/* Result */}
        {status === 'available' && (
          <div className="mt-4 flex items-center gap-2 justify-center px-4 py-3 rounded-xl bg-green-50 border border-green-200">
            <span className="text-green-600 text-lg">✅</span>
            <div className="text-left">
              <p className="text-green-700 font-semibold text-sm">
                Delivery available to {pincode}!
              </p>
              <p className="text-green-600 text-xs">
                Expected delivery in 24–48 hours · Free above ₹499
              </p>
            </div>
          </div>
        )}

        {status === 'unavailable' && (
          <div className="mt-4 flex items-center gap-2 justify-center px-4 py-3 rounded-xl bg-orange-50 border border-orange-200">
            <span className="text-orange-500 text-lg">⚠️</span>
            <div className="text-left">
              <p className="text-orange-700 font-semibold text-sm">
                We don't deliver to {pincode} yet.
              </p>
              <p className="text-orange-600 text-xs">
                We're expanding fast! Check back soon or contact support.
              </p>
            </div>
          </div>
        )}

        <p className="mt-3 text-gray-400 text-xs">
          Currently serving Thiruvananthapuram, Kozhikode, Ernakulam, Thrissur
          &amp; more
        </p>
      </div>
    </div>
  )
}

/* ─── DeliveryInfo main component ───────────────────────────────── */
const DeliveryInfo = () => {
  return (
    <section className="mt-16 pb-10">
      {/* Section header */}
      <div className="flex flex-col items-center text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-dark">
          Why Choose Kerala Yard?
        </h2>
        <div className="mt-2 w-16 h-1 rounded-full bg-[#D4A017]" />
        <p className="mt-3 text-gray-500 text-sm md:text-base max-w-md">
          We bring God's Own Country to your doorstep — reliably, freshly, and
          with care.
        </p>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
        {infoCards.map((card) => (
          <div
            key={card.id}
            className="bg-white rounded-2xl border border-[#1B6B3A]/15 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 p-6 flex flex-col items-center text-center gap-4"
          >
            {/* Icon in green circle */}
            <div className="w-16 h-16 rounded-full bg-[#1B6B3A]/10 border-2 border-[#1B6B3A]/20 flex items-center justify-center text-3xl flex-shrink-0">
              {card.icon}
            </div>

            {/* Text */}
            <div>
              <h3 className="text-base md:text-lg font-bold text-dark mb-1">
                {card.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {card.desc}
              </p>
            </div>

            {/* Highlight chip */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1B6B3A]/10 text-[#1B6B3A] text-xs font-semibold mt-auto">
              <svg
                className="w-3 h-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              {card.highlight}
            </span>
          </div>
        ))}
      </div>

      {/* Pincode checker */}
      <PincodeChecker />
    </section>
  )
}

export default DeliveryInfo
