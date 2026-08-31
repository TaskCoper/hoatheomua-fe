import { hasText, pick } from '@/features/b2b/service/palette'
import type { LocalizedText } from '@/types/config.type'

// ---------------------------------------------------------------------------
// Runtime shape of the `b2bServices.overview` CMS document (value.value is a
// JSON string). Mirrors the taskcoper `b2b-overview-palette.ts` seed shape and
// the FE service-detail palette discipline: every localized leaf is a
// `LocalizedText`, every block defaults defensively, array element `id`s are
// preserved so the FE can map them back to icons / logo srcs / package slugs.
//
// Non-text (icons, accent, image src, package slug, gradients, animation,
// section order) stays in the section components - the CMS carries strings only.
// ---------------------------------------------------------------------------

export { hasText, pick }
export type { LocalizedText }

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

const asArray = (raw: unknown): unknown[] => (Array.isArray(raw) ? raw : [])
const asString = (raw: unknown): string => (typeof raw === 'string' ? raw : '')
const asRecord = (raw: unknown): Record<string, unknown> =>
  raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}

// ---- hero -----------------------------------------------------------------
export interface OverviewHero {
  eyebrow: LocalizedText
  title: LocalizedText
  subtitle: LocalizedText
  audienceLine: LocalizedText
  primaryCta: LocalizedText
  secondaryCta: LocalizedText
  imageAlt: LocalizedText
  image: string // CMS hero image src; section falls back to the code-owned default
}
const parseHero = (raw: unknown): OverviewHero => {
  const o = asRecord(raw)
  return {
    eyebrow: parseLocalizedText(o.eyebrow),
    title: parseLocalizedText(o.title),
    subtitle: parseLocalizedText(o.subtitle),
    audienceLine: parseLocalizedText(o.audienceLine),
    primaryCta: parseLocalizedText(o.primaryCta),
    secondaryCta: parseLocalizedText(o.secondaryCta),
    imageAlt: parseLocalizedText(o.imageAlt),
    image: asString(o.image)
  }
}

// ---- trust bar ------------------------------------------------------------
export interface StatItem {
  id: string
  value: LocalizedText
  label: LocalizedText
}
export interface LogoItem {
  id: string
  name: LocalizedText
  image: string
}
export interface LogoGroup {
  id: string
  label: LocalizedText
  items: LogoItem[]
}
export interface OverviewTrustBar {
  eyebrow: LocalizedText
  stats: StatItem[]
  logos: { ariaLabel: LocalizedText; groups: LogoGroup[] }
}
const parseStatItem = (raw: unknown): StatItem => {
  const o = asRecord(raw)
  return { id: asString(o.id), value: parseLocalizedText(o.value), label: parseLocalizedText(o.label) }
}
const parseLogoItem = (raw: unknown): LogoItem => {
  const o = asRecord(raw)
  return { id: asString(o.id), name: parseLocalizedText(o.name), image: asString(o.image) }
}
const parseLogoGroup = (raw: unknown): LogoGroup => {
  const o = asRecord(raw)
  return { id: asString(o.id), label: parseLocalizedText(o.label), items: asArray(o.items).map(parseLogoItem) }
}
const parseTrustBar = (raw: unknown): OverviewTrustBar => {
  const o = asRecord(raw)
  const logos = asRecord(o.logos)
  return {
    eyebrow: parseLocalizedText(o.eyebrow),
    stats: asArray(o.stats).map(parseStatItem),
    logos: { ariaLabel: parseLocalizedText(logos.ariaLabel), groups: asArray(logos.groups).map(parseLogoGroup) }
  }
}

// ---- services chrome ------------------------------------------------------
// The 5 cards come from the per-service `card` docs - not stored here.
export interface OverviewServices {
  title: LocalizedText
  description: LocalizedText
  explore: LocalizedText
  viewPackages: LocalizedText
}
const parseServices = (raw: unknown): OverviewServices => {
  const o = asRecord(raw)
  return {
    title: parseLocalizedText(o.title),
    description: parseLocalizedText(o.description),
    explore: parseLocalizedText(o.explore),
    viewPackages: parseLocalizedText(o.viewPackages)
  }
}

