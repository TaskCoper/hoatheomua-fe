export const SESSION_MARKER_COOKIE = 'hasSession'

const MARKER_REGEX = /(?:^|;\s*)hasSession=1(?:;|$)/

export function hasSessionCookieClient(): boolean {
  if (typeof document === 'undefined') return false
  return MARKER_REGEX.test(document.cookie)
}
