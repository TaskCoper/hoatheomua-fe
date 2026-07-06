import { DEFAULT_PRODUCT_SORT } from '@/features/products/constants'
import { productListQuery } from '@/features/products/queries'
import { getCachedProducts } from '@/features/products/queries.server'
import { routing, type Locale } from '@/lib/i18n/routing'
import { getQueryClient } from '@/lib/react-query-client'
import { JsonLd } from '@/shared/seo'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { hasLocale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import HomeContent from '../_components/home-content'
import { buildHomeJsonLd, generateHomeMetadata } from './_home-seo'

const SIGNATURE_BOUQUETS_SIZE = 6
const SIGNATURE_BOUQUETS_CATEGORY_ID = [58901]

export const revalidate = 600

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}

  return generateHomeMetadata(locale)
}

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params

  setRequestLocale(locale)

  const queryClient = getQueryClient()
  const listParams = {
    size: SIGNATURE_BOUQUETS_SIZE,
    categoryIds: SIGNATURE_BOUQUETS_CATEGORY_ID,
    sort: DEFAULT_PRODUCT_SORT
  }
  const options = productListQuery(listParams, locale)

  try {
    const data = await getCachedProducts(listParams, locale)
    queryClient.setQueryData(options.queryKey, data)
  } catch (error) {
    console.error('[SSR] home signature bouquets prefetch failed:', error)
  }

  const homeJsonLd = await buildHomeJsonLd()

  return (
    <>
      <JsonLd data={homeJsonLd} />

      <HydrationBoundary state={dehydrate(queryClient)}>
        <HomeContent />
      </HydrationBoundary>
    </>
  )
}
