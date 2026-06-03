'use client'

import type { Dictionary, I18nKey, Locale } from '@/lib/i18n/types'
import * as React from 'react'

export type TranslationValue = string | number | boolean | null | undefined
export type TranslationOptions = Record<string, TranslationValue>
export type TranslationFunction = (key: I18nKey, options?: TranslationOptions) => string

type DictionaryContextValue = {
  dictionary: Dictionary
  locale: Locale
}

const DictionaryContext = React.createContext<DictionaryContextValue>({
  dictionary: {},
  locale: 'vi'
})

function resolveMessage(dictionary: Dictionary, key: string): string | undefined {
  const value = key.split('.').reduce<unknown>((current, part) => {
    if (current && typeof current === 'object' && part in current) {
      return (current as Record<string, unknown>)[part]
    }
    return undefined
  }, dictionary)

  return typeof value === 'string' ? value : undefined
}

function interpolate(message: string, options?: TranslationOptions) {
  if (!options) return message

  return message.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
    const value = options[key]
    return value == null ? match : String(value)
  })
}

export function DictionaryProvider({
  children,
  dictionary,
  locale
}: React.PropsWithChildren<DictionaryContextValue>) {
  const value = React.useMemo(() => ({ dictionary, locale }), [dictionary, locale])
  return <DictionaryContext.Provider value={value}>{children}</DictionaryContext.Provider>
}

export function useLocale() {
  return React.useContext(DictionaryContext).locale
}

export function useTranslation() {
  const { dictionary, locale } = React.useContext(DictionaryContext)

  const t = React.useCallback<TranslationFunction>(
    (key, options) => interpolate(resolveMessage(dictionary, key) ?? key, options),
    [dictionary]
  )

  return React.useMemo(() => ({ t, locale }), [t, locale])
}
