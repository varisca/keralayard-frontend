import React from 'react'
import MainBanner from '../components/MainBanner'
import BestSeller from '../components/BestSeller'
import SEO from '../components/SEO'

const Home = () => {
  const homeSchema = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Kerala Yard',
      url: window.location.origin,
      logo: `${window.location.origin}/logo.png`,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Kerala Yard',
      url: window.location.origin,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${window.location.origin}/products?search={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ]

  return (
    <div>
      <SEO
        title="Kerala Yard - Authentic Kerala Groceries Delivered Fresh"
        description="Shop authentic Kerala groceries online. Order banana chips, coconut oil, spices, pickles, appam mix, puttu podi, and homemade snacks from Kerala Yard."
        jsonLd={homeSchema}
      />
      <MainBanner />
      <div className='px-4 md:px-8 lg:px-16 xl:px-24 max-w-7xl mx-auto mb-16'>
        <BestSeller />
      </div>
    </div>
  )
}

export default Home
