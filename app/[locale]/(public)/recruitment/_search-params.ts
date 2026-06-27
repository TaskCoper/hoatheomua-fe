import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { createLoader, parseAsInteger, parseAsString, parseAsStringEnum } from 'nuqs/server'
import type { JobDescriptionParam, RecruitmentSalaryRange } from './types'

const SALARY_RANGES: RecruitmentSalaryRange[] = ['below-8', '8-12', '12-18', 'above-18']

/**
 * Single source of truth for `/recruitment` URL filter params. Shared by the
 * server `loadRecruitmentSearch` (prefetch) and the client `useQueryStates`
 * binding in `RecruitmentView`.
 */
export const recruitmentSearchParsers = {
  q: parseAsString.withDefault(''),
  location: parseAsString,
  employmentType: parseAsString,
  salaryRange: parseAsStringEnum(SALARY_RANGES),
  page: parseAsInteger.withDefault(DEFAULT_PAGE_INDEX)
}

export type RecruitmentSearch = {
  q: string
  location: string | null
  employmentType: string | null
  salaryRange: RecruitmentSalaryRange | null
  page: number
}

export const loadRecruitmentSearch = createLoader(recruitmentSearchParsers)

const salaryParamsFromRange = (
  range: RecruitmentSalaryRange | null
): { salaryMin?: number; salaryMax?: number } => {
  if (range === 'below-8') return { salaryMax: 8_000_000 }
  if (range === '8-12') return { salaryMin: 8_000_000, salaryMax: 12_000_000 }
  if (range === '12-18') return { salaryMin: 12_000_000, salaryMax: 18_000_000 }
  if (range === 'above-18') return { salaryMin: 18_000_000 }
  return {}
}

/**
 * Translates parsed URL params into the canonical `JobDescriptionParam` shape
 * that `jobsListQuery(...)` consumes.
 */
export const toJobDescriptionParam = (search: RecruitmentSearch): JobDescriptionParam => {
  const trimmed = search.q.trim()
  return {
    pageIndex: search.page,
    pageSize: DEFAULT_PAGE_SIZE,
    ...(trimmed.length > 0 ? { title: trimmed } : {}),
    ...(search.location ? { location: search.location } : {}),
    ...(search.employmentType ? { employmentType: search.employmentType } : {}),
    ...salaryParamsFromRange(search.salaryRange)
  }
}
