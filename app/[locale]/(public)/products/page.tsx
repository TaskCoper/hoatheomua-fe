import { DEFAULT_PRODUCT_CATEGORY_IDS, DEFAULT_PRODUCT_SORT } from '@/features/products/constants'
import { buildGetProductsKey } from '@/features/products/hooks/use-get-products'
import { fetchProductsList, type ProductListPayload } from '@/features/products/server'
import type { Product } from '@/features/products/types'
import type { Locale } from '@/lib/i18n/routing'
import type { BaseResponse } from '@/lib/axios'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import type { Metadata } from 'next'
import ProductsContent from './_components/products-content'

const REVALIDATE_SECONDS = 600
const PRODUCTS_PAGE_SIZE = 12
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hoatheomua.net'

export const revalidate = 600

const PRODUCTS_META: Record<
  Locale,
  { title: string; description: string; keywords: string[]; ogLocale: string; ogAlt: string }
> = {
  vi: {
    title: 'Bộ Sưu Tập Hoa Tươi',
    description:
      'Khám phá bộ sưu tập hoa tươi cao cấp của Hoa Theo Mùa — bó hoa sinh nhật, hoa khai trương, lan hồ điệp, hoa cưới và hơn 50 thiết kế theo mùa, giao tận nơi trong 2 giờ tại TP. HCM.',
    keywords: [
      'bó hoa tươi',
      'hoa sinh nhật',
      'hoa khai trương',
      'lan hồ điệp',
      'hoa cưới',
      'shop hoa Hồ Chí Minh',
      'đặt hoa online',
      'giao hoa tận nơi',
      'hoa theo mùa',
      'bó hoa cao cấp'
    ],
    ogLocale: 'vi_VN',
    ogAlt: 'Bộ sưu tập hoa tươi Hoa Theo Mùa'
  },
  en: {
    title: 'Fresh Flower Collection',
    description:
      'Discover Hoa Theo Mùa premium fresh flower collection — birthday bouquets, opening flowers, orchids, wedding bouquets and 50+ seasonal designs, delivered in 2 hours in Ho Chi Minh City.',
    keywords: [
      'fresh flower bouquet',
      'birthday flowers Vietnam',
      'opening flowers HCMC',
      'phalaenopsis orchid',
      'wedding bouquet Saigon',
      'flower delivery HCMC',
      'order flowers online',
      'seasonal flowers Vietnam'
    ],
    ogLocale: 'en_US',
    ogAlt: 'Hoa Theo Mùa — Fresh flower collection'
  }
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params
  const meta = PRODUCTS_META[locale] ?? PRODUCTS_META.vi
  const path = locale === 'vi' ? '/products' : '/en/products'

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    alternates: {
      canonical: path,
      languages: {
        vi: '/products',
        en: '/en/products',
        'x-default': '/products'
      }
    },
    openGraph: {
      type: 'website',
      siteName: 'Hoa Theo Mùa',
      title: meta.title,
      description: meta.description,
      url: path,
      locale: meta.ogLocale,
      alternateLocale: locale === 'vi' ? ['en_US'] : ['vi_VN'],
      images: [
        {
          url: '/images/banner-one.png',
          width: 1200,
          height: 630,
          alt: meta.ogAlt
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      images: ['/images/banner-one.png']
    },
    category: 'shopping'
  }
}

const productUrl = (locale: Locale, id: number | string) =>
  locale === 'vi' ? `${SITE_URL}/products/${id}` : `${SITE_URL}/en/products/${id}`

const buildProductsJsonLd = (locale: Locale, items: Product[]) => {
  const meta = PRODUCTS_META[locale] ?? PRODUCTS_META.vi
  const path = locale === 'vi' ? '/products' : '/en/products'
  const inLanguage = locale === 'vi' ? 'vi-VN' : 'en-US'

  const itemList =
    items.length > 0
      ? {
          '@type': 'ItemList',
          '@id': `${SITE_URL}${path}#itemlist`,
          numberOfItems: items.length,
          itemListElement: items.map((product, index) => {
            const url = productUrl(locale, product.id)
            const available = (product.inventory?.available ?? 0) > 0

            return {
              '@type': 'ListItem',
              position: index + 1,
              url,
              item: {
                '@type': 'Product',
                '@id': `${url}#product`,
                name: product.name,
                url,
                sku: String(product.id),
                ...(product.images?.avatar ? { image: product.images.avatar } : {}),
                ...(product.prices?.retail
                  ? {
                      offers: {
                        '@type': 'Offer',
                        url,
                        priceCurrency: 'VND',
                        price: product.prices.retail,
                        availability: available
                          ? 'https://schema.org/InStock'
                          : 'https://schema.org/OutOfStock',
                        itemCondition: 'https://schema.org/NewCondition'
                      }
                    }
                  : {})
              }
            }
          })
        }
      : null

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${SITE_URL}${path}#webpage`,
        url: `${SITE_URL}${path}`,
        name: `${meta.title} — Hoa Theo Mùa`,
        description: meta.description,
        inLanguage,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@id': `${SITE_URL}/#organization` },
        primaryImageOfPage: { '@type': 'ImageObject', url: `${SITE_URL}/images/banner-one.png` },
        ...(itemList ? { mainEntity: { '@id': `${SITE_URL}${path}#itemlist` } } : {})
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${SITE_URL}${path}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: locale === 'vi' ? 'Trang chủ' : 'Home',
            item: `${SITE_URL}/`
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: locale === 'vi' ? 'Sản phẩm' : 'Products',
            item: `${SITE_URL}${path}`
          }
        ]
      },
      ...(itemList ? [itemList] : [])
    ]
  }
}

export default async function ProductsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const queryClient = new QueryClient()

  const queryKey = buildGetProductsKey({
    size: PRODUCTS_PAGE_SIZE,
    categoryIds: DEFAULT_PRODUCT_CATEGORY_IDS,
    sort: DEFAULT_PRODUCT_SORT
  })

  await queryClient.prefetchQuery({
    queryKey,
    queryFn: () =>
      fetchProductsList(
        { size: PRODUCTS_PAGE_SIZE, categoryIds: DEFAULT_PRODUCT_CATEGORY_IDS },
        { revalidate: REVALIDATE_SECONDS }
      )
  })

  const cached = queryClient.getQueryData<BaseResponse<ProductListPayload>>(queryKey)
  const initialItems = cached?.value?.data ?? []

  const jsonLd = buildProductsJsonLd(locale, initialItems)

  return (
    <>
      <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProductsContent />
      </HydrationBoundary>
    </>
  )
}
