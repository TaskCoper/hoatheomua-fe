import type { Locale } from '@/lib/i18n/routing'
import { DEFAULT_LOCALE, SITE_URL } from './constants'

/**
 * Locale-prefixed path. Default locale (`vi`) renders without a prefix to
 * match the `localePrefix: 'as-needed'` setting in `lib/i18n/routing.ts`.
 */
export const localePath = (locale: Locale, basePath: string) =>
  locale === DEFAULT_LOCALE ? basePath : `/${locale}${basePath}`

/** Build a fully-qualified site URL from a leading-slash path. */
export const siteUrl = (path: string) => `${SITE_URL}${path}`

/** Locale-prefixed fully-qualified URL for a base path. */
export const localeUrl = (locale: Locale, basePath: string) => siteUrl(localePath(locale, basePath))

/** Fully-qualified URL for an OG image stored under `/public`. */
export const buildOgImageUrl = (path: string) => siteUrl(path)
