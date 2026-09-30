import { AUTH_MODAL_PATHS } from '@/features/promotions/constants'

/**
 * Route scoping for the promotional popup. Not a glob library - patterns are
 * typed by a marketing admin into a JSON textarea, so the language is three
 * rules wide:
 *
 *   '/'            exactly the home page
 *   '/b2b'         exactly that page, nothing under it
 *   '/b2b/*'       everything under that page, not the page itself
 *   '*'            every public page
 *   '!/products/*' exclude - wins over every positive match
 *
 * Matching is on the locale-less path, so one rule covers `/b2b` and `/en/b2b`.
 */

/** `'/products/'` and `'products'` both mean `'/products'`; `''` stays `''`. */
const normalize = (path: string): string => {
  const trimmed = path.trim()
  if (!trimmed) return ''

  const rooted = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  const withoutTrailing = rooted.replace(/\/+$/, '')

  return withoutTrailing || '/'
}

const matchesPattern = (pattern: string, path: string): boolean => {
  if (pattern === '*') return true

  if (pattern.endsWith('/*')) {
    const base = normalize(pattern.slice(0, -2))
    // `'/*'` alone means "all".
    if (base === '' || base === '/') return true

    // Strict descendants only: `/products` itself doesn't match `/products/*`.
    return path.startsWith(`${base}/`)
  }

  return normalize(pattern) === path
}

/** True when `path` is in scope. Exclusions are evaluated first and always win. */
export const matchesPages = (patterns: readonly string[], path: string): boolean => {
  const target = normalize(path) || '/'

  const includes: string[] = []
  const excludes: string[] = []

  for (const raw of patterns) {
    const value = typeof raw === 'string' ? raw.trim() : ''
    if (!value) continue

    if (value.startsWith('!')) {
      const negated = value.slice(1).trim()
      if (negated) excludes.push(negated)
      continue
    }

    includes.push(value)
  }

  if (excludes.some((pattern) => matchesPattern(pattern, target))) return false
  if (includes.length === 0) return true

  return includes.some((pattern) => matchesPattern(pattern, target))
}

export const isAuthModalPath = (path: string): boolean => {
  const target = normalize(path) || '/'

  return AUTH_MODAL_PATHS.some((base) => target === base || target.startsWith(`${base}/`))
}
