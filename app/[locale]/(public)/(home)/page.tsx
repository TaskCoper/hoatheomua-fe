import { getCachedCategories } from '@/features/categories/queries.server'
import { CategoryProductPage, type SortableCategory } from '@/features/categories/types'
import HomeContent from '@/features/home/components/home-content'
import { buildHomeJsonLd, generateHomeMetadata } from '@/features/home/seo'
import { productsQueryKey } from '@/features/products/hooks/use-get-products'
import { getCachedProducts } from '@/features/products/queries.server'
import { getSectionDefaultParams } from '@/features/products/section-defaults'
import { routing, type Locale } from '@/lib/i18n/routing'
import { getQueryClient } from '@/lib/react-query-client'
import { JsonLd } from '@/shared/seo'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { hasLocale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

// Kept in step with `PRODUCTS_LIST_LIFE.revalidate` in lib/cache-life.ts: the
// shortest cache a render touches wins, and `getCachedProducts` is a 300s
// `'use cache'` scope, so declaring anything longer here would be fiction.
// Prices are the freshest data on the page, so 5 minutes is the right floor
// anyway, with the admin webhook purging on real changes.
export const revalidate = 300

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}

  return generateHomeMetadata(locale)
}

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) notFound()

  setRequestLocale(locale)

  const queryClient = getQueryClient()
  const categoryPage = [CategoryProductPage.Home]

  const homeJsonLdPromise = buildHomeJsonLd(locale)

  // Read straight down as props by the (server) section list rather than through
  // the query cache, matching /products. Keeps them out of the dehydrated payload
  // and lets the sections render into the static HTML.
  let categories: SortableCategory[] = []

  try {
    categories = await getCachedCategories({ page: categoryPage })

    await Promise.all(
      categories.map(async (category) => {
        const params = getSectionDefaultParams(category)

        try {
          const products = await getCachedProducts(params)
          queryClient.setQueryData(productsQueryKey(params), products)
        } catch (error) {
          console.error(`[SSR] home products prefetch failed for category ${category.categoryId}:`, error)
        }
      })
    )
  } catch (error) {
    console.error('[SSR] home categories prefetch failed:', error)
  }

  const homeJsonLd = await homeJsonLdPromise

  return (
    <>
      <JsonLd data={homeJsonLd} />

      <HydrationBoundary state={dehydrate(queryClient)}>
        {/*
          No blanket <Suspense> here. The category sections read search params
          (nuqs), which pulls their nearest Suspense boundary out of the static
          shell - a page-level boundary therefore took every static sibling with
          it, and this page prerendered with no content at all. The boundary now
          sits directly around the sections that need it, inside HomeContent.
          Route-level streaming is already covered by loading.tsx.
        */}
        <HomeContent categories={categories} />
      </HydrationBoundary>
    </>
  )
}
