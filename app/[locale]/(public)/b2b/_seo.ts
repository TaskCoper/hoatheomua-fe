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
      'Hoa Theo Mùa — đối tác hoa cho khách sạn 4–5 sao, văn phòng và thương hiệu: phòng hoa thuê ngoài, hoa văn phòng định kỳ, gói hoa lan lễ tân theo quý, hoa sự kiện MICE và quà tặng doanh nghiệp.',
    keywords: [
      'hoa doanh nghiệp',
      'phòng hoa thuê ngoài',
      'hoa khách sạn',
      'hoa văn phòng định kỳ',
      'hoa lan lễ tân',
      'hoa sự kiện MICE',
      'quà tặng doanh nghiệp',
      'Hoa Theo Mùa B2B'
    ],
    ogAlt: 'Dịch vụ hoa doanh nghiệp Hoa Theo Mùa',
    breadcrumb: 'Doanh nghiệp'
  },
  en: {
    title: 'Flowers For Business',
    description:
      'Hoa Theo Mùa — floral partner for 4–5 star hotels, offices and brands: outsourced florist department, recurring office flowers, quarterly reception orchid packages, MICE event florals and corporate gifting.',
    keywords: [
      'B2B flowers Vietnam',
      'outsourced florist department',
      'hotel florist',
      'office flower subscription',
      'reception orchid packages',
      'MICE event flowers',
      'corporate gifting flowers'
    ],
    ogAlt: 'Hoa Theo Mùa B2B floral services',
    breadcrumb: 'Business'
  }
} satisfies LocaleCopy<B2BCopy>

const B2B_PACKAGE_OFFERS = [
  {
    '@type': 'Offer',
    name: 'Như Ý',
    priceCurrency: 'VND',
    price: '2595000',
    priceSpecification: {
      '@type': 'UnitPriceSpecification',
      price: '2595000',
      priceCurrency: 'VND',
      unitCode: 'P3M',
      unitText: 'quarter'
    }
  },
  {
    '@type': 'Offer',
    name: 'Lộc Phát',
    priceCurrency: 'VND',
    price: '3995000',
    priceSpecification: {
      '@type': 'UnitPriceSpecification',
      price: '3995000',
      priceCurrency: 'VND',
      unitCode: 'P3M',
      unitText: 'quarter'
    }
  },
  {
    '@type': 'Offer',
    name: 'Thịnh Vượng',
    priceCurrency: 'VND',
    price: '6995000',
    priceSpecification: {
      '@type': 'UnitPriceSpecification',
      price: '6995000',
      priceCurrency: 'VND',
      unitCode: 'P3M',
      unitText: 'quarter'
    }
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
