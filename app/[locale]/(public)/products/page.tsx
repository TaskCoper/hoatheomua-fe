import { DEFAULT_PRODUCT_CATEGORY_IDS, DEFAULT_PRODUCT_SORT } from '@/features/products/constants'
import { productListQuery } from '@/features/products/queries'
import { buildProductsCollectionJsonLd, generateProductsListMetadata } from '@/features/products/seo'
import type { Product, ProductListResponse } from '@/features/products/types'
import type { Locale } from '@/lib/i18n/routing'
import { getQueryClient } from '@/lib/react-query-client'
import { JsonLd } from '@/shared/seo'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import ProductsContent from './_components/products-content'

const PRODUCTS_PAGE_SIZE = 12

// Page is ISR (revalidates every 10 min). Filters live on the client via nuqs
// inside `<ProductsCatalogSection>`, which drives `<ProductGrid>` to re-fetch
// when the URL changes — so the static hero/occasions/promise blocks stay in
// the ISR cache while the grid alone reacts to filter selection.
// Mirrors `REVALIDATE.productsList` in shared/cache.ts.
export const revalidate = 600

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params
  return generateProductsListMetadata(locale)
}

export default async function ProductsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const options = productListQuery(
    {
      size: PRODUCTS_PAGE_SIZE,
      categoryIds: DEFAULT_PRODUCT_CATEGORY_IDS,
      sort: DEFAULT_PRODUCT_SORT
    },
    locale
  )
  const queryClient = getQueryClient()

  await queryClient.prefetchQuery(options)

  const cached = queryClient.getQueryData<ProductListResponse>(options.queryKey)
  const initialItems = (cached?.value?.data ?? []) as Product[]

  return (
    <>
      <JsonLd data={buildProductsCollectionJsonLd(locale, initialItems)} />

      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProductsContent />
      </HydrationBoundary>
    </>
  )
}
