import type { Locale } from '@/lib/i18n/routing'
import type { LocalizedText } from '@/types/config.type'
import type { B2BServiceSlug } from '../_seo'

// ---------------------------------------------------------------------------
// Runtime shape of a `b2bServices.<slug>` CMS document (value.value is a JSON
// string). Mirrors the taskcoper `b2b-service-detail-palette.ts` seed shape.
// Keep this file free of `server-only` — client section components import the
// types + `pick()` from here.
// ---------------------------------------------------------------------------

export type ServiceAccent = 'primary' | 'leaf'
export type ServiceIcon = 'hotel' | 'calendar' | 'building' | 'gift' | 'sparkles'

const emptyLocalizedText = (): LocalizedText => ({ vi: '', en: '' })

const parseLocalizedText = (raw: unknown): LocalizedText => {
  const obj = raw as Partial<LocalizedText> | undefined
  return {
    vi: typeof obj?.vi === 'string' ? obj.vi : '',
    en: typeof obj?.en === 'string' ? obj.en : ''
  }
}

const safeJsonParse = (raw: string): unknown => {
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/** Locale-index a LocalizedText, falling back to Vietnamese then empty string. */
export const pick = (text: LocalizedText | undefined, locale: Locale): string => text?.[locale] || text?.vi || ''

/** A localized text is "present" when either locale carries copy. */
export const hasText = (text: LocalizedText | undefined): boolean => Boolean(text && (text.vi || text.en))

// ---- item shapes ----------------------------------------------------------
export interface RichItem {
  title: LocalizedText
  description: LocalizedText
}
const parseRichItem = (raw: Partial<RichItem> | undefined): RichItem => ({
  title: parseLocalizedText(raw?.title),
  description: parseLocalizedText(raw?.description)
})

export interface StatItem {
  value: LocalizedText
  label: LocalizedText
  caption: LocalizedText
}
const parseStatItem = (raw: Partial<StatItem> | undefined): StatItem => ({
  value: parseLocalizedText(raw?.value),
  label: parseLocalizedText(raw?.label),
  caption: parseLocalizedText(raw?.caption)
})

export interface FaqItem {
  question: LocalizedText
  answer: LocalizedText
  hasZalo: boolean
}
const parseFaqItem = (raw: Partial<FaqItem> | undefined): FaqItem => ({
  question: parseLocalizedText(raw?.question),
  answer: parseLocalizedText(raw?.answer),
  hasZalo: Boolean(raw?.hasZalo)
})

// ---- section blocks -------------------------------------------------------
// A section renders iff its block is present AND (for list blocks) items.length > 0.
export interface ListBlock {
  heading: LocalizedText
  subIntro: LocalizedText
  items: RichItem[]
  closing: LocalizedText
}
const parseListBlock = (raw: Partial<ListBlock> | undefined): ListBlock => ({
  heading: parseLocalizedText(raw?.heading),
  subIntro: parseLocalizedText(raw?.subIntro),
  items: Array.isArray(raw?.items) ? raw!.items.map(parseRichItem) : [],
  closing: parseLocalizedText(raw?.closing)
})

export interface BenefitsBlock {
  heading: LocalizedText
  items: RichItem[]
}
const parseBenefitsBlock = (raw: Partial<BenefitsBlock> | undefined): BenefitsBlock => ({
  heading: parseLocalizedText(raw?.heading),
  items: Array.isArray(raw?.items) ? raw!.items.map(parseRichItem) : []
})

export interface StatsBlock {
  heading: LocalizedText
  items: StatItem[]
}
const parseStatsBlock = (raw: Partial<StatsBlock> | undefined): StatsBlock => ({
  heading: parseLocalizedText(raw?.heading),
  items: Array.isArray(raw?.items) ? raw!.items.map(parseStatItem) : []
})

export interface MiceBlock {
  heading: LocalizedText
  intro: LocalizedText
  body: LocalizedText
}
const parseMiceBlock = (raw: Partial<MiceBlock> | undefined): MiceBlock => ({
  heading: parseLocalizedText(raw?.heading),
  intro: parseLocalizedText(raw?.intro),
  body: parseLocalizedText(raw?.body)
})

export interface FaqBlock {
  heading: LocalizedText
  items: FaqItem[]
}
const parseFaqBlock = (raw: Partial<FaqBlock> | undefined): FaqBlock => ({
  heading: parseLocalizedText(raw?.heading),
  items: Array.isArray(raw?.items) ? raw!.items.map(parseFaqItem) : []
})

export interface ClosingBlock {
  heading: LocalizedText
  paragraphs: LocalizedText[]
}
const parseClosingBlock = (raw: Partial<ClosingBlock> | undefined): ClosingBlock => ({
  heading: parseLocalizedText(raw?.heading),
  paragraphs: Array.isArray(raw?.paragraphs) ? raw!.paragraphs.map(parseLocalizedText) : []
})

// personalization has an extra `intro` on top of a ListBlock
export interface PersonalizationBlock extends ListBlock {
  intro: LocalizedText
}
const parsePersonalizationBlock = (raw: Partial<PersonalizationBlock> | undefined): PersonalizationBlock => ({
  ...parseListBlock(raw),
  intro: parseLocalizedText(raw?.intro)
})

// ---- the service document -------------------------------------------------
export interface ServiceCard {
  tag: LocalizedText
  name: LocalizedText
  description: LocalizedText
}

export interface ServiceSeo {
  metaTitle: LocalizedText
  metaDescription: LocalizedText
  keywords: LocalizedText // comma-separated per locale
  ogAlt: LocalizedText
  breadcrumb: LocalizedText
  serviceType: string // schema.org serviceType — locale-neutral
}

export interface B2BServiceDetail {
  slug: B2BServiceSlug
  enabled: boolean
  accent: ServiceAccent
  icon: ServiceIcon
  showPackagesLink: boolean

  heroImage: string
  gallery: string[]

  card: ServiceCard
  lede: LocalizedText

  seo: ServiceSeo

  // sections (absent = not rendered)
  intro: LocalizedText[]
  inclusions?: ListBlock
  stats?: StatsBlock
  mice?: MiceBlock
  schedule?: ListBlock
  personalization?: PersonalizationBlock
  benefits?: BenefitsBlock
  process?: ListBlock
  audience?: ListBlock
  faq?: FaqBlock
  closing: ClosingBlock
}

const ICON_VALUES: readonly ServiceIcon[] = ['hotel', 'calendar', 'building', 'gift', 'sparkles']

export const defaultB2BServiceDetail = (slug: B2BServiceSlug): B2BServiceDetail => ({
  slug,
  enabled: true,
  accent: 'primary',
  icon: 'sparkles',
  showPackagesLink: false,
  heroImage: '',
  gallery: [],
  card: { tag: emptyLocalizedText(), name: emptyLocalizedText(), description: emptyLocalizedText() },
  lede: emptyLocalizedText(),
  seo: {
    metaTitle: emptyLocalizedText(),
    metaDescription: emptyLocalizedText(),
    keywords: emptyLocalizedText(),
    ogAlt: emptyLocalizedText(),
    breadcrumb: emptyLocalizedText(),
    serviceType: ''
  },
  intro: [],
  closing: { heading: emptyLocalizedText(), paragraphs: [] }
})

const opt = <T>(v: T | undefined, parse: (x: T | undefined) => T): T | undefined =>
  v === undefined || v === null ? undefined : parse(v)

/** Parse a CMS `value.value` payload (JSON string or already-parsed object). */
export const parseB2BServiceDetail = (raw: unknown): B2BServiceDetail => {
  const obj = (typeof raw === 'string' ? safeJsonParse(raw) : raw) as Partial<B2BServiceDetail> | null
  const slug = (obj?.slug ?? 'outsourced') as B2BServiceSlug
  const base = defaultB2BServiceDetail(slug)
  if (!obj || typeof obj !== 'object') return base

  return {
    ...base,
    slug,
    enabled: obj.enabled ?? true,
    accent: obj.accent === 'leaf' ? 'leaf' : 'primary',
    icon: ICON_VALUES.includes(obj.icon as ServiceIcon) ? (obj.icon as ServiceIcon) : base.icon,
    showPackagesLink: Boolean(obj.showPackagesLink),
    heroImage: typeof obj.heroImage === 'string' ? obj.heroImage : '',
    gallery: Array.isArray(obj.gallery) ? obj.gallery.map(String) : [],
    card: {
      tag: parseLocalizedText(obj.card?.tag),
      name: parseLocalizedText(obj.card?.name),
      description: parseLocalizedText(obj.card?.description)
    },
    lede: parseLocalizedText(obj.lede),
    seo: {
      metaTitle: parseLocalizedText(obj.seo?.metaTitle),
      metaDescription: parseLocalizedText(obj.seo?.metaDescription),
      keywords: parseLocalizedText(obj.seo?.keywords),
      ogAlt: parseLocalizedText(obj.seo?.ogAlt),
      breadcrumb: parseLocalizedText(obj.seo?.breadcrumb),
      serviceType: typeof obj.seo?.serviceType === 'string' ? obj.seo.serviceType : ''
    },
    intro: Array.isArray(obj.intro) ? obj.intro.map(parseLocalizedText) : [],
    inclusions: opt(obj.inclusions, parseListBlock),
    stats: opt(obj.stats, parseStatsBlock),
    mice: opt(obj.mice, parseMiceBlock),
    schedule: opt(obj.schedule, parseListBlock),
    personalization: opt(obj.personalization, parsePersonalizationBlock),
    benefits: opt(obj.benefits, parseBenefitsBlock),
    process: opt(obj.process, parseListBlock),
    audience: opt(obj.audience, parseListBlock),
    faq: opt(obj.faq, parseFaqBlock),
    closing: parseClosingBlock(obj.closing)
  }
}
