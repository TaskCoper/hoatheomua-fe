import { getCachedCategories } from '@/features/categories/queries.server'
import { CategoryProductPage, type SortableCategory } from '@/features/categories/types'
import ProductsContent from '@/features/products/components/products-content'
import ProductsPromiseSection from '@/features/products/components/products-promise-section'
import { productsQueryKey } from '@/features/products/hooks/use-get-products'
import { getCachedProducts } from '@/features/products/queries.server'
import { getSectionDefaultParams } from '@/features/products/section-defaults'
import { buildProductsCollectionJsonLd, generateProductsListMetadata } from '@/features/products/seo'
import type { ProductDetail } from '@/features/products/types'
import type { Locale } from '@/lib/i18n/routing'
import { getQueryClient } from '@/lib/react-query-client'
import { JsonLd } from '@/shared/seo'
import { BANNER_SLOTS } from '@/types/config.type'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { Suspense } from 'react'

export const revalidate = 300

const JSON_LD_ITEM_LIMIT = 30

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params
  return generateProductsListMetadata(locale)
}

export default async function ProductsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const queryClient = getQueryClient()

  const categoryPage = [CategoryProductPage.Products]

  let categories: SortableCategory[] = []
  const jsonLdItems: ProductDetail[] = []

  try {
    categories = await getCachedCategories({ page: categoryPage })

    const sectionItems = await Promise.all(
      categories.map(async (category) => {
        const params = getSectionDefaultParams(category)

        try {
          const products = await getCachedProducts(params)
          queryClient.setQueryData(productsQueryKey(params), products)
          return products.value.items
        } catch (error) {
          console.error(`[SSR] products prefetch failed for category ${category.categoryId}:`, error)
          return []
        }
      })
    )

    const seen = new Set<string>()
    for (const item of sectionItems.flat()) {
      if (jsonLdItems.length >= JSON_LD_ITEM_LIMIT) break
      if (seen.has(item.id)) continue
      seen.add(item.id)
      jsonLdItems.push(item)
    }
  } catch (error) {
    console.error('[SSR] categories prefetch failed:', error)
  }

  return (
    <>
      <JsonLd data={buildProductsCollectionJsonLd(locale, jsonLdItems)} />

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
