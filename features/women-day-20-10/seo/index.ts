import type { Locale } from '@/lib/i18n/routing'
import { buildPageMetadata, DEFAULT_OG_IMAGE_DIMENSIONS } from '@/shared/seo'
import type { Metadata } from 'next'

const COPY = {
  vi: {
    title: 'Hoa 20/10 đẹp và tinh tế | Hoa Theo Mùa',
    description: 'Bộ sưu tập hoa tươi 20/10 dành tặng mẹ, người thương, chị em và đồng nghiệp tại TP.HCM.',
    alt: 'Bộ sưu tập hoa 20/10 Hoa Theo Mùa'
  },
  en: {
    title: 'Thoughtful flowers for Vietnamese Women’s Day | Hoa Theo Mùa',
    description: 'A seasonal flower collection for mother, someone special, sisters and colleagues in Ho Chi Minh City.',
    alt: 'Hoa Theo Mùa Vietnamese Women’s Day flower collection'
  }
} as const

export function generateWomenDayMetadata(locale: Locale): Metadata {
  const copy = COPY[locale]
  return buildPageMetadata({
    locale,
    copy: { title: copy.title, description: copy.description, keywords: ['hoa 20/10', 'hoa tặng mẹ', 'hoa tặng người yêu'] },
    basePath: '/women-day-20-10',
    ogImage: { url: '/images/about/bg-product-womens-day.png', ...DEFAULT_OG_IMAGE_DIMENSIONS, alt: copy.alt },
    extras: { title: { absolute: copy.title }, category: 'shopping' }
  })
}
