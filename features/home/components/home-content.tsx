import CriteriaSection from '@/features/home/components/criteria-section'
import ShopFreshFlowersSection from '@/features/home/components/shop-fresh-flowers-section'
import SignatureBouquetsSection from '@/features/home/components/signature-bouquets-section'
import TestimonialSection from '@/features/home/components/testimonial-section'
import WhyChooseUsSection from '@/features/home/components/why-choose-us-section'
import bannerOne from '@/public/images/banner-one.webp'
import saleBanner from '@/public/images/sale-banner.webp'
import ConfigurableBanner from '@/shared/components/configurable-banner'
import FloatingPetalsClient from '@/shared/components/floating-petals-client'
import { BANNER_SLOTS } from '@/types/config.type'

const bannerWrapperClass =
  'mx-auto w-full max-w-7xl px-4 py-6 mt-4 sm:mt-6 md:mt-8 lg:mt-10 transition-transform duration-500 ease-out hover:-translate-y-2 hover:scale-[1.015] animate-in fade-in slide-in-from-bottom-6 zoom-in-95 duration-700'

const bannerImageClass = 'w-full h-auto rounded-xl sm:rounded-2xl md:rounded-3xl lg:rounded-4xl shadow-lg'

export default function HomeContent() {
  return (
    <div className='relative overflow-hidden'>
      <CriteriaSection />

      <ShopFreshFlowersSection />

      <div className={bannerWrapperClass}>
        <ConfigurableBanner
          slot={BANNER_SLOTS.homeCollection}
          fallbackSrc={bannerOne}
          fallbackAlt='Bộ sưu tập hoa tươi Hoa Theo Mùa'
          className={`${bannerImageClass} border-2 border-secondary/80`}
          sizes='(min-width: 1280px) 1200px, 100vw'
        />
      </div>

      <div className='cv-auto'>
        <SignatureBouquetsSection />
      </div>

      <div className={`${bannerWrapperClass} cv-auto`}>
        <ConfigurableBanner
          slot={BANNER_SLOTS.homeSale}
          fallbackSrc={saleBanner}
          fallbackAlt='Ưu đãi hoa tươi Hoa Theo Mùa'
          className={`${bannerImageClass} border-2 border-primary/5`}
          sizes='(min-width: 1280px) 1200px, 100vw'
        />
      </div>

      <div className='cv-auto'>
        <WhyChooseUsSection />
      </div>

      <div className='cv-auto'>
        <TestimonialSection />
      </div>

      <FloatingPetalsClient />
    </div>
  )
}