// ---- case studies ---------------------------------------------------------
export interface IndigoCase {
  logo: string
  logoAlt: LocalizedText
  badge: LocalizedText
  summary: LocalizedText
  quote: LocalizedText
  quoteAuthor: LocalizedText
  quoteRole: LocalizedText
  photos: string[] // gallery image srcs (dimensions resolved in the section)
}
export interface PartnerItem {
  id: string
  logo: string
  name: LocalizedText
  role: LocalizedText
  summary: LocalizedText
  logoAlt: LocalizedText
}
export interface OverviewCaseStudies {
  title: LocalizedText
  description: LocalizedText
  indigo: IndigoCase
  partners: { title: LocalizedText; description: LocalizedText; items: PartnerItem[] }
}
const parseIndigo = (raw: unknown): IndigoCase => {
  const o = asRecord(raw)
  return {
    logo: asString(o.logo),
    logoAlt: parseLocalizedText(o.logoAlt),
    badge: parseLocalizedText(o.badge),
    summary: parseLocalizedText(o.summary),
    quote: parseLocalizedText(o.quote),
    quoteAuthor: parseLocalizedText(o.quoteAuthor),
    quoteRole: parseLocalizedText(o.quoteRole),
    photos: asArray(o.photos).filter((p): p is string => typeof p === 'string')
  }
}
const parsePartnerItem = (raw: unknown): PartnerItem => {
  const o = asRecord(raw)
  return {
    id: asString(o.id),
    logo: asString(o.logo),
    name: parseLocalizedText(o.name),
    role: parseLocalizedText(o.role),
    summary: parseLocalizedText(o.summary),
    logoAlt: parseLocalizedText(o.logoAlt)
  }
}
const parseCaseStudies = (raw: unknown): OverviewCaseStudies => {
  const o = asRecord(raw)
  const partners = asRecord(o.partners)
  // The CMS stores the featured case under `items` (keyed by id); the section
  // renders a single Indigo case, so resolve it by id with an array fallback.
  const items = asArray(o.items)
  const indigo = items.find((item) => asRecord(item).id === 'indigo') ?? items[0]
  return {
    title: parseLocalizedText(o.title),
    description: parseLocalizedText(o.description),
    indigo: parseIndigo(indigo),
    partners: {
      title: parseLocalizedText(partners.title),
      description: parseLocalizedText(partners.description),
      items: asArray(partners.items).map(parsePartnerItem)
    }
  }
}

// ---- packages -------------------------------------------------------------
export interface PackageItem {
  id: string // nhuY | locPhat | thinhVuong (slug/icon resolved in code)
  name: LocalizedText
  target: LocalizedText
  price: LocalizedText
  features: {
    pots: LocalizedText
    area: LocalizedText
    potSize: LocalizedText
    locations: LocalizedText
    care: LocalizedText
  }
}
export interface OverviewPackages {
  title: LocalizedText
  description: LocalizedText
  popular: LocalizedText
  fromLabel: LocalizedText
  cta: LocalizedText
  quarterlySuffix: LocalizedText
  items: PackageItem[]
}
// The CMS stores `features` as a positional array (pots, area, potSize,
// locations, care) - map it back onto the named keys the section renders.
const parsePackageItem = (raw: unknown): PackageItem => {
  const o = asRecord(raw)
  const f = asArray(o.features)
  return {
    id: asString(o.id),
    name: parseLocalizedText(o.name),
    target: parseLocalizedText(o.target),
    price: parseLocalizedText(o.price),
    features: {
      pots: parseLocalizedText(f[0]),
      area: parseLocalizedText(f[1]),
      potSize: parseLocalizedText(f[2]),
      locations: parseLocalizedText(f[3]),
      care: parseLocalizedText(f[4])
    }
  }
}
const parsePackages = (raw: unknown): OverviewPackages => {
  const o = asRecord(raw)
  return {
    title: parseLocalizedText(o.title),
    description: parseLocalizedText(o.description),
    popular: parseLocalizedText(o.popular),
    fromLabel: parseLocalizedText(o.fromLabel),
    cta: parseLocalizedText(o.cta),
    quarterlySuffix: parseLocalizedText(o.quarterlySuffix),
    items: asArray(o.items).map(parsePackageItem)
  }
}

