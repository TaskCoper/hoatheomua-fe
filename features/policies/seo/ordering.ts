import type { Locale } from '@/lib/i18n/routing'
import {
  buildBreadcrumbList,
  buildPageMetadata,
  inLanguage,
  ORGANIZATION_ID,
  SITE_NAME,
  SITE_URL,
  WEBSITE_ID,
  type LocaleCopy,
  type SeoCopy
} from '@/shared/seo'
import { localePath, localeUrl } from '@/shared/seo/url'
import type { Metadata } from 'next'

const ORDERING_BASE_PATH = '/ordering'

type OrderingCopy = SeoCopy & { breadcrumb: string }

const ORDERING_COPY = {
  vi: {
    title: 'Hướng dẫn đặt hàng & thanh toán',
    description:
      'Hướng dẫn đặt hoa và thanh toán tại Hoa Theo Mùa: đặt hàng qua website, hotline, fanpage Facebook; thanh toán COD hoặc chuyển khoản qua Shinhan Bank.',
    keywords: [
      'hướng dẫn đặt hàng Hoa Theo Mùa',
      'đặt hoa online hoatheomua',
      'thanh toán COD hoa tươi',
      'chuyển khoản Shinhan Bank Hoa Theo Mùa',
      'đặt hoa qua fanpage'
    ],
    ogAlt: 'Hướng dẫn đặt hàng & thanh toán Hoa Theo Mùa',
    breadcrumb: 'Hướng dẫn đặt hàng & thanh toán'
  },
  en: {
    title: 'Ordering & Payment Guide',
    description:
      'How to order with Hoa Theo Mua and pay your way: website checkout, hotline orders, Facebook fanpage, plus COD or Shinhan Bank transfer.',
    keywords: [
      'Hoa Theo Mua ordering guide',
      'how to order flowers Vietnam',
      'Shinhan Bank flower payment',
      'florist COD Saigon'
    ],
    ogAlt: 'Hoa Theo Mua - Ordering & payment guide',
    breadcrumb: 'Ordering & payment guide'
  }
} satisfies LocaleCopy<OrderingCopy>

export const generateOrderingMetadata = (locale: Locale): Metadata =>
  buildPageMetadata({ locale, copy: ORDERING_COPY[locale], basePath: ORDERING_BASE_PATH })

export const buildOrderingJsonLd = (locale: Locale) => {
  const copy = ORDERING_COPY[locale]
  const path = localePath(locale, ORDERING_BASE_PATH)
  const url = localeUrl(locale, ORDERING_BASE_PATH)

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${SITE_URL}${path}#webpage`,
        url,
        name: `${copy.title} - ${SITE_NAME}`,
        description: copy.description,
        inLanguage: inLanguage(locale),
        isPartOf: { '@id': WEBSITE_ID },
        about: { '@id': ORGANIZATION_ID }
      },
      buildBreadcrumbList(locale, `${SITE_URL}${path}#breadcrumb`, [{ name: copy.breadcrumb, url }])
    ]
  }
}
