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

const PRIVACY_BASE_PATH = '/privacy'

type PrivacyCopy = SeoCopy & { breadcrumb: string }

const PRIVACY_COPY = {
  vi: {
    title: 'Chính sách bảo mật thông tin',
    description:
      'Chính sách bảo mật thông tin Hoa Theo Mùa - cam kết bảo vệ dữ liệu cá nhân khách hàng khi sử dụng website hoatheomua.com và dịch vụ hoa tươi.',
    keywords: [
      'chính sách bảo mật Hoa Theo Mùa',
      'privacy policy hoatheomua',
      'bảo mật thông tin khách hàng',
      'thu thập thông tin website hoa',
      'quyền riêng tư người dùng'
    ],
    ogAlt: 'Chính sách bảo mật thông tin Hoa Theo Mùa',
    breadcrumb: 'Chính sách bảo mật thông tin'
  },
  en: {
    title: 'Privacy Policy',
    description:
      'Hoa Theo Mua privacy policy - how we collect, use, and protect your personal information when you shop at hoatheomua.com.',
    keywords: ['Hoa Theo Mua privacy policy', 'florist privacy', 'customer data protection', 'hoatheomua data privacy'],
    ogAlt: 'Hoa Theo Mua - Privacy policy',
    breadcrumb: 'Privacy policy'
  }
} satisfies LocaleCopy<PrivacyCopy>

export const generatePrivacyMetadata = (locale: Locale): Metadata =>
  buildPageMetadata({ locale, copy: PRIVACY_COPY[locale], basePath: PRIVACY_BASE_PATH })

export const buildPrivacyJsonLd = (locale: Locale) => {
  const copy = PRIVACY_COPY[locale]
  const path = localePath(locale, PRIVACY_BASE_PATH)
  const url = localeUrl(locale, PRIVACY_BASE_PATH)

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
