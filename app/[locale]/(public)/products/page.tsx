import { getCachedCategories } from '@/features/categories/queries.server'
import { CategoryProductPage, type SortableCategory } from '@/features/categories/types'
import ProductsContent from '@/features/products/components/products-content'
import ProductsPromiseSection from '@/features/products/components/products-promise-section'
import { productsQueryKey } from '@/features/products/hooks/use-get-products'
import { getCachedProducts } from '@/features/products/queries.server'
import { getSectionDefaultParams } from '@/features/products/section-defaults'
import { buildProductsCollectionJsonLd, generateProductsListMetadata } from '@/features/products/seo'
import type { Locale } from '@/lib/i18n/routing'
import { getQueryClient } from '@/lib/react-query-client'
import { JsonLd } from '@/shared/seo'
import { BANNER_SLOTS } from '@/types/config.type'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { Suspense } from 'react'

// This page looks the same for every visitor - it's a public catalog with no
// per-user data, and filters are applied in the browser, not on the server. So
// rather than rendering it fresh on each request, we prerender the HTML once and
// serve it from cache, rebuilding it at most this often. Genuine catalog changes
// don't wait for that window: the webhook in app/api/revalidate purges it on demand.
export const revalidate = 300

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params
  return generateProductsListMetadata(locale)
}

export default async function ProductsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const queryClient = getQueryClient()

  const categoryPage = [CategoryProductPage.Products]

  // Categories are read straight down as props by the (server) section list, so we
  // fetch them directly instead of through the query cache - that keeps them out of
  // the dehydrated payload the client hydrates.
  let categories: SortableCategory[] = []

  try {
    categories = await getCachedCategories({ page: categoryPage })

    // Fetch each section's first page of products here on the server and store it
    // under the same cache key the grid will look for. The product data then ships
    // inside the prerendered HTML, so the grids show up instantly on load instead
    // of every section firing its own request after the page hydrates.
    await Promise.all(
      categories.map(async (category) => {
        const params = getSectionDefaultParams(category)

        try {
          const products = await getCachedProducts(params)
          queryClient.setQueryData(productsQueryKey(params), products)
        } catch (error) {
          console.error(`[SSR] products prefetch failed for category ${category.categoryId}:`, error)
        }
      })
    )
  } catch (error) {
    console.error('[SSR] categories prefetch failed:', error)
  }

  return (
    <>
      <JsonLd data={buildProductsCollectionJsonLd(locale, [])} />

      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={null}>
          <ProductsContent
            categories={categories}
            promiseSection={<ProductsPromiseSection slot={BANNER_SLOTS.products} />}
          />
        </Suspense>
      </HydrationBoundary>
    </>
  )
}
