import { fetchProductsList } from '@/features/products/server'
import type { Product } from '@/features/products/types'
import type { Locale } from '@/lib/i18n/routing'
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
          itemListOrder: 'https://schema.org/ItemListOrderDescending',
          numberOfItems: items.length,
          itemListElement: items.map((product, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: productUrl(locale, product.id),
            name: product.name
          }))
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

  let initialItems: Awaited<ReturnType<typeof fetchProductsList>>['value']['data'] = []
  let initialNextCursor = 0

  try {
    const response = await fetchProductsList(
      { size: PRODUCTS_PAGE_SIZE, next: { id: 0 } },
      { revalidate: REVALIDATE_SECONDS }
    )
    initialItems = response.value?.data ?? []
    initialNextCursor = response.value?.paginator.next.id ?? 0
  } catch {
    // Render the page with an empty initial list; the client grid will surface
    // the empty state and React Query will retry on mount.
  }

  const jsonLd = buildProductsJsonLd(locale, initialItems)

  return (
    <>
      <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductsContent initialItems={initialItems} initialNextCursor={initialNextCursor} />
    </>
  )
}
