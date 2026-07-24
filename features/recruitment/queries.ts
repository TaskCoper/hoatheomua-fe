import { queryOptions } from '@tanstack/react-query'
import { jobDescriptionService } from '@/features/recruitment/services'
import type { JobDescriptionParam } from '@/features/recruitment/types'

/**
 * One source of truth for the recruitment job-list query, used by both the
 * server prefetch (`qc.prefetchQuery(jobsListQuery(...))`) and the client hook
 * `useGetJobDescriptions`. Locale is included in the queryKey so vi/en don't
 * collide once the backend gains locale awareness.
 */
export const jobsListQuery = (params: JobDescriptionParam, locale: string) =>
  queryOptions({
    queryKey: ['jobDescriptions', params, locale] as const,
    queryFn: () => jobDescriptionService.getJobDescriptions(params)
  })
