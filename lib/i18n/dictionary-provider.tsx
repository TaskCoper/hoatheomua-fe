'use client'

import type { I18nKey, Locale } from '@/lib/i18n/types'
import { useLocale as useNextIntlLocale, useTranslations } from 'next-intl'
import * as React from 'react'

export type TranslationValue = string | number | boolean | Date | null | undefined
export type TranslationOptions = Record<string, TranslationValue>
export type TranslationFunction = (key: I18nKey, options?: TranslationOptions) => string

export function DictionaryProvider({ children }: React.PropsWithChildren) {
  return children
}

export function useLocale() {
  return useNextIntlLocale() as Locale
}

export function useTranslation() {
  const rawT = useTranslations()
  const locale = useLocale()

  const t = React.useCallback<TranslationFunction>(
    (key, options) => rawT(key, options as Record<string, string | number | Date> | undefined),
    [rawT]
  )

  return React.useMemo(() => ({ t, locale }), [t, locale])
}
