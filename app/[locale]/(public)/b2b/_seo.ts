import type { Locale } from '@/lib/i18n/routing'
import {
  buildBreadcrumbList,
  buildPageMetadata,
  inLanguage,
  ORGANIZATION_ID,
  SITE_URL,
  type LocaleCopy,
  type SeoCopy
} from '@/shared/seo'
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

export const B2B_SERVICE_SLUGS = [
  'outsourced',
  'events-mice',
  'office-subscription',
  'corporate-gifts',
  'brand-experience'
] as const

export type B2BServiceSlug = (typeof B2B_SERVICE_SLUGS)[number]

type B2BServiceCopy = SeoCopy & { breadcrumb: string; serviceType: string }

const B2B_SERVICE_COPY: Record<B2BServiceSlug, LocaleCopy<B2BServiceCopy>> = {
  outsourced: {
    vi: {
      title: 'Phòng Hoa Thuê Ngoài Cho Khách Sạn 4–5 Sao',
      description:
        'Giải pháp outsource toàn bộ vận hành hoa tươi cho khách sạn 4–5 sao, resort và tòa nhà cao cấp. Đội ngũ florist Hoa Theo Mùa vận hành như phòng hoa nội bộ chuẩn quốc tế.',
      keywords: [
        'phòng hoa thuê ngoài',
        'outsource florist',
        'hoa khách sạn 5 sao',
        'hoa lobby khách sạn',
        'florist khách sạn Sài Gòn',
        'hoa resort'
      ],
      ogAlt: 'Dịch vụ phòng hoa thuê ngoài Hoa Theo Mùa',
      breadcrumb: 'Phòng hoa thuê ngoài',
      serviceType: 'Outsourced hotel florist department'
    },
    en: {
      title: 'Outsourced Florist Department For 4–5 Star Hotels',
      description:
        'End-to-end outsourced floral operations for 4–5 star hotels, resorts and premium buildings — our florists run as your in-house flower team, at international standards.',
      keywords: [
        'outsourced florist department',
        'hotel florist Vietnam',
        'hotel lobby flowers',
        'resort florist',
        'in-house florist alternative',
        'Saigon hotel flowers'
      ],
      ogAlt: 'Hoa Theo Mùa outsourced florist department',
      breadcrumb: 'Outsourced florist department',
      serviceType: 'Outsourced hotel florist department'
    }
  },
  'events-mice': {
    vi: {
      title: 'Hoa Khai Trương, Sự Kiện & MICE Trọn Gói',
      description:
        'Thiết kế và thi công hoa sự kiện trọn gói cho doanh nghiệp: khai trương, hội nghị, gala dinner, ra mắt sản phẩm và chương trình MICE quy mô lớn.',
      keywords: [
        'hoa sự kiện doanh nghiệp',
        'hoa khai trương',
        'hoa hội nghị',
        'hoa MICE',
        'hoa gala dinner',
        'hoa ra mắt sản phẩm'
      ],
      ogAlt: 'Hoa sự kiện & MICE Hoa Theo Mùa',
      breadcrumb: 'Hoa khai trương, sự kiện & MICE',
      serviceType: 'Corporate event and MICE floral services'
    },
    en: {
      title: 'Grand Opening, Events & MICE Flowers, Turnkey',
      description:
        'Turnkey floral design and installation for corporate events: grand openings, conferences, gala dinners, product launches and large-scale MICE programmes.',
      keywords: [
        'MICE flowers Vietnam',
        'corporate event flowers',
        'gala dinner flowers',
        'grand opening flowers',
        'conference flower design',
        'product launch flowers'
      ],
      ogAlt: 'Hoa Theo Mùa event and MICE flowers',
      breadcrumb: 'Grand opening, events & MICE',
      serviceType: 'Corporate event and MICE floral services'
    }
  },
  'office-subscription': {
    vi: {
      title: 'Dịch Vụ Hoa Văn Phòng Định Kỳ',
      description:
        'Hoa tươi định kỳ cho văn phòng, tập đoàn, ngân hàng, showroom — thiết kế đồng bộ với thương hiệu, thay hoa đúng lịch, tiết kiệm thời gian quản lý.',
      keywords: [
        'hoa văn phòng định kỳ',
        'hoa tuần văn phòng',
        'hoa doanh nghiệp',
        'hoa lễ tân',
        'hoa hàng tuần',
        'hoa cho ngân hàng'
      ],
      ogAlt: 'Hoa văn phòng định kỳ Hoa Theo Mùa',
      breadcrumb: 'Hoa văn phòng định kỳ',
      serviceType: 'Office recurring flower subscription'
    },
    en: {
      title: 'Recurring Office Flower Subscription',
      description:
        'Recurring fresh flowers for offices, corporations, banks and showrooms — designed on-brand, replaced on schedule, no management overhead for your team.',
      keywords: [
        'office flower subscription',
        'weekly office flowers',
        'corporate flower service',
        'reception flowers',
        'bank flowers',
        'showroom flowers'
      ],
      ogAlt: 'Hoa Theo Mùa office flower subscription',
      breadcrumb: 'Recurring office flowers',
      serviceType: 'Office recurring flower subscription'
    }
  },
  'corporate-gifts': {
    vi: {
      title: 'Quà Tặng Doanh Nghiệp Bằng Hoa Tươi',
      description:
        'Giải pháp quà tặng hoa tươi cho khách hàng, đối tác và nhân viên — thiết kế theo nhận diện thương hiệu, giao đúng hẹn, linh hoạt theo ngân sách và quy mô.',
      keywords: [
        'quà tặng doanh nghiệp',
        'hoa tặng khách hàng',
        'hoa tri ân đối tác',
        'quà tặng nhân viên',
        'hoa 8/3 doanh nghiệp',
        'hoa Tết doanh nghiệp'
      ],
      ogAlt: 'Quà tặng doanh nghiệp Hoa Theo Mùa',
      breadcrumb: 'Quà tặng doanh nghiệp',
      serviceType: 'Corporate flower gifting'
    },
    en: {
      title: 'Corporate Flower Gifts',
      description:
        'Fresh-flower corporate gifting for clients, partners and employees — designed on-brand, delivered on time, flexible across budget and scale.',
      keywords: [
        'corporate flower gifts',
        'client gifting flowers',
        'partner appreciation flowers',
        'employee gift flowers',
        "women's day corporate flowers",
        'tet corporate gifting'
      ],
      ogAlt: 'Hoa Theo Mùa corporate flower gifting',
      breadcrumb: 'Corporate gifts',
      serviceType: 'Corporate flower gifting'
    }
  },
  'brand-experience': {
    vi: {
      title: 'Trải Nghiệm Thương Hiệu Cùng Hoa',
      description:
        "Workshop cắm hoa, mini event 'Thiền cùng Hoa', trải nghiệm khách VIP và hoạt động gắn kết nội bộ — biến hoa thành cầu nối cảm xúc giữa thương hiệu và khách hàng.",
      keywords: [
        'workshop cắm hoa doanh nghiệp',
        'trải nghiệm thương hiệu',
        'thiền cùng hoa',
        'flower workshop công ty',
        'hoạt động gắn kết nhân viên',
        'flower bar sự kiện'
      ],
      ogAlt: 'Trải nghiệm thương hiệu cùng hoa Hoa Theo Mùa',
      breadcrumb: 'Trải nghiệm thương hiệu cùng hoa',
      serviceType: 'Corporate flower workshop and brand experience'
    },
    en: {
      title: 'Brand Experience With Flowers',
      description:
        "Flower workshops, 'Meditate with Flowers' mini-events, VIP customer experiences and internal team bonding — turn flowers into an emotional bridge between your brand and audience.",
      keywords: [
        'corporate flower workshop',
        'brand experience with flowers',
        'meditate with flowers',
        'employee bonding workshop',
        'VIP customer experience flowers',
        'event flower bar'
      ],
      ogAlt: 'Hoa Theo Mùa brand experience with flowers',
      breadcrumb: 'Brand experience with flowers',
      serviceType: 'Corporate flower workshop and brand experience'
    }
  }
}

