import categoryService from '@/features/categories/services'
import ProductsContent from '@/features/products/components/products-content'
import { buildProductsCollectionJsonLd, generateProductsListMetadata } from '@/features/products/seo'
import type { Locale } from '@/lib/i18n/routing'
import { getQueryClient } from '@/lib/react-query-client'
import { JsonLd } from '@/shared/seo'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { Suspense } from 'react'

// URL-driven filters (nuqs) make this route request-specific → render on the server per request.
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params
  return generateProductsListMetadata(locale)
}

export default async function ProductsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const queryClient = getQueryClient()

  try {
    await queryClient.prefetchQuery({ queryKey: ['categories'], queryFn: categoryService.getCategories })
  } catch (error) {
    console.error('[SSR] categories prefetch failed:', error)
  }

  return (
    <>
      <JsonLd data={buildProductsCollectionJsonLd(locale, [])} />

      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={null}>
          <ProductsContent />
        </Suspense>
      </HydrationBoundary>
    </>
  )
}
