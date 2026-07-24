import { getTranslations } from 'next-intl/server'
import FlowersCarousel from '@/features/home/components/flowers-carousel'
import { SparkleDivider } from '@/shared/components/sparkle-dividier'

export default async function ShopFreshFlowersSection() {
  const t = await getTranslations()

  return (
    <div className='mt-4 sm:mt-6 md:mt-8 lg:mt-10 overflow-hidden px-4'>
      <div className='animate-in fade-in slide-in-from-bottom-4 duration-700 mx-auto w-full max-w-7xl space-y-0.5 sm:space-y-1 md:space-y-1.5 lg:space-y-2'>
        <div className='flex items-center justify-start sm:justify-center gap-3'>
          <SparkleDivider
            className='min-w-0 max-w-96 flex-1 hidden sm:flex'
            iconClassName='sm:size-5 md:size-6 lg:size-7'
            color='#516c6c'
          />

          <h1 className='shrink-0 text-center font-title text-2xl md:text-3xl lg:text-4xl font-bold'>
            {t('home.dailyFlowers.title')}
          </h1>

          <SparkleDivider
            className='min-w-0 max-w-96 flex-1 hidden sm:flex'
            iconClassName='sm:size-5 md:size-6 lg:size-7'
            direction='rtl'
            color='#516c6c'
          />
        </div>

        <p className='leading-relaxed mx-auto max-w-full sm:max-w-140 md:max-w-200 text-left sm:text-center text-xs sm:text-sm text-foreground'>
          {t('home.dailyFlowers.description')}
        </p>
      </div>

      <FlowersCarousel />
    </div>
  )
}
