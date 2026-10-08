import ScopedIntlProvider from '@/components/scoped-intl-provider'
import TestimonialSection from '@/features/home/components/testimonial-section'
import { productsQueryKey } from '@/features/products/hooks/use-get-products'
import { getCachedProducts } from '@/features/products/queries.server'
import type { ProductDetail } from '@/features/products/types'
import WomenDayCollectionSection from '@/features/women-day-20-10/components/women-day-collection-section'
import WomenDayHeroSection from '@/features/women-day-20-10/components/women-day-hero-section'
import WomenDayJumpButton from '@/features/women-day-20-10/components/women-day-jump-button'
import WomenDayPromiseSection from '@/features/women-day-20-10/components/women-day-promise-section'
import WomenDayArticleSection from '@/features/women-day-20-10/components/women-day-article-section'
import { WOMEN_DAY_CATEGORY_IDS, WOMEN_DAY_PAGE_SIZE } from '@/features/women-day-20-10/constants'
import { buildWomenDayJsonLd, generateWomenDayMetadata } from '@/features/women-day-20-10/seo'
import type { Locale } from '@/lib/i18n/routing'
import { getQueryClient } from '@/lib/react-query-client'
import { DEFAULT_PAGE_INDEX } from '@/shared/constants'
import { JsonLd } from '@/shared/seo'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'

export const revalidate = 300

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params
  return generateWomenDayMetadata(locale)
}

export default async function WomenDayRoute({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const queryClient = getQueryClient()
  const productsParams = {
    pageIndex: DEFAULT_PAGE_INDEX,
    pageSize: WOMEN_DAY_PAGE_SIZE,
    categoryIds: WOMEN_DAY_CATEGORY_IDS
  }
  let items: ProductDetail[] = []

  try {
    const products = await getCachedProducts(productsParams)
    queryClient.setQueryData(productsQueryKey(productsParams), products)
    items = products.value.items
  } catch (error) {
    console.error('[SSR] women-day products prefetch failed:', error)
  }

  return (
    <ScopedIntlProvider namespaces={['womenDay']}>
      <JsonLd data={buildWomenDayJsonLd(locale, items)} />

      <HydrationBoundary state={dehydrate(queryClient)}>
        <div className='relative isolate overflow-hidden'>
          <WomenDayHeroSection />
          <WomenDayCollectionSection />
          <WomenDayPromiseSection />
          <WomenDayArticleSection />
          <TestimonialSection />
        </div>

        <WomenDayJumpButton />
      </HydrationBoundary>
    </ScopedIntlProvider>
  )
}
