import type { Locale } from '@/lib/i18n/routing'

export type SeoCopy = {
  title: string
  description: string
  keywords: readonly string[]
  ogAlt?: string
}

export type LocaleCopy<T> = Record<Locale, T>

export type OgImage = {
  url: string
  width?: number
  height?: number
  alt: string
}
