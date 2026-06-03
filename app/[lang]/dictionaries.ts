import 'server-only'

import type { Dictionary, Locale } from '@/lib/i18n/types'

const dictionaries = {
  vi: () => import('./dictionaries/vi.json').then((m) => m.default),
  en: () => import('./dictionaries/en.json').then((m) => m.default)
} satisfies Record<Locale, () => Promise<Dictionary>>

export const hasLocale = (locale: string): locale is Locale => locale in dictionaries

export const getDictionary = async (locale: Locale) => dictionaries[locale]()
