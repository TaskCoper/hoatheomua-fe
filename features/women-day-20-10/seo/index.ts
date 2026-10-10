import type { ProductDetail } from '@/features/products/types'
import { WOMEN_DAY_PATH } from '@/features/women-day-20-10/constants'
import type { Locale } from '@/lib/i18n/routing'
import {
  buildBreadcrumbList,
  buildOgImageUrl,
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

type WomenDayCopy = SeoCopy & { ogAlt: string; breadcrumb: string }

const WOMEN_DAY_COPY = {
  vi: {
    title: 'Hoa 20 10: 50+ Mẫu Hoa Tươi Đẹp, Ý Nghĩa Và Dễ Chọn',
    description: 'Hoa 20 10 đẹp và ý nghĩa, hoa tươi 20/10 dành tặng mẹ, vợ, người yêu, bạn bè... Đặt hoa 20-10 TPHCM online ưu đãi ngập tràn tại Hoa Theo Mùa!',
    keywords: ['hoa 20/10', 'hoa tặng mẹ', 'hoa tặng người yêu'],
    ogAlt: 'Bộ sưu tập hoa 20/10 Hoa Theo Mùa',
    breadcrumb: 'Hoa 20/10'
  },
  en: {
    title: 'Thoughtful flowers for Vietnamese Women’s Day',
    description: 'A seasonal flower collection for mother, someone special, sisters and colleagues in Ho Chi Minh City.',
    keywords: ['Vietnamese Women’s Day flowers', '20/10 flowers', 'flowers for mom', 'flower delivery HCMC'],
    ogAlt: 'Hoa Theo Mùa Vietnamese Women’s Day flower collection',
    breadcrumb: 'Women’s Day 20/10'
  }
} satisfies LocaleCopy<WomenDayCopy>

const WOMEN_DAY_OG_IMAGE_PATH = '/images/women-day-og.jpg'
const WOMEN_DAY_OG_IMAGE_SIZE = { width: 1200, height: 630 } as const

export const generateWomenDayMetadata = (locale: Locale): Metadata => {
  const copy = WOMEN_DAY_COPY[locale]
  return buildPageMetadata({ locale, copy, basePath: WOMEN_DAY_PATH, ogImage: { url: WOMEN_DAY_OG_IMAGE_PATH, ...WOMEN_DAY_OG_IMAGE_SIZE, alt: copy.ogAlt }, extras: { category: 'shopping' } })
}

export const buildWomenDayJsonLd = (locale: Locale, items: ProductDetail[]) => {
  const copy = WOMEN_DAY_COPY[locale]
  const path = localePath(locale, WOMEN_DAY_PATH)
  const url = localeUrl(locale, WOMEN_DAY_PATH)
  void items

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
        about: { '@id': ORGANIZATION_ID },
        primaryImageOfPage: { '@type': 'ImageObject', url: buildOgImageUrl(WOMEN_DAY_OG_IMAGE_PATH) }
      },
      buildBreadcrumbList(locale, `${SITE_URL}${path}#breadcrumb`, [{ name: copy.breadcrumb, url }])
    ]
  }
}
