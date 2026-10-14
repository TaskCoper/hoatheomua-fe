import type { CheckoutFallback } from '../types'

// The app-wide toast lasts 2s - too short to read a reason and reach for a button.
const FALLBACK_TOAST_MS = 8000

/** Sonner options that turn a `CheckoutFallback` into a toast action that stays long enough to be used. */
export const fallbackToastOptions = (fallback?: CheckoutFallback) =>
  fallback ? { action: { label: fallback.label, onClick: fallback.run }, duration: FALLBACK_TOAST_MS } : {}
