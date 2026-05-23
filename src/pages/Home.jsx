import React from 'react'
import MainBanner from '../components/MainBanner'
import BestSeller from '../components/BestSeller'

const Home = () => {
  return (
    <div>
      <MainBanner />
      <div className='px-4 md:px-8 lg:px-16 xl:px-24 max-w-7xl mx-auto mb-16'>
        <BestSeller />
      </div>
    </div>
  )
}

export default Home