const servicePath = (slug: B2BServiceSlug) => `${B2B_BASE_PATH}/${slug}`

export const generateB2BServiceMetadata = (locale: Locale, slug: B2BServiceSlug): Metadata =>
  buildPageMetadata({
    locale,
    copy: B2B_SERVICE_COPY[slug][locale],
    basePath: servicePath(slug)
  })

export const buildB2BServiceJsonLd = (locale: Locale, slug: B2BServiceSlug) => {
  const copy = B2B_SERVICE_COPY[slug][locale]
  const parent = B2B_COPY[locale]
  const path = localePath(locale, servicePath(slug))
  const url = localeUrl(locale, servicePath(slug))
  const parentUrl = localeUrl(locale, B2B_BASE_PATH)

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': `${SITE_URL}${path}#service`,
        name: copy.title,
        serviceType: copy.serviceType,
        areaServed: ['Ho Chi Minh City', 'Hanoi', 'Da Nang'],
        provider: { '@id': ORGANIZATION_ID },
        description: copy.description,
        inLanguage: inLanguage(locale),
        url
      },
      buildBreadcrumbList(locale, `${SITE_URL}${path}#breadcrumb`, [
        { name: parent.breadcrumb, url: parentUrl },
        { name: copy.breadcrumb, url }
      ])
    ]
  }
}
