import { productDetailQuery } from '@/features/products/queries'
import { getAllProductIds, getProductDetail } from '@/features/products/queries.server'
import { buildProductDetailJsonLd, generateProductDetailMetadata } from '@/features/products/seo'
import type { ProductDetail } from '@/features/products/types'
import type { Locale } from '@/lib/i18n/routing'
import { routing } from '@/lib/i18n/routing'
import { getQueryClient } from '@/lib/react-query-client'
import { JsonLd } from '@/shared/seo'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ProductDetailContent from './_components/product-detail-content'

const STATIC_PRODUCT_LIMIT = 50

export const revalidate = 3600
export const dynamicParams = true

export async function generateStaticParams() {
  const ids = await getAllProductIds(STATIC_PRODUCT_LIMIT)
  return routing.locales.flatMap((locale) => ids.map((id) => ({ locale, id })))
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: Locale; id: string }>
}): Promise<Metadata> {
  const { locale, id } = await params
  const envelope = await getProductDetail(id, locale)
  const product = (envelope?.value?.data ?? null) as ProductDetail | null
  return generateProductDetailMetadata({ locale, product })
}

export default async function ProductPage({ params }: { params: Promise<{ locale: Locale; id: string }> }) {
  const { locale, id } = await params
  const envelope = await getProductDetail(id, locale)
  const product = envelope?.value?.data as ProductDetail | null | undefined

  if (!envelope || !product) {
    notFound()
  }

  const queryClient = getQueryClient()
  queryClient.setQueryData(productDetailQuery(id, locale).queryKey, envelope)

  return (
    <>
      <JsonLd data={buildProductDetailJsonLd(locale, product)} />

      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProductDetailContent product={product} />
      </HydrationBoundary>
    </>
  )
}
