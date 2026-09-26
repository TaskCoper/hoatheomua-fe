import { SESSION_HINT_COOKIE } from '@/shared/constants'

const listeners = new Set<() => void>()

const notify = () => {
  listeners.forEach((listener) => listener())
}

export const subscribeToSessionHint = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export const readSessionHint = (): boolean => {
  if (typeof document === 'undefined') return false

  return document.cookie.split(';').some((entry) => {
    const [name, ...value] = entry.trim().split('=')
    return name === SESSION_HINT_COOKIE && value.join('=') !== ''
  })
}

export const writeSessionHint = (): void => {
  if (typeof document === 'undefined') return

  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${SESSION_HINT_COOKIE}=1; path=/; SameSite=Lax${secure}`
  notify()
}

export const clearSessionHint = (): void => {
  if (typeof document === 'undefined') return

  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${SESSION_HINT_COOKIE}=; path=/; Max-Age=0; SameSite=Lax${secure}`
  notify()
}
