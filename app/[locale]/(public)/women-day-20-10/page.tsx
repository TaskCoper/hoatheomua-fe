import WomenDayPage from '@/features/women-day-20-10/components/women-day-page'
import { WOMEN_DAY_CATEGORY_ID, WOMEN_DAY_PAGE_SIZE } from '@/features/women-day-20-10/constants'
import TestimonialSection from '@/features/home/components/testimonial-section'
import { generateWomenDayMetadata } from '@/features/women-day-20-10/seo'
import { getCachedProducts } from '@/features/products/queries.server'
import { productsQueryKey } from '@/features/products/hooks/use-get-products'
import { routing, type Locale } from '@/lib/i18n/routing'
import { getQueryClient } from '@/lib/react-query-client'
import { JsonLd } from '@/shared/seo'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { hasLocale } from 'next-intl'
import { notFound } from 'next/navigation'

export const revalidate = 300

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params
  return generateWomenDayMetadata(locale)
}

export default async function WomenDayRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  const queryClient = getQueryClient()
  const categoryIds = [WOMEN_DAY_CATEGORY_ID]

  const productsParams = { pageIndex: 1, pageSize: WOMEN_DAY_PAGE_SIZE, categoryIds }
  try {
    const products = await getCachedProducts(productsParams)
    queryClient.setQueryData(productsQueryKey(productsParams), products)
  } catch (error) {
    console.error('[SSR] women-day products prefetch failed:', error)
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: locale === 'vi' ? 'Bộ sưu tập hoa 20/10 Hoa Theo Mùa' : 'Hoa Theo Mùa Vietnamese Women’s Day collection',
    url: `/women-day-20-10`,
    isPartOf: { '@type': 'WebSite', name: 'Hoa Theo Mùa' }
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <JsonLd data={jsonLd} />
      <WomenDayPage testimonials={<TestimonialSection />} />
    </HydrationBoundary>
  )
}
