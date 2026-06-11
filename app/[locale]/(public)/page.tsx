import bannerOne from '@/public/images/banner-one.png'
import saleBanner from '@/public/images/sale-banner.png'
import Image from 'next/image'
import CriteriaSection from './_components/criteria-section'
import FloatingPetals from './_components/floating-petals'
import HeroSection from './_components/hero-section'
import ShopFreshFlowersSection from './_components/shop-fresh-flowers-section'
import SignatureBouquetsSection from './_components/signature-bouquets-section'
import TestimonialSection from './_components/testimonial-section'
import WhyChooseUsSection from './_components/why-choose-us-section'

export default function HomePage() {
  return (
    <div className='relative overflow-hidden'>
      <FloatingPetals />

      <HeroSection />

      <CriteriaSection />

      <ShopFreshFlowersSection />

      <div className='mx-auto w-full max-w-7xl px-4 mt-4 sm:mt-6 md:mt-8 lg:mt-10'>
        <Image
          src={bannerOne}
          alt='Banner'
          className='w-full h-auto rounded-xl sm:rounded-2xl md:rounded-3xl lg:rounded-4xl shadow-lg border-2 border-secondary/80'
        />
      </div>

      <SignatureBouquetsSection />

      <div className='mx-auto w-full max-w-7xl px-4 mt-4 sm:mt-6 md:mt-8 lg:mt-10'>
        <Image
          src={saleBanner}
          alt='Banner'
          className='w-full h-auto rounded-xl sm:rounded-2xl md:rounded-3xl lg:rounded-4xl shadow-lg border-2 border-primary/5'
        />
      </div>

      <WhyChooseUsSection />

      <TestimonialSection />
    </div>
  )
}
