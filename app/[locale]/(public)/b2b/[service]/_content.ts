import type { I18nKey } from '@/lib/i18n/types'
import { Building03Icon, Calendar03Icon, GiftIcon, HotelIcon, SparklesIcon } from '@hugeicons/core-free-icons'
import type { B2BServiceSlug } from '../_seo'
import { hasText, type B2BServiceDetail, type ServiceIcon } from './_palette'

// String icon enum (CMS) → Hugeicons component (FE render).
export const SERVICE_ICONS: Record<ServiceIcon, typeof HotelIcon> = {
  hotel: HotelIcon,
  calendar: Calendar03Icon,
  building: Building03Icon,
  gift: GiftIcon,
  sparkles: SparklesIcon
}

// Editorial imagery fallback. CMS documents currently ship without hero/gallery
// images; until they carry their own, fall back to the curated case-study set so
// the hero banner and image split/divider slots keep rendering. CMS-provided
// values always win.
const INDIGO = '/images/b2b/case-studies/indigo'
const ABOUT = '/images/about'

const IMAGE_FALLBACKS: Record<B2BServiceSlug, { heroImage: string; gallery: string[] }> = {
  outsourced: {
    heroImage: `${INDIGO}/01.jpg`,
    gallery: [
      `${INDIGO}/02.jpg`,
      `${INDIGO}/03.jpg`,
      `${INDIGO}/04.jpg`,
      `${INDIGO}/05.jpg`,
      `${ABOUT}/studio-flatlay.png`
    ]
  },
  'events-mice': {
    heroImage: `${INDIGO}/06.jpg`,
    gallery: [`${INDIGO}/07.jpg`, `${INDIGO}/08.jpg`, `${INDIGO}/09.jpg`, `${INDIGO}/10.jpg`]
  },
  'office-subscription': {
    heroImage: `${INDIGO}/12.jpg`,
    gallery: [`${INDIGO}/13.jpg`, `${INDIGO}/14.jpg`, `${INDIGO}/15.jpg`, `${INDIGO}/16.jpg`, `${INDIGO}/17.jpg`]
  },
  'corporate-gifts': {
    heroImage: `${INDIGO}/18.jpg`,
    gallery: [`${INDIGO}/20.jpg`, `${ABOUT}/bg-product-tet.png`, `${ABOUT}/bg-product-womens-day.png`]
  },
  'brand-experience': {
    heroImage: `${ABOUT}/hero-hanoi-wash.png`,
    gallery: [`${INDIGO}/02.jpg`, `${INDIGO}/05.jpg`, `${INDIGO}/08.jpg`, `${INDIGO}/13.jpg`]
  }
}

/** Merge curated fallback imagery onto a parsed detail when the CMS omits it. */
export function withImageFallbacks(detail: B2BServiceDetail): B2BServiceDetail {
  const fallback = IMAGE_FALLBACKS[detail.slug]
  if (!fallback) return detail
  return {
    ...detail,
    heroImage: detail.heroImage || fallback.heroImage,
    gallery: detail.gallery.length > 0 ? detail.gallery : fallback.gallery
  }
}

// Stable DOM anchor ids shared between the main column (section wrappers) and the
// sidebar table-of-contents scroll-spy. The only runtime contract between them.
export const SECTION_IDS = {
  intro: 'overview',
  stats: 'by-the-numbers',
  inclusions: 'whats-included',
  mice: 'mice-flowers',
  schedule: 'schedule',
  personalization: 'personalization',
  benefits: 'benefits',
  process: 'process',
  audience: 'ideal-for',
  faq: 'faq',
  closing: 'closing'
} as const

export type SectionKey = keyof typeof SECTION_IDS

export type ServiceSection = {
  key: SectionKey
  id: string
  tocLabelKey: I18nKey
}

const listHas = (block?: { items: unknown[] }): boolean => (block?.items.length ?? 0) > 0

// Ordered manifest of the sections actually rendered for a service, derived from
// content presence — so the TOC never lists an absent section. A section renders
// iff its block exists and carries content (non-empty items / paragraphs / text).
export function getServiceSections(detail: B2BServiceDetail): ServiceSection[] {
  const order: { key: SectionKey; enabled: boolean }[] = [
    { key: 'intro', enabled: detail.intro.length > 0 },
    { key: 'stats', enabled: listHas(detail.stats) },
    { key: 'inclusions', enabled: listHas(detail.inclusions) },
    { key: 'mice', enabled: Boolean(detail.mice && (hasText(detail.mice.intro) || hasText(detail.mice.body))) },
    { key: 'schedule', enabled: listHas(detail.schedule) },
    { key: 'personalization', enabled: listHas(detail.personalization) },
    { key: 'benefits', enabled: listHas(detail.benefits) },
    { key: 'process', enabled: listHas(detail.process) },
    { key: 'audience', enabled: listHas(detail.audience) },
    { key: 'faq', enabled: listHas(detail.faq) },
    { key: 'closing', enabled: detail.closing.paragraphs.length > 0 }
  ]

  return order
    .filter((s) => s.enabled)
    .map(({ key }) => ({
      key,
      id: SECTION_IDS[key],
      tocLabelKey: `b2b.serviceDetails.common.toc.${key}` as I18nKey
    }))
}

// Ordered gallery access that degrades to null when the service has fewer images
// than the layout wants — lets image splits/dividers cleanly render text-only.
export function galleryImage(detail: B2BServiceDetail, index: number): string | null {
  return detail.gallery[index] ?? null
}
