import { DEFAULT_PRODUCT_SORT } from '@/features/products/constants'
import { productListQuery } from '@/features/products/queries'
import { routing, type Locale } from '@/lib/i18n/routing'
import { getQueryClient } from '@/lib/react-query-client'
import { JsonLd } from '@/shared/seo'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { hasLocale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { buildHomeJsonLd, generateHomeMetadata } from '../_home-seo'
import HomeContent from '../_components/home-content'

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
  await queryClient.prefetchQuery(
    productListQuery(
      {
        size: SIGNATURE_BOUQUETS_SIZE,
        categoryIds: SIGNATURE_BOUQUETS_CATEGORY_ID,
        sort: DEFAULT_PRODUCT_SORT
      },
      locale
    )
  )

  return (
    <>
      <JsonLd data={buildHomeJsonLd()} />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <HomeContent />
      </HydrationBoundary>
    </>
  )
}
