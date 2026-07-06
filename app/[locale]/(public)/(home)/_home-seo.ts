import { getCompanyGpkd, getCompanyHotlines } from '@/features/company/queries.server'
import type { Locale } from '@/lib/i18n/routing'
import {
  buildPageMetadata,
  BUSINESS_ADDRESS,
  BUSINESS_AREA_SERVED,
  BUSINESS_CURRENCIES_ACCEPTED,
  BUSINESS_ID,
  BUSINESS_LOGO_URL,
  BUSINESS_OPENING_HOURS,
  BUSINESS_PAYMENT_ACCEPTED,
  BUSINESS_PRICE_RANGE,
  DEFAULT_OG_IMAGE_DIMENSIONS,
  inLanguage,
  ORGANIZATION_ID,
  SITE_NAME,
  SITE_URL,
  SUPPORTED_LOCALES,
  WEBSITE_ID,
  type LocaleCopy,
  type SeoCopy
} from '@/shared/seo'
import type { Metadata } from 'next'

const HOME_BASE_PATH = '/'
const HOME_OG_IMAGE_PATH = '/images/hero-poster.jpg'

export const HOME_COPY = {
  vi: {
    title: 'Hoa Theo Mùa — Hoa tươi cao cấp, giao tận nơi trong 2 giờ tại TP.HCM',
    description:
      'Hoa Theo Mùa — Hệ thống hoa tươi online tại TP. Hồ Chí Minh, chuyên cung cấp hoa tươi cao cấp và giao hoa tận nơi siêu nhanh trong 2 giờ. Hoa sinh nhật, hoa khai trương, hoa 8/3, 20/10, 20/11, lan hồ điệp và nhiều bộ sưu tập theo mùa.',
    keywords: [
      'hoa tươi',
      'hoa theo mùa',
      'giao hoa tận nơi',
      'shop hoa Hồ Chí Minh',
      'đặt hoa online',
      'hoa sinh nhật',
      'hoa khai trương',
      'hoa 8/3',
      'hoa 20/10',
      'hoa 20/11',
      'lan hồ điệp',
      'hoa Noel',
      'bó hoa cao cấp'
    ],
    ogAlt: 'Hoa Theo Mùa — Bộ sưu tập hoa tươi cao cấp'
  },
  en: {
    title: 'Hoa Theo Mùa — Premium Seasonal Flowers, Delivered in 2 Hours in HCMC',
    description:
      'Hoa Theo Mùa is a Ho Chi Minh City florist offering premium seasonal bouquets with same-day flower delivery within 2 hours. Birthday, opening, and gift flowers arranged by hand.',
    keywords: [
      'fresh flowers Vietnam',
      'flower delivery HCMC',
      'florist Ho Chi Minh City',
      'seasonal flowers',
      'birthday flowers Vietnam',
      'bouquet delivery Saigon',
      'send flowers Vietnam'
    ],
    ogAlt: 'Hoa Theo Mùa — Premium seasonal flower collection'
  }
} satisfies LocaleCopy<SeoCopy>

export const generateHomeMetadata = (locale: Locale): Metadata => {
  const copy = HOME_COPY[locale]

  return buildPageMetadata({
    locale,
    copy,
    basePath: HOME_BASE_PATH,
    ogImage: {
      url: HOME_OG_IMAGE_PATH,
      width: DEFAULT_OG_IMAGE_DIMENSIONS.width,
      height: DEFAULT_OG_IMAGE_DIMENSIONS.height,
      alt: copy.ogAlt ?? copy.title
    },
    extras: { title: { absolute: copy.title }, category: 'shopping' }
  })
}

/**
 * Site-wide `Organization` + `Florist` (LocalBusiness) + `WebSite` graph. Other
 * pages reference these via `@id`, so the home page is the canonical definition.
 * The graph itself is locale-agnostic — `WebSite.inLanguage` lists all supported
 * locales rather than the current one.
 */
export const buildHomeJsonLd = async () => {
  const [taxId, hotlines] = await Promise.all([getCompanyGpkd(), getCompanyHotlines()])

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': ORGANIZATION_ID,
        name: SITE_NAME,
        legalName: 'CÔNG TY TNHH HOA THEO MÙA',
        url: SITE_URL,
        logo: { '@type': 'ImageObject', url: BUSINESS_LOGO_URL, width: 512, height: 512 },
        foundingDate: '2020-11-12',
        founder: { '@type': 'Person', name: 'Lê Thị Hoa Đào', jobTitle: 'Founder & CEO' },
        taxID: taxId ?? undefined,
        sameAs: [] as string[]
      },
      {
        '@type': 'Florist',
        '@id': BUSINESS_ID,
        name: SITE_NAME,
        image: BUSINESS_LOGO_URL,
        logo: BUSINESS_LOGO_URL,
        url: SITE_URL,
        description:
          'Hệ thống hoa tươi online tại TP. Hồ Chí Minh chuyên cung cấp hoa tươi cao cấp và giao hoa tận nơi siêu nhanh trong 2 giờ.',
        telephone: hotlines,
        priceRange: BUSINESS_PRICE_RANGE,
        currenciesAccepted: BUSINESS_CURRENCIES_ACCEPTED,
        paymentAccepted: BUSINESS_PAYMENT_ACCEPTED,
        address: BUSINESS_ADDRESS,
        areaServed: BUSINESS_AREA_SERVED,
        openingHoursSpecification: BUSINESS_OPENING_HOURS,
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '5',
          reviewCount: 325,
          bestRating: '5',
          worstRating: '1'
        },
        founder: { '@id': ORGANIZATION_ID }
      },
      {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        url: SITE_URL,
        name: SITE_NAME,
        publisher: { '@id': ORGANIZATION_ID },
        inLanguage: SUPPORTED_LOCALES.map(inLanguage)
      }
    ]
  }
}
