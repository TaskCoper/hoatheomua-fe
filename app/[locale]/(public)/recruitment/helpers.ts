import type { TranslationFunction } from '@/lib/i18n/dictionary-provider'

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
  { value: 1_000_000_000, label: 'tỷ' },
  { value: 1_000_000, label: 'triệu' },
  { value: 1_000, label: 'ngàn' },
  { value: 1, label: 'đồng' }
] as const

const compactNumberFormatter = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 })
const numberFormatter = new Intl.NumberFormat('vi-VN')

export const formatCurrency = (value: number) => {
  const unit = compactCurrencyUnits.find((item) => Math.abs(value) >= item.value)

  if (!unit) {
    return numberFormatter.format(value)
  }

  return `${compactNumberFormatter.format(value / unit.value)} ${unit.label}`
}

const normalizeEmploymentType = (employmentType: string) =>
  employmentType
    .trim()
    .toLowerCase()
    .replace(/[\s_-]/g, '')

export const getJobAvatarFallback = (title: string) => {
  const normalizedTitle = title.trim()

  return normalizedTitle.charAt(0).toUpperCase() || 'H'
}

export const formatJobSalary = ({ salaryMin, salaryMax }: Job) => {
  const hasMin = hasValidSalaryValue(salaryMin)
  const hasMax = hasValidSalaryValue(salaryMax)

  if (hasMin && hasMax) {
    return `${formatCurrency(salaryMin)} - ${formatCurrency(salaryMax)}`
  }

  if (hasMin) {
    return formatCurrency(salaryMin)
  }

  if (hasMax) {
    return formatCurrency(salaryMax)
  }

  return ''
}

export const getJobEmploymentTypeLabel = (employmentType: string, t: TranslationFunction) => {
  const translationKey = employmentTypeTranslationKeyByValue[normalizeEmploymentType(employmentType)]

  return translationKey ? t(translationKey) : employmentType
}
