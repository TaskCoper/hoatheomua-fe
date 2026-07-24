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

const DELIVERY_BASE_PATH = '/delivery'

type DeliveryCopy = SeoCopy & { breadcrumb: string }

const DELIVERY_COPY = {
  vi: {
    title: 'Chính sách giao – nhận & kiểm tra hàng',
    description:
      'Quy trình giao – nhận, kiểm tra hàng tại Hoa Theo Mùa: thời gian giao 7h00 – 18h00, đồng kiểm trước khi thanh toán, hỗ trợ 2 giờ kể từ khi nhận hàng.',
    keywords: [
      'chính sách giao nhận Hoa Theo Mùa',
      'giao hoa tận nơi TP HCM',
      'kiểm tra hàng khi nhận hoa',
      'đồng kiểm hoa tươi',
      'hoatheomua giao hàng'
    ],
    ogAlt: 'Chính sách giao – nhận và kiểm tra hàng Hoa Theo Mùa',
    breadcrumb: 'Chính sách giao – nhận và kiểm tra hàng'
  },
  en: {
    title: 'Delivery & Inspection Policy',
    description:
      'Hoa Theo Mua delivery and inspection guidelines — delivery hours 7AM–6PM, on-spot inspection before payment, and 2-hour support after receiving the flowers.',
    keywords: [
      'Hoa Theo Mua delivery policy',
      'Saigon flower delivery',
      'florist inspection on delivery',
      'cod flower delivery Vietnam'
    ],
    ogAlt: 'Hoa Theo Mua — Delivery & inspection policy',
    breadcrumb: 'Delivery & inspection policy'
  }
} satisfies LocaleCopy<DeliveryCopy>

export const generateDeliveryMetadata = (locale: Locale): Metadata =>
  buildPageMetadata({ locale, copy: DELIVERY_COPY[locale], basePath: DELIVERY_BASE_PATH })

export const buildDeliveryJsonLd = (locale: Locale) => {
  const copy = DELIVERY_COPY[locale]
  const path = localePath(locale, DELIVERY_BASE_PATH)
  const url = localeUrl(locale, DELIVERY_BASE_PATH)

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${SITE_URL}${path}#webpage`,
        url,
        name: `${copy.title} — ${SITE_NAME}`,
        description: copy.description,
        inLanguage: inLanguage(locale),
        isPartOf: { '@id': WEBSITE_ID },
        about: { '@id': ORGANIZATION_ID }
      },
      buildBreadcrumbList(locale, `${SITE_URL}${path}#breadcrumb`, [{ name: copy.breadcrumb, url }])
    ]
  }
}
