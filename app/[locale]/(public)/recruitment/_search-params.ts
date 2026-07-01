import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { createLoader, parseAsInteger, parseAsNativeArrayOf, parseAsString } from 'nuqs/server'
import type { JobDescriptionParam } from './types'

export const RECRUITMENT_CLIENT_FILTER_PAGE_SIZE = 1000

/**
 * Single source of truth for `/recruitment` URL filter params. Shared by the
 * server `loadRecruitmentSearch` (prefetch) and the client `useQueryStates`
 * binding in `RecruitmentView`.
 */
export const recruitmentSearchParsers = {
  q: parseAsString.withDefault(''),
  location: parseAsNativeArrayOf(parseAsString),
  employmentType: parseAsNativeArrayOf(parseAsString),
  salaryMin: parseAsInteger,
  salaryMax: parseAsInteger,
  page: parseAsInteger.withDefault(DEFAULT_PAGE_INDEX)
}

export type RecruitmentSearch = {
  q: string
  location: string[]
  employmentType: string[]
  salaryMin: number | null
  salaryMax: number | null
  page: number
}

export const loadRecruitmentSearch = createLoader(recruitmentSearchParsers)

/**
 * Translates parsed URL params into the canonical `JobDescriptionParam` shape
 * that `jobsListQuery(...)` consumes.
 */
export const toJobDescriptionParam = (search: RecruitmentSearch): JobDescriptionParam => {
  const trimmed = search.q.trim()
  const hasClientSideFilters =
    search.location.length > 0 || search.employmentType.length > 0 || search.salaryMin !== null || search.salaryMax !== null

  return {
    pageIndex: hasClientSideFilters ? DEFAULT_PAGE_INDEX : search.page,
    pageSize: hasClientSideFilters ? RECRUITMENT_CLIENT_FILTER_PAGE_SIZE : DEFAULT_PAGE_SIZE,
    ...(trimmed.length > 0 ? { title: trimmed } : {})
  }
}
