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

const RETURNS_BASE_PATH = '/returns'

type ReturnsCopy = SeoCopy & { breadcrumb: string }

const RETURNS_COPY = {
  vi: {
    title: 'Chính sách đổi trả',
    description:
      'Chính sách đổi trả Hoa Theo Mùa & Mokar — quy định đổi trả hoa tươi, lan hồ điệp và công cụ dụng cụ. Cam kết minh bạch, nhanh chóng, đúng cam kết.',
    keywords: [
      'chính sách đổi trả Hoa Theo Mùa',
      'đổi trả hoa tươi',
      'đổi trả lan hồ điệp Mokar',
      'return policy florist',
      'hoatheomua đổi hoa hư hỏng'
    ],
    ogAlt: 'Chính sách đổi trả Hoa Theo Mùa',
    breadcrumb: 'Chính sách đổi trả'
  },
  en: {
    title: 'Return Policy',
    description:
      'Return policy for Hoa Theo Mua & Mokar — transparent guidelines for replacing fresh flowers, phalaenopsis orchids, and tools when something goes wrong.',
    keywords: [
      'Hoa Theo Mua return policy',
      'florist return policy',
      'fresh flower returns',
      'Mokar phalaenopsis returns'
    ],
    ogAlt: 'Hoa Theo Mua — Return policy',
    breadcrumb: 'Return policy'
  }
} satisfies LocaleCopy<ReturnsCopy>

export const generateReturnsMetadata = (locale: Locale): Metadata =>
  buildPageMetadata({ locale, copy: RETURNS_COPY[locale], basePath: RETURNS_BASE_PATH })

export const buildReturnsJsonLd = (locale: Locale) => {
  const copy = RETURNS_COPY[locale]
  const path = localePath(locale, RETURNS_BASE_PATH)
  const url = localeUrl(locale, RETURNS_BASE_PATH)

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
