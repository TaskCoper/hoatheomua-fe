import { DEFAULT_PAGE_INDEX } from '@/shared/constants'
import { createLoader, parseAsInteger, parseAsString } from 'nuqs/server'
import type { JobDescriptionParam } from './types'

export const RECRUITMENT_PAGE_SIZE = 5

/**
 * Single source of truth for `/recruitment` URL filter params. Shared by the
 * server `loadRecruitmentSearch` (prefetch) and the client `useQueryStates`
 * binding in `RecruitmentView`.
 */
export const recruitmentSearchParsers = {
  q: parseAsString.withDefault(''),
  location: parseAsString,
  employmentType: parseAsString,
  salaryMin: parseAsInteger,
  salaryMax: parseAsInteger,
  page: parseAsInteger.withDefault(DEFAULT_PAGE_INDEX),
  /**
   * Slug of the job whose detail is open in the right pane (LinkedIn-style
   * `?currentJobId`). Read client-side only — the server prefetch never looks at
   * it — so the page stays ISR/static. Absent means "auto-select the first result".
   */
  job: parseAsString
}

export type RecruitmentSearch = {
  q: string
  location: string | null
  employmentType: string | null
  salaryMin: number | null
  salaryMax: number | null
  page: number
  job: string | null
}

export const loadRecruitmentSearch = createLoader(recruitmentSearchParsers)

/**
 * Translates parsed URL params into the canonical `JobDescriptionParam` shape
 * that `jobsListQuery(...)` consumes.
 */
export const toJobDescriptionParam = (search: RecruitmentSearch): JobDescriptionParam => {
  const trimmed = search.q.trim()
  return {
    pageIndex: search.page,
    pageSize: RECRUITMENT_PAGE_SIZE,
    ...(trimmed.length > 0 ? { title: trimmed } : {}),
    ...(search.location ? { location: search.location } : {}),
    ...(search.employmentType ? { employmentType: search.employmentType } : {}),
    ...(search.salaryMin !== null ? { salaryMin: search.salaryMin } : {}),
    ...(search.salaryMax !== null ? { salaryMax: search.salaryMax } : {})
  }
}
