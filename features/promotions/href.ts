import { SITE_HOSTS } from '@/features/promotions/constants'

/** Security gate for an admin-controlled href string. `''` is safe (no link). */
export const isSafeHref = (href: string): boolean => {
  const value = href.trim()
  if (!value) return true

  // Protocol-relative and backslash-variant URLs both hand the host over to the config.
  if (/^[/\\]{2}/.test(value)) return false
  if (value.startsWith('/')) return true

  try {
    // Also catches javascript:, data:, vbscript:, and whitespace-injection variants.
    return ['http:', 'https:'].includes(new URL(value).protocol)
  } catch {
    return false
  }
}

/** Strips the locale so next-intl's `<Link>` doesn't double-prefix it (`/en/en/...`). */
export const stripLocalePrefix = (path: string) => path.replace(/^\/(?:vi|en)(?=\/|$)/, '') || '/'

export type PromoHrefTarget = { kind: 'none' } | { kind: 'internal'; path: string } | { kind: 'external'; url: string }

const bareHost = (hostname: string) => hostname.toLowerCase().replace(/^www\./, '')

/**
 * Classifies a campaign destination. The CMS stores absolute same-origin URLs,
 * so treating every absolute URL as external would hard-reload the site and drop
 * EN visitors onto the unprefixed (vi) path. `SITE_HOSTS` covers localhost/preview,
 * where `window.location`'s host never matches production.
 */
export const resolvePromoHref = (rawHref: string, hostname: string | null): PromoHrefTarget => {
  const href = rawHref.trim()
  if (!href || !isSafeHref(href)) return { kind: 'none' }
  if (href.startsWith('/')) return { kind: 'internal', path: stripLocalePrefix(href) }

  let url: URL

  try {
    url = new URL(href)
  } catch {
    return { kind: 'none' }
  }

  const host = bareHost(url.hostname)
  const isOwnSite = (hostname !== null && host === bareHost(hostname)) || SITE_HOSTS.includes(host)

  if (isOwnSite) {
    return { kind: 'internal', path: stripLocalePrefix(`${url.pathname}${url.search}${url.hash}`) }
  }

  return { kind: 'external', url: url.toString() }
}
