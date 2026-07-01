import type { TranslationFunction } from '@/lib/i18n/dictionary-provider'
import type { Locale } from '@/lib/i18n/types'

import type { Job } from './types'

type EmploymentTypeTranslationKey = Parameters<TranslationFunction>[0]

const employmentTypeTranslationKeyByValue: Record<string, EmploymentTypeTranslationKey> = {
  fulltime: 'recruitment.sidebar.groups.jobType.fullTime',
  parttime: 'recruitment.sidebar.groups.jobType.partTime',
  internship: 'recruitment.sidebar.groups.jobType.internship',
  freelance: 'recruitment.sidebar.groups.jobType.freelance'
}

const hasValidSalaryValue = (value: number) => Number.isFinite(value) && value > 0

const compactCurrencyUnits = [
  { value: 1_000_000_000, labelKey: 'recruitment.salary.units.billion' },
  { value: 1_000_000, labelKey: 'recruitment.salary.units.million' },
  { value: 1_000, labelKey: 'recruitment.salary.units.thousand' }
] as const satisfies readonly { value: number; labelKey: EmploymentTypeTranslationKey }[]

const getNumberLocale = (locale?: Locale) => (locale === 'en' ? 'en-US' : 'vi-VN')

export const formatSalaryValue = (value: number, t: TranslationFunction, locale?: Locale) => {
  const compactNumberFormatter = new Intl.NumberFormat(getNumberLocale(locale), { maximumFractionDigits: 1 })
  const numberFormatter = new Intl.NumberFormat(getNumberLocale(locale))

  if (!Number.isFinite(value)) return numberFormatter.format(0)

  const unit = compactCurrencyUnits.find((item) => Math.abs(value) >= item.value)

  if (!unit) {
    return numberFormatter.format(value)
  }

  return `${compactNumberFormatter.format(value / unit.value)} ${t(unit.labelKey)}`
}

const normalizeEmploymentType = (employmentType: string) => employmentType.trim().toLowerCase().replace(/[\s_-]/g, '')

export const getJobAvatarFallback = (title: string) => {
  const normalizedTitle = title.trim()

  return normalizedTitle.charAt(0).toUpperCase() || 'H'
}

export const formatJobSalary = ({ salaryMin, salaryMax, salaryNegotiable }: Job, t: TranslationFunction, locale?: Locale) => {
  if (salaryNegotiable) {
    return t('recruitment.salary.negotiable')
  }

  const hasMin = hasValidSalaryValue(salaryMin)
  const hasMax = hasValidSalaryValue(salaryMax)

  if (hasMin && hasMax) {
    return `${formatSalaryValue(salaryMin, t, locale)} - ${formatSalaryValue(salaryMax, t, locale)}`
  }

  if (hasMin) {
    return formatSalaryValue(salaryMin, t, locale)
  }

  if (hasMax) {
    return formatSalaryValue(salaryMax, t, locale)
  }

  return ''
}

export const getJobEmploymentTypeLabel = (employmentType: string, t: TranslationFunction) => {
  const translationKey = employmentTypeTranslationKeyByValue[normalizeEmploymentType(employmentType)]

  return translationKey ? t(translationKey) : employmentType
}
