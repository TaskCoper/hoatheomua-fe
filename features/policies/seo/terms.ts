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

const TERMS_BASE_PATH = '/terms'

type TermsCopy = SeoCopy & { breadcrumb: string }

const TERMS_COPY = {
  vi: {
    title: 'Điều khoản sử dụng',
    description:
      'Điều khoản sử dụng website hoatheomua.com — quy định việc truy cập, sử dụng nội dung, quyền riêng tư và trách nhiệm khi mua hoa tại Hoa Theo Mùa.',
    keywords: [
      'điều khoản sử dụng Hoa Theo Mùa',
      'terms of use hoatheomua',
      'điều khoản dịch vụ hoa tươi',
      'quy định mua hoa online',
      'chính sách Hoa Theo Mùa'
    ],
    ogAlt: 'Điều khoản sử dụng Hoa Theo Mùa',
    breadcrumb: 'Điều khoản sử dụng'
  },
  en: {
    title: 'Terms Of Use',
    description:
      'The terms of use for hoatheomua.com — site access, content rights, privacy, and customer responsibilities when shopping with Hoa Theo Mua.',
    keywords: [
      'Hoa Theo Mua terms of use',
      'florist terms and conditions',
      'online flower shop terms',
      'hoatheomua policy'
    ],
    ogAlt: 'Hoa Theo Mua — Terms of use',
    breadcrumb: 'Terms of use'
  }
} satisfies LocaleCopy<TermsCopy>

export const generateTermsMetadata = (locale: Locale): Metadata =>
  buildPageMetadata({ locale, copy: TERMS_COPY[locale], basePath: TERMS_BASE_PATH })

export const buildTermsJsonLd = (locale: Locale) => {
  const copy = TERMS_COPY[locale]
  const path = localePath(locale, TERMS_BASE_PATH)
  const url = localeUrl(locale, TERMS_BASE_PATH)

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
