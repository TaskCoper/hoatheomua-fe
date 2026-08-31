import ShopFreshFlowersMotion from '@/features/home/components/shop-fresh-flowers-motion'
import { getTranslations } from 'next-intl/server'

export default async function ShopFreshFlowersSection() {
  const t = await getTranslations()

  return (
    <div className='mt-4 sm:mt-6 md:mt-8 lg:mt-10 overflow-hidden px-4'>
      <ShopFreshFlowersMotion title={t('home.dailyFlowers.title')} description={t('home.dailyFlowers.description')} />
    </div>
  )
}
