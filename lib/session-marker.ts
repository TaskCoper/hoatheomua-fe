// Non-sensitive client-side marker used purely as a performance hint: skip
// firing `GET /users/me` for visitors who have never signed in on this device.
// The upstream still enforces auth via HttpOnly cookies — this flag cannot
// grant access, only avoid an anonymous 401.

const KEY = 'hthm_has_session'

export const hasSessionMarker = (): boolean => {
  if (typeof window === 'undefined') return true
  try {
    return window.localStorage.getItem(KEY) === '1'
  } catch {
    return true
  }
}

export const setSessionMarker = () => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(KEY, '1')
  } catch {
    // ignore quota / privacy-mode errors
  }
}

export const clearSessionMarker = () => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}
