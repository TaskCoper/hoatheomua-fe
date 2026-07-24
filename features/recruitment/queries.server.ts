import 'server-only'

import { jobDescriptionService } from '@/features/recruitment/services'
import type { JobDescriptionParam } from '@/features/recruitment/types'
import { unstable_cache } from 'next/cache'

export const RECRUITMENT_CACHE_TAG = 'recruitment'

export const getCachedJobs = (params: JobDescriptionParam, locale: string) =>
  unstable_cache(
    () => jobDescriptionService.getJobDescriptions(params),
    ['recruitment-list', locale, JSON.stringify(params)],
    { tags: [RECRUITMENT_CACHE_TAG], revalidate: 600 }
  )()
