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

const ABOUT_BASE_PATH = '/about'

type AboutCopy = SeoCopy & { breadcrumb: string }

const ABOUT_COPY = {
  vi: {
    title: 'Câu Chuyện Của Chúng Tôi',
    description:
      'Hoa Theo Mùa thành lập 12/11/2020 bởi CEO Lê Thị Hoa Đào — thương hiệu hoa tươi cao cấp lấy cảm hứng từ "Hà Nội 12 mùa hoa", mang đến giá trị bình yên qua từng bó hoa 100% tự nhiên.',
    keywords: [
      'về Hoa Theo Mùa',
      'câu chuyện thương hiệu hoa',
      'Lê Thị Hoa Đào',
      'thương hiệu hoa tươi Việt Nam',
      '12 mùa hoa Hà Nội',
      'shop hoa cao cấp',
      'florist Việt Nam'
    ],
    ogAlt: 'Câu chuyện thương hiệu Hoa Theo Mùa',
    breadcrumb: 'Giới thiệu'
  },
  en: {
    title: 'Our Story',
    description:
      'Founded on November 12, 2020 by CEO Lê Thị Hoa Đào, Hoa Theo Mùa is a premium Vietnamese florist inspired by "Hanoi\'s 12 flower seasons", crafting 100% natural bouquets that bring serenity.',
    keywords: [
      'about Hoa Theo Mùa',
      'Vietnamese florist story',
      'Le Thi Hoa Dao',
      'premium florist Vietnam',
      'seasonal flowers brand',
      'Hanoi flower seasons'
    ],
    ogAlt: 'About Hoa Theo Mùa — Our story',
    breadcrumb: 'About'
  }
} satisfies LocaleCopy<AboutCopy>

export const generateAboutMetadata = (locale: Locale): Metadata =>
  buildPageMetadata({ locale, copy: ABOUT_COPY[locale], basePath: ABOUT_BASE_PATH })

export const buildAboutJsonLd = (locale: Locale) => {
  const copy = ABOUT_COPY[locale]
  const path = localePath(locale, ABOUT_BASE_PATH)
  const url = localeUrl(locale, ABOUT_BASE_PATH)

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AboutPage',
        '@id': `${SITE_URL}${path}#webpage`,
        url,
        name: `${copy.title} — ${SITE_NAME}`,
        description: copy.description,
        inLanguage: inLanguage(locale),
        isPartOf: { '@id': WEBSITE_ID },
        about: { '@id': ORGANIZATION_ID },
        primaryImageOfPage: { '@type': 'ImageObject', url: `${SITE_URL}/images/flower.png` }
      },
      {
        '@type': 'Organization',
        '@id': ORGANIZATION_ID,
        name: SITE_NAME,
        legalName: 'CÔNG TY TNHH HOA THEO MÙA',
        url: SITE_URL,
        logo: { '@type': 'ImageObject', url: `${SITE_URL}/images/logo.png` },
        foundingDate: '2020-11-12',
        taxID: '0316581199',
        slogan: 'Hà Nội 12 Mùa Hoa',
        description:
          'Thương hiệu hoa tươi cao cấp tại TP. Hồ Chí Minh — mang đến giá trị cảm xúc, bình yên qua từng bó hoa theo mùa.',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Số 13A Đào Duy Anh, Phường 9, Quận Phú Nhuận',
          addressLocality: 'Thành phố Hồ Chí Minh',
          addressCountry: 'VN'
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+84983024353',
          contactType: 'customer service',
          areaServed: 'VN',
          availableLanguage: ['Vietnamese', 'English']
        },
        founder: {
          '@type': 'Person',
          '@id': `${SITE_URL}${path}#founder`,
          name: 'Lê Thị Hoa Đào',
          jobTitle: 'Nhà sáng lập & CEO',
          worksFor: { '@id': ORGANIZATION_ID }
        }
      },
      buildBreadcrumbList(locale, `${SITE_URL}${path}#breadcrumb`, [{ name: copy.breadcrumb, url }])
    ]
  }
}
