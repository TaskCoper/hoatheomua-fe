import { routing, type Locale } from '@/lib/i18n/routing'

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hoatheomua.com'
export const SITE_NAME = 'Hoa Theo Mùa'

export const DEFAULT_OG_IMAGE = '/images/flower.png'
export const DEFAULT_OG_IMAGE_DIMENSIONS = { width: 1200, height: 630 } as const

/** Stable `@id`s referenced by every page's JSON-LD graph. */
export const ORGANIZATION_ID = `${SITE_URL}/#organization`
export const WEBSITE_ID = `${SITE_URL}/#website`
export const BUSINESS_ID = `${SITE_URL}/#business`

export const SUPPORTED_LOCALES = routing.locales
export const DEFAULT_LOCALE = routing.defaultLocale

/**
 * Real-world business facts shared by every JSON-LD graph that describes the
 * shop (home `Florist`, contact `LocalBusiness`, future locations). Editing
 * here updates every page; do NOT redeclare these inline.
 */
export const BUSINESS_LOGO_URL = `${SITE_URL}/images/logo.png`
export const BUSINESS_PRICE_RANGE = '₫₫'
export const BUSINESS_CURRENCIES_ACCEPTED = 'VND'
export const BUSINESS_PAYMENT_ACCEPTED = 'Cash, Bank Transfer, Credit Card'

export const BUSINESS_ADDRESS = {
  '@type': 'PostalAddress',
  streetAddress: 'Số 13A Đào Duy Anh, Phường 9, Quận Phú Nhuận',
  addressLocality: 'Thành phố Hồ Chí Minh',
  addressRegion: 'TP. Hồ Chí Minh',
  addressCountry: 'VN'
} as const

export const BUSINESS_AREA_SERVED = { '@type': 'City', name: 'Ho Chi Minh City' } as const

export const BUSINESS_OPENING_HOURS = [
  {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: '08:00',
    closes: '21:00'
  }
] as const

/**
 * Single source of truth for locale-specific copy that recurs across pages
 * (Open Graph locale code, schema.org `inLanguage`, breadcrumb "Home" label).
 * Add new fields here rather than re-deriving from `locale === 'vi' ? ...` in
 * pages.
 */
const LOCALE_META = {
  vi: { ogLocale: 'vi_VN', inLanguage: 'vi-VN', homeName: 'Trang chủ' },
  en: { ogLocale: 'en_US', inLanguage: 'en-US', homeName: 'Home' }
} as const satisfies Record<Locale, { ogLocale: string; inLanguage: string; homeName: string }>

export const ogLocale = (locale: Locale) => LOCALE_META[locale].ogLocale
export const inLanguage = (locale: Locale) => LOCALE_META[locale].inLanguage
export const homeName = (locale: Locale) => LOCALE_META[locale].homeName
export const alternateOgLocales = (locale: Locale) =>
  SUPPORTED_LOCALES.filter((other) => other !== locale).map(ogLocale)
