import type { B2BServiceSlug } from '@/features/b2b/seo'
import { hasText, type B2BServiceDetail } from '@/features/b2b/service/palette'
import type { I18nKey } from '@/lib/i18n/types'
import { Building03Icon, Calendar03Icon, GiftIcon, HotelIcon, SparklesIcon } from '@hugeicons/core-free-icons'

type ServiceAccent = 'primary' | 'leaf'

// Static per-slug presentation metadata (icon + accent). NOT CMS-backed - mirrors
// taskcoper's `SERVICE_META`. Keyed by slug so related-service links render the right
// icon/accent regardless of what the CMS document carries.
export const SERVICE_META: Record<B2BServiceSlug, { icon: typeof HotelIcon; accent: ServiceAccent }> = {
  outsourced: { icon: HotelIcon, accent: 'primary' },
  'events-mice': { icon: Calendar03Icon, accent: 'primary' },
  'office-subscription': { icon: Building03Icon, accent: 'primary' },
  'corporate-gifts': { icon: GiftIcon, accent: 'primary' },
  'brand-experience': { icon: SparklesIcon, accent: 'leaf' }
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
// content presence - so the TOC never lists an absent section. A section renders
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
