import type { Job } from '@/features/recruitment/types'
import type { Locale } from '@/lib/i18n/routing'
import {
  buildBreadcrumbList,
  buildPageMetadata,
  BUSINESS_LOGO_URL,
  inLanguage,
  ORGANIZATION_ID,
  SITE_NAME,
  SITE_URL,
  WEBSITE_ID,
  type LocaleCopy,
  type SeoCopy
} from '@/shared/seo'
import { localePath, localeUrl } from '@/shared/seo/url'
import { getFirstParagraphTextFromHtml } from '@/shared/utils'
import type { Metadata } from 'next'

const RECRUITMENT_BASE_PATH = '/recruitment'

type RecruitmentCopy = SeoCopy & { breadcrumb: string }

const RECRUITMENT_COPY = {
  vi: {
    title: 'Cơ Hội Nghề Nghiệp Tại Hoa Theo Mùa',
    description:
      'Khám phá các vị trí tuyển dụng tại Hoa Theo Mùa - gia nhập đội ngũ hoa tươi cao cấp tại TP. Hồ Chí Minh, cùng phát triển sự nghiệp và lan toả vẻ đẹp Việt qua từng bó hoa.',
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
      'Explore open positions at Hoa Theo Mùa - join our premium florist team in Ho Chi Minh City and help bring Vietnamese floral artistry to more homes and businesses.',
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

const JOB_POSTING_EMPLOYMENT_TYPE: Record<string, string> = {
  fulltime: 'FULL_TIME',
  parttime: 'PART_TIME',
  internship: 'INTERN',
  freelance: 'CONTRACTOR'
}

const toSchemaEmploymentType = (employmentType: string | null | undefined): string | undefined => {
  if (!employmentType) return undefined

  return JOB_POSTING_EMPLOYMENT_TYPE[
    employmentType
      .trim()
      .toLowerCase()
      .replace(/[\s_-]/g, '')
  ]
}

const jobDetailBasePath = (job: Job) => `${RECRUITMENT_BASE_PATH}/${job.slug}`

export const generateJobDetailMetadata = ({
  locale,
  job,
  notFoundTitle
}: {
  locale: Locale
  job: Job | null
  notFoundTitle: string
}): Metadata => {
  if (!job) {
    return { title: notFoundTitle, robots: { index: false, follow: false } }
  }

  const listCopy = RECRUITMENT_COPY[locale]
  const suffix = locale === 'en' ? `Careers at ${SITE_NAME}` : `Tuyển dụng tại ${SITE_NAME}`
  const description = getFirstParagraphTextFromHtml(job.description ?? '') || listCopy.description

  const copy: SeoCopy = {
    title: `${job.title} - ${suffix}`,
    description,
    keywords: [job.title, ...listCopy.keywords],
    ogAlt: job.title
  }

  return buildPageMetadata({
    locale,
    copy,
    basePath: jobDetailBasePath(job),
    ...(job.coverImageUrl ? { ogImage: { url: job.coverImageUrl, width: 1200, height: 630, alt: job.title } } : {})
  })
}

/**
 * `JobPosting` structured data - what makes a role eligible for Google's job
 * experience (the jobs box at the top of search) instead of a plain blue link.
 *
 * NOTE: `datePosted` and `validThrough` are intentionally absent because the job API
 * doesn't expose posting/expiry dates. Google treats `datePosted` as required, so to
 * be fully eligible the backend needs to add those fields (then spread them in here).
 */
export const buildJobPostingJsonLd = (locale: Locale, job: Job) => {
  const url = localeUrl(locale, jobDetailBasePath(job))
  const listUrl = localeUrl(locale, RECRUITMENT_BASE_PATH)
  const copy = RECRUITMENT_COPY[locale]

  const employmentType = toSchemaEmploymentType(job.employmentType)
  const hasSalary = job.salaryMin > 0 || job.salaryMax > 0
  const description = job.description?.trim() || copy.description

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'JobPosting',
        '@id': `${url}#jobposting`,
        title: job.title,
        description,
        url,
        inLanguage: inLanguage(locale),
        directApply: true,
        ...(employmentType ? { employmentType } : {}),
        ...(job.openings > 0 ? { totalJobOpenings: job.openings } : {}),
        hiringOrganization: {
          '@type': 'Organization',
          name: SITE_NAME,
          sameAs: SITE_URL,
          logo: BUSINESS_LOGO_URL
        },
        jobLocation: {
          '@type': 'Place',
          address: {
            '@type': 'PostalAddress',
            ...(job.location ? { addressLocality: job.location } : {}),
            addressCountry: 'VN'
          }
        },
        ...(hasSalary
          ? {
              baseSalary: {
                '@type': 'MonetaryAmount',
                currency: 'VND',
                value: {
                  '@type': 'QuantitativeValue',
                  ...(job.salaryMin > 0 ? { minValue: job.salaryMin } : {}),
                  ...(job.salaryMax > 0 ? { maxValue: job.salaryMax } : {}),
                  unitText: 'MONTH'
                }
              }
            }
          : {})
      },
      buildBreadcrumbList(locale, `${url}#breadcrumb`, [
        { name: copy.breadcrumb, url: listUrl },
        { name: job.title, url }
      ])
    ]
  }
}

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
