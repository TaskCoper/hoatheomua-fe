import { jobDescriptionService } from '@/features/recruitment/services'
import type { JobDescriptionParam } from '@/features/recruitment/types'
import { queryOptions } from '@tanstack/react-query'

export const jobsListQuery = (params: JobDescriptionParam, locale: string) =>
  queryOptions({
    queryKey: ['jobDescriptions', params, locale] as const,
    queryFn: () => jobDescriptionService.getJobDescriptions(params)
  })
