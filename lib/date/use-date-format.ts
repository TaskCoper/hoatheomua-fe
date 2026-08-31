import { useLocale } from '@/lib/i18n/dictionary-provider'
import { useMemo } from 'react'
import {
  formatDate as formatDateRaw,
  formatDateTime as formatDateTimeRaw,
  formatRelative as formatRelativeRaw,
  formatTime as formatTimeRaw,
  type FormatInput,
  type RelativeFormatOptions
} from './format'
import { resolveAppLocale } from './locale'
import type { DateFormatPreset } from './presets'

type PresetArg = DateFormatPreset | (string & {})

export const useDateFormat = () => {
  const appLocale = useLocale()
  const locale = resolveAppLocale(appLocale)

  return useMemo(
    () => ({
      locale,
      formatDate: (input: FormatInput, preset?: PresetArg) => formatDateRaw(input, preset, { locale }),
      formatTime: (input: FormatInput, preset?: PresetArg) => formatTimeRaw(input, preset, { locale }),
      formatDateTime: (input: FormatInput, preset?: PresetArg) => formatDateTimeRaw(input, preset, { locale }),
      formatRelative: (input: FormatInput, opts?: Omit<RelativeFormatOptions, 'locale'>) =>
        formatRelativeRaw(input, { ...opts, locale })
    }),
    [locale]
  )
}