// ---- advantages / process -------------------------------------------------
export interface AdvantageItem {
  id: string
  title: LocalizedText
  description: LocalizedText
}
export interface OverviewAdvantages {
  eyebrow: LocalizedText
  title: LocalizedText
  description: LocalizedText
  items: AdvantageItem[]
}
const parseAdvantageItem = (raw: unknown): AdvantageItem => {
  const o = asRecord(raw)
  return { id: asString(o.id), title: parseLocalizedText(o.title), description: parseLocalizedText(o.description) }
}
const parseAdvantages = (raw: unknown): OverviewAdvantages => {
  const o = asRecord(raw)
  return {
    eyebrow: parseLocalizedText(o.eyebrow),
    title: parseLocalizedText(o.title),
    description: parseLocalizedText(o.description),
    items: asArray(o.items).map(parseAdvantageItem)
  }
}
export interface ProcessStep {
  id: string
  label: LocalizedText
  title: LocalizedText
  description: LocalizedText
}
export interface OverviewProcess {
  eyebrow: LocalizedText
  title: LocalizedText
  description: LocalizedText
  steps: ProcessStep[]
}
const parseProcessStep = (raw: unknown): ProcessStep => {
  const o = asRecord(raw)
  return {
    id: asString(o.id),
    label: parseLocalizedText(o.label),
    title: parseLocalizedText(o.title),
    description: parseLocalizedText(o.description)
  }
}
const parseProcess = (raw: unknown): OverviewProcess => {
  const o = asRecord(raw)
  return {
    eyebrow: parseLocalizedText(o.eyebrow),
    title: parseLocalizedText(o.title),
    description: parseLocalizedText(o.description),
    steps: asArray(o.steps).map(parseProcessStep)
  }
}

// ---- faq / cta ------------------------------------------------------------
export interface OverviewFaqItem {
  id: string
  question: LocalizedText
  answer: LocalizedText
  hasZalo: boolean
}
export interface OverviewFaq {
  title: LocalizedText
  description: LocalizedText
  items: OverviewFaqItem[]
}
const parseFaqItem = (raw: unknown): OverviewFaqItem => {
  const o = asRecord(raw)
  return {
    id: asString(o.id),
    question: parseLocalizedText(o.question),
    answer: parseLocalizedText(o.answer),
    hasZalo: Boolean(o.hasZalo)
  }
}
const parseFaq = (raw: unknown): OverviewFaq => {
  const o = asRecord(raw)
  return {
    title: parseLocalizedText(o.title),
    description: parseLocalizedText(o.description),
    items: asArray(o.items).map(parseFaqItem)
  }
}
export interface OverviewCta {
  eyebrow: LocalizedText
  subEyebrow: LocalizedText
  title: LocalizedText
  description: LocalizedText
  callLabel: LocalizedText
  emailLabel: LocalizedText
  primary: LocalizedText
  secondary: LocalizedText
}
const parseCta = (raw: unknown): OverviewCta => {
  const o = asRecord(raw)
  return {
    eyebrow: parseLocalizedText(o.eyebrow),
    subEyebrow: parseLocalizedText(o.subEyebrow),
    title: parseLocalizedText(o.title),
    description: parseLocalizedText(o.description),
    callLabel: parseLocalizedText(o.callLabel),
    emailLabel: parseLocalizedText(o.emailLabel),
    primary: parseLocalizedText(o.primary),
    secondary: parseLocalizedText(o.secondary)
  }
}

// ---- the overview document ------------------------------------------------
export interface B2BOverview {
  hero: OverviewHero
  trustBar: OverviewTrustBar
  services: OverviewServices
  caseStudies: OverviewCaseStudies
  packages: OverviewPackages
  advantages: OverviewAdvantages
  process: OverviewProcess
  faq: OverviewFaq
  cta: OverviewCta
}

export const defaultB2BOverview = (): B2BOverview => ({
  hero: parseHero(undefined),
  trustBar: parseTrustBar(undefined),
  services: parseServices(undefined),
  caseStudies: parseCaseStudies(undefined),
  packages: parsePackages(undefined),
  advantages: parseAdvantages(undefined),
  process: parseProcess(undefined),
  faq: parseFaq(undefined),
  cta: parseCta(undefined)
})

/** Parse a CMS `value.value` payload (JSON string or already-parsed object). */
export const parseB2BOverview = (raw: unknown): B2BOverview => {
  const obj = typeof raw === 'string' ? safeJsonParse(raw) : raw
  if (!obj || typeof obj !== 'object') return defaultB2BOverview()
  const o = obj as Record<string, unknown>
  return {
    hero: parseHero(o.hero),
    trustBar: parseTrustBar(o.trustBar),
    services: parseServices(o.services),
    caseStudies: parseCaseStudies(o.caseStudies),
    packages: parsePackages(o.packages),
    advantages: parseAdvantages(o.advantages),
    process: parseProcess(o.process),
    faq: parseFaq(o.faq),
    cta: parseCta(o.cta)
  }
}
