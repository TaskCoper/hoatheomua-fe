import { DAILY_FLOWER_CATEGORY_IDS, DEFAULT_PRODUCT_SORT, VASE_CATEGORY_IDS } from '@/features/products/constants'
import { productListQuery } from '@/features/products/queries'
import { getCachedProducts } from '@/features/products/queries.server'
import { buildProductsCollectionJsonLd, generateProductsListMetadata } from '@/features/products/seo'
import type { Product } from '@/features/products/types'
import type { Locale } from '@/lib/i18n/routing'
import { getQueryClient } from '@/lib/react-query-client'
import { JsonLd } from '@/shared/seo'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { Suspense } from 'react'
import ProductsContent from './_components/products-content'

const PRODUCTS_PAGE_SIZE = 12
export const revalidate = 600

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params
  return generateProductsListMetadata(locale)
}

export default async function ProductsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const listParams = {
    size: PRODUCTS_PAGE_SIZE,
    categoryIds: [...VASE_CATEGORY_IDS, ...DAILY_FLOWER_CATEGORY_IDS],
    sort: DEFAULT_PRODUCT_SORT
  }
  const options = productListQuery(listParams, locale)
  const queryClient = getQueryClient()

  let initialItems: Product[] = []

  try {
    const data = await getCachedProducts(listParams, locale)
    queryClient.setQueryData(options.queryKey, data)
    initialItems = (data.value?.data ?? []) as Product[]
  } catch (error) {
    console.error('[SSR] products list prefetch failed:', error)
  }

  return (
    <>
      <JsonLd data={buildProductsCollectionJsonLd(locale, initialItems)} />

      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={null}>
          <ProductsContent />
        </Suspense>
      </HydrationBoundary>
    </>
  )
}
