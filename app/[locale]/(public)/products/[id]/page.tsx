import { buildGetProductKey } from '@/features/products/hooks/use-get-product'
import { fetchProductDetailById, fetchTopProductIds } from '@/features/products/server'
import type { ProductDetail } from '@/features/products/types'
import type { Locale } from '@/lib/i18n/routing'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import ProductDetailContent from './_components/product-detail-content'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL
const REVALIDATE_SECONDS = 3600
const STATIC_PRODUCT_LIMIT = 50
const META_DESCRIPTION_MAX_LENGTH = 155

export const revalidate = 3600
export const dynamicParams = true

export async function generateStaticParams() {
  const ids = await fetchTopProductIds(STATIC_PRODUCT_LIMIT, { revalidate: REVALIDATE_SECONDS })
  return ids.map((id) => ({ id }))
}

const safeFetchProduct = cache(async (id: string) => {
  try {
    return await fetchProductDetailById(id, { revalidate: REVALIDATE_SECONDS })
  } catch {
    return null
  }
})

const stripHtml = (value: string | null | undefined) =>
  (value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const truncate = (value: string, max: number) => (value.length <= max ? value : `${value.slice(0, max - 1).trimEnd()}…`)

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: Locale; id: string }>
}): Promise<Metadata> {
  const { locale, id } = await params
  const product = await safeFetchProduct(id)

  if (!product) {
    return {
      title: 'Không tìm thấy sản phẩm',
      description: 'Sản phẩm bạn đang tìm không còn tồn tại hoặc đã được dời sang đường dẫn khác.',
      robots: { index: false, follow: true }
    }
  }

  const productName = product.name ?? 'Hoa Theo Mùa'
  const path = locale === 'vi' ? `/products/${product.id}` : `/en/products/${product.id}`
  const cleanDescription = stripHtml(product.description) || `${productName} — Hoa Theo Mùa`
  const description = truncate(cleanDescription, META_DESCRIPTION_MAX_LENGTH)
  const avatar = product.images?.avatar ?? '/images/banner-one.png'
  const ogImage = product.images?.avatar
    ? { url: avatar, alt: productName }
    : { url: avatar, width: 1200, height: 630, alt: productName }

  return {
    title: productName,
    description,
    keywords: [
      productName,
      product.category?.name,
      product.brand?.name,
      'hoa tươi',
      'shop hoa',
      'Hoa Theo Mùa',
      'giao hoa TP HCM'
    ].filter((value): value is string => Boolean(value)),
    alternates: {
      canonical: path,
      languages: {
        vi: `/products/${product.id}`,
        en: `/en/products/${product.id}`,
        'x-default': `/products/${product.id}`
      }
    },
    openGraph: {
      type: 'website',
      siteName: 'Hoa Theo Mùa',
      title: `${productName} — Hoa Theo Mùa`,
      description,
      url: path,
      locale: locale === 'vi' ? 'vi_VN' : 'en_US',
      alternateLocale: locale === 'vi' ? ['en_US'] : ['vi_VN'],
      images: [ogImage]
    },
    twitter: {
      card: 'summary_large_image',
      title: `${productName} — Hoa Theo Mùa`,
      description,
      images: [avatar]
    },
    category: 'shopping'
  }
}

const priceValidUntil = () => {
  const now = new Date()
  return new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0]
}

export default async function ProductPage({ params }: { params: Promise<{ locale: Locale; id: string }> }) {
  const { locale, id } = await params
  const queryClient = new QueryClient()
  const queryKey = buildGetProductKey(id)

  await queryClient.prefetchQuery({
    queryKey,
    queryFn: () => safeFetchProduct(id)
  })

  const product = queryClient.getQueryData<ProductDetail | null>(queryKey)

  if (!product) {
    notFound()
  }

  const productName = product.name ?? 'Hoa Theo Mùa'
  const description = stripHtml(product.description) || `${productName} — Hoa Theo Mùa`
  const avatar = product.images?.avatar ?? `${SITE_URL}/images/banner-one.png`
  const allImages = [avatar, ...(product.images?.others ?? [])].filter(
    (url): url is string => Boolean(url) && url.startsWith('http')
  )
  const path = locale === 'vi' ? `/products/${product.id}` : `/en/products/${product.id}`
  const inLanguage = locale === 'vi' ? 'vi-VN' : 'en-US'
  const homeName = locale === 'vi' ? 'Trang chủ' : 'Home'
  const productsName = locale === 'vi' ? 'Sản phẩm' : 'Products'
  const inStock = (product.inventory?.available ?? 0) > 0

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        '@id': `${SITE_URL}${path}#product`,
        url: `${SITE_URL}${path}`,
        name: productName,
        description,
        image: allImages.length > 0 ? allImages : [avatar],
        sku: product.code || `htm-${product.id}`,
        mpn: product.code || `htm-${product.id}`,
        inLanguage,
        category: product.category?.name ?? undefined,
        brand: { '@type': 'Brand', name: product.brand?.name ?? 'Hoa Theo Mùa' },
        offers: {
          '@type': 'Offer',
          url: `${SITE_URL}${path}`,
          priceCurrency: 'VND',
          price: product.prices?.retail ?? 0,
          priceValidUntil: priceValidUntil(),
          availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          itemCondition: 'https://schema.org/NewCondition',
          seller: { '@id': `${SITE_URL}/#organization` }
        }
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${SITE_URL}${path}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: homeName, item: `${SITE_URL}/` },
          {
            '@type': 'ListItem',
            position: 2,
            name: productsName,
            item: `${SITE_URL}${locale === 'vi' ? '/products' : '/en/products'}`
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: productName,
            item: `${SITE_URL}${path}`
          }
        ]
      }
    ]
  }

  return (
    <>
      <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProductDetailContent product={product} />
      </HydrationBoundary>
    </>
  )
}
