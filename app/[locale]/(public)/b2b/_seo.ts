import type { Locale } from '@/lib/i18n/routing'
import { buildBreadcrumbList, buildPageMetadata, inLanguage, ORGANIZATION_ID, SITE_URL, type LocaleCopy, type SeoCopy } from '@/shared/seo'
import { localePath, localeUrl } from '@/shared/seo/url'
import type { Metadata } from 'next'

const B2B_BASE_PATH = '/b2b'

type B2BCopy = SeoCopy & { breadcrumb: string }

const B2B_COPY = {
  vi: {
    title: 'Dịch Vụ Hoa Cho Doanh Nghiệp',
    description:
      'Hoa Theo Mùa cung cấp dịch vụ hoa B2B cao cấp cho doanh nghiệp tại Việt Nam: hoa văn phòng định kỳ, sự kiện công ty, khách sạn, đám cưới, quà tặng và khai trương.',
    keywords: [
      'hoa B2B',
      'hoa doanh nghiệp',
      'hoa văn phòng',
      'hoa khách sạn',
      'hoa sự kiện',
      'hoa cưới',
      'quà tặng doanh nghiệp',
      'hoa Theo Mùa B2B'
    ],
    ogAlt: 'Dịch vụ hoa doanh nghiệp Hoa Theo Mùa',
    breadcrumb: 'Doanh nghiệp'
  },
  en: {
    title: 'Flowers For Business',
    description:
      'Hoa Theo Mùa delivers premium B2B floral services across Vietnam: office subscriptions, corporate events, hotel styling, weddings, corporate gifts and grand-opening installations.',
    keywords: [
      'B2B flowers Vietnam',
      'corporate flower subscription',
      'office flowers',
      'hotel florist',
      'event florist Vietnam',
      'wedding florist',
      'corporate gifting flowers'
    ],
    ogAlt: 'Hoa Theo Mùa B2B floral services',
    breadcrumb: 'Business'
  }
} satisfies LocaleCopy<B2BCopy>

const B2B_PACKAGE_OFFERS = [
  {
    '@type': 'Offer',
    name: 'Boutique',
    priceCurrency: 'VND',
    price: '8000000',
    priceSpecification: {
      '@type': 'UnitPriceSpecification',
      price: '8000000',
      priceCurrency: 'VND',
      unitText: 'MONTH'
    }
  },
  {
    '@type': 'Offer',
    name: 'Atelier',
    priceCurrency: 'VND',
    price: '25000000',
    priceSpecification: {
      '@type': 'UnitPriceSpecification',
      price: '25000000',
      priceCurrency: 'VND',
      unitText: 'MONTH'
    }
  },
  {
    '@type': 'Offer',
    name: 'Signature',
    priceCurrency: 'VND',
    description: 'Custom pricing on request'
  }
] as const

export const generateB2BMetadata = (locale: Locale): Metadata =>
  buildPageMetadata({ locale, copy: B2B_COPY[locale], basePath: B2B_BASE_PATH })

export const buildB2BJsonLd = (locale: Locale) => {
  const copy = B2B_COPY[locale]
  const path = localePath(locale, B2B_BASE_PATH)
  const url = localeUrl(locale, B2B_BASE_PATH)

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': `${SITE_URL}${path}#service`,
        name: 'Hoa Theo Mùa — B2B Floral Services',
        serviceType: 'Corporate floral design and delivery',
        areaServed: ['Ho Chi Minh City', 'Hanoi', 'Da Nang'],
        provider: { '@id': ORGANIZATION_ID },
        description: copy.description,
        inLanguage: inLanguage(locale),
        offers: B2B_PACKAGE_OFFERS
      },
      buildBreadcrumbList(locale, `${SITE_URL}${path}#breadcrumb`, [{ name: copy.breadcrumb, url }])
    ]
  }
}
