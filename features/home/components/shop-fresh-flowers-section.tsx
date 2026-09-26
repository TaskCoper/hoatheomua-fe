import type { SortableCategory } from '@/features/categories/types'
import { getCategoryDescription, getCategoryName } from '@/features/categories/utils'
import ShopFreshFlowersMotion from '@/features/home/components/shop-fresh-flowers-motion'
import { getCarouselProductsParams } from '@/features/products/section-defaults'
import type { Locale } from '@/lib/i18n/routing'
import { getLocale, getTranslations } from 'next-intl/server'

export default async function ShopFreshFlowersSection({ category }: { category: SortableCategory | null }) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_t, locale] = await Promise.all([getTranslations(), getLocale()])

  const productsParams = category ? getCarouselProductsParams(category) : null

  const title = category ? getCategoryName(category, locale as Locale) : ''
  const description = (category ? getCategoryDescription(category, locale as Locale) : null) ?? ''

  return (
    <div className='mt-4 sm:mt-6 md:mt-8 lg:mt-10 overflow-hidden px-4'>
      <ShopFreshFlowersMotion title={title} description={description} productsParams={productsParams} />
    </div>
  )
}
