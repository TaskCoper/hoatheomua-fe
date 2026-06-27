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

const RECRUITMENT_BASE_PATH = '/recruitment'

type RecruitmentCopy = SeoCopy & { breadcrumb: string }

const RECRUITMENT_COPY = {
  vi: {
    title: 'Cơ Hội Nghề Nghiệp Tại Hoa Theo Mùa',
    description:
      'Khám phá các vị trí tuyển dụng tại Hoa Theo Mùa — gia nhập đội ngũ hoa tươi cao cấp tại TP. Hồ Chí Minh, cùng phát triển sự nghiệp và lan toả vẻ đẹp Việt qua từng bó hoa.',
    keywords: [
      'tuyển dụng Hoa Theo Mùa',
      'việc làm hoa tươi',
      'tuyển dụng florist Việt Nam',
      'việc làm shop hoa TP HCM',
      'việc làm thiết kế hoa',
      'việc làm chăm sóc khách hàng hoa',
      'tuyển nhân viên giao hoa'
    ],
    ogAlt: 'Cơ hội nghề nghiệp Hoa Theo Mùa',
    breadcrumb: 'Tuyển dụng'
  },
  en: {
    title: 'Careers At Hoa Theo Mùa',
    description:
      'Explore open positions at Hoa Theo Mùa — join our premium florist team in Ho Chi Minh City and help bring Vietnamese floral artistry to more homes and businesses.',
    keywords: [
      'Hoa Theo Mua careers',
      'florist jobs Vietnam',
      'flower shop jobs HCMC',
      'florist designer jobs',
      'flower delivery jobs',
      'flower retail jobs Vietnam'
    ],
    ogAlt: 'Hoa Theo Mùa careers',
    breadcrumb: 'Careers'
  }
} satisfies LocaleCopy<RecruitmentCopy>

export const generateRecruitmentMetadata = (locale: Locale): Metadata =>
  buildPageMetadata({ locale, copy: RECRUITMENT_COPY[locale], basePath: RECRUITMENT_BASE_PATH })

export const buildRecruitmentJsonLd = (locale: Locale) => {
  const copy = RECRUITMENT_COPY[locale]
  const path = localePath(locale, RECRUITMENT_BASE_PATH)
  const url = localeUrl(locale, RECRUITMENT_BASE_PATH)

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
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
