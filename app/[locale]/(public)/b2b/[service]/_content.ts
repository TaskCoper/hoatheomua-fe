import type { I18nKey } from '@/lib/i18n/types'
import { Building03Icon, Calendar03Icon, GiftIcon, HotelIcon, SparklesIcon } from '@hugeicons/core-free-icons'
import type { B2BServiceSlug } from '../_seo'

export type ServiceAccent = 'primary' | 'leaf'

export type ServiceI18nKey = 'outsourced' | 'eventsMice' | 'officeSubscription' | 'corporateGifts' | 'brandExperience'

export type ServiceDetailConfig = {
  slug: B2BServiceSlug
  i18nKey: ServiceI18nKey
  cardTagKey: string
  cardNameKey: string
  cardDescriptionKey: string
  icon: typeof HotelIcon
  accent: ServiceAccent
  hasProcess: boolean
  hasSchedule: boolean
  hasAudience: boolean
  hasMice: boolean
  hasPersonalization: boolean
  hasStats: boolean
  hasFaq: boolean
  hasHero: boolean
  showPackagesLink: boolean
  // Editorial imagery. `heroImage` drives the hero banner; `gallery` feeds the
  // image/text split + full-width divider slots in reading order. Consumers use
  // `galleryImage(config, index)` and degrade to text-only when the list runs out.
  heroImage: string
  gallery: readonly string[]
  // Canonical blocks (process, audience) rendered with clearly-badged placeholder
  // copy because this service has no real content for them yet.
  placeholderBlocks?: readonly SectionKey[]
}

const INDIGO = '/images/b2b/case-studies/indigo'
const ABOUT = '/images/about'

export const SERVICE_DETAILS: Record<B2BServiceSlug, ServiceDetailConfig> = {
  outsourced: {
    slug: 'outsourced',
    i18nKey: 'outsourced',
    cardTagKey: 'b2b.services.items.outsourced.tag',
    cardNameKey: 'b2b.services.items.outsourced.name',
    cardDescriptionKey: 'b2b.services.items.outsourced.description',
    icon: HotelIcon,
    accent: 'primary',
    hasProcess: false,
    hasSchedule: false,
    hasAudience: false,
    hasMice: false,
    hasPersonalization: false,
    hasStats: false,
    hasFaq: false,
    hasHero: true,
    showPackagesLink: false,
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
    slug: 'events-mice',
    i18nKey: 'eventsMice',
    cardTagKey: 'b2b.services.items.eventsMice.tag',
    cardNameKey: 'b2b.services.items.eventsMice.name',
    cardDescriptionKey: 'b2b.services.items.eventsMice.description',
    icon: Calendar03Icon,
    accent: 'primary',
    hasProcess: false,
    hasSchedule: false,
    hasAudience: false,
    hasMice: true,
    hasPersonalization: false,
    hasStats: false,
    hasFaq: false,
    hasHero: true,
    showPackagesLink: false,
    heroImage: `${INDIGO}/06.jpg`,
    gallery: [`${INDIGO}/07.jpg`, `${INDIGO}/08.jpg`, `${INDIGO}/09.jpg`, `${INDIGO}/10.jpg`]
  },
  'office-subscription': {
    slug: 'office-subscription',
    i18nKey: 'officeSubscription',
    cardTagKey: 'b2b.services.items.officeSubscription.tag',
    cardNameKey: 'b2b.services.items.officeSubscription.name',
    cardDescriptionKey: 'b2b.services.items.officeSubscription.description',
    icon: Building03Icon,
    accent: 'primary',
    hasProcess: true,
    hasSchedule: true,
    hasAudience: true,
    hasMice: false,
    hasPersonalization: false,
    hasStats: false,
    hasFaq: false,
    hasHero: true,
    showPackagesLink: true,
    heroImage: `${INDIGO}/12.jpg`,
    gallery: [`${INDIGO}/13.jpg`, `${INDIGO}/14.jpg`, `${INDIGO}/15.jpg`, `${INDIGO}/16.jpg`, `${INDIGO}/17.jpg`]
  },
  'corporate-gifts': {
    slug: 'corporate-gifts',
    i18nKey: 'corporateGifts',
    cardTagKey: 'b2b.services.items.corporateGifts.tag',
    cardNameKey: 'b2b.services.items.corporateGifts.name',
    cardDescriptionKey: 'b2b.services.items.corporateGifts.description',
    icon: GiftIcon,
    accent: 'primary',
    hasProcess: false,
    hasSchedule: false,
    hasAudience: true,
    hasMice: false,
    hasPersonalization: true,
    hasStats: false,
    hasFaq: false,
    hasHero: true,
    showPackagesLink: false,
    heroImage: `${INDIGO}/18.jpg`,
    gallery: [`${INDIGO}/20.jpg`, `${ABOUT}/bg-product-tet.png`, `${ABOUT}/bg-product-womens-day.png`]
  },
  'brand-experience': {
    slug: 'brand-experience',
    i18nKey: 'brandExperience',
    cardTagKey: 'b2b.services.items.brandExperience.tag',
    cardNameKey: 'b2b.services.items.brandExperience.name',
    cardDescriptionKey: 'b2b.services.items.brandExperience.description',
    icon: SparklesIcon,
    accent: 'leaf',
    hasProcess: true,
    hasSchedule: false,
    hasAudience: true,
    hasMice: false,
    hasPersonalization: false,
    hasStats: false,
    hasFaq: false,
    hasHero: true,
    showPackagesLink: false,
    heroImage: `${ABOUT}/hero-hanoi-wash.png`,
    gallery: [`${INDIGO}/02.jpg`, `${INDIGO}/05.jpg`, `${INDIGO}/08.jpg`, `${INDIGO}/13.jpg`]
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

// Ordered manifest of the sections actually rendered for a service, derived from
// the same flags that gate rendering — so the TOC never lists an absent section.
export function getServiceSections(config: ServiceDetailConfig): ServiceSection[] {
  const order: { key: SectionKey; enabled: boolean }[] = [
    { key: 'intro', enabled: true },
    { key: 'stats', enabled: config.hasStats },
    { key: 'inclusions', enabled: true },
    { key: 'mice', enabled: config.hasMice },
    { key: 'schedule', enabled: config.hasSchedule },
    { key: 'personalization', enabled: config.hasPersonalization },
    { key: 'benefits', enabled: true },
    { key: 'process', enabled: config.hasProcess },
    { key: 'audience', enabled: config.hasAudience },
    { key: 'faq', enabled: config.hasFaq },
    { key: 'closing', enabled: true }
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
export function galleryImage(config: ServiceDetailConfig, index: number): string | null {
  return config.gallery[index] ?? null
}

export { SparklesIcon }
