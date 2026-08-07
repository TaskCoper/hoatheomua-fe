import ProductDetailContent from '@/features/products/components/product-detail-content'
import { productDetailQuery } from '@/features/products/queries'
import { getAllProductIds, getProductDetail } from '@/features/products/queries.server'
import { buildProductDetailJsonLd, generateProductDetailMetadata } from '@/features/products/seo'
import { getPublicConfigsGroup } from '@/features/public-configs/queries.server'
import { routing, type Locale } from '@/lib/i18n/routing'
import { getQueryClient } from '@/lib/react-query-client'
import { JsonLd } from '@/shared/seo'
import type { ProductSignatureMap, ProductsSignatureConfigItem } from '@/types/config.type'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

const STATIC_PRODUCT_LIMIT = 20

export const dynamicParams = true

// Freshness normally arrives on-demand: the admin webhook purges the `products`
// tag and revalidates `/products/{id}`. Without a window here, though, a webhook
// that is missed, dropped, or sent with the wrong id leaves this HTML stale
// forever. An hourly rebuild bounds that failure without meaningfully denting
// the cache hit rate.
export const revalidate = 3600

export async function generateStaticParams() {
  const ids = await getAllProductIds(STATIC_PRODUCT_LIMIT)
  return routing.locales.flatMap((locale) => ids.map((id) => ({ locale, id })))
}

// look up whether this product is mapped to a dedicated signature landing page on the server and passing
async function getSignatureLandingUrl(productId: string): Promise<string | null> {
  try {
    const configs = await getPublicConfigsGroup<ProductsSignatureConfigItem>('products', 'products.signature')
    const map = JSON.parse(configs[0]?.value.value ?? '{}') as ProductSignatureMap
    return map[productId]?.trim() || null
  } catch {
    return null
  }
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: Locale; id: string }>
}): Promise<Metadata> {
  const { locale, id } = await params
  setRequestLocale(locale)
  const product = await getProductDetail(id)
  return generateProductDetailMetadata({ locale, product })
}

export default async function ProductPage({ params }: { params: Promise<{ locale: Locale; id: string }> }) {
  const { locale, id } = await params
  setRequestLocale(locale)
  const product = await getProductDetail(id)

  if (!product) {
    notFound()
  }

  const landingUrl = await getSignatureLandingUrl(product.id)

  const queryClient = getQueryClient()
  queryClient.setQueryData(productDetailQuery(id).queryKey, product)

  return (
    <>
      <JsonLd data={buildProductDetailJsonLd(locale, product)} />

      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={null}>
          <ProductDetailContent product={product} landingUrl={landingUrl} />
        </Suspense>
      </HydrationBoundary>
    </>
  )
}
