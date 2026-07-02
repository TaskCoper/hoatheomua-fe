import 'server-only'

import { unstable_cache } from 'next/cache'
import { jobDescriptionService } from './services'
import type { JobDescriptionParam } from './types'

export const RECRUITMENT_CACHE_TAG = 'recruitment'

export const getCachedJobs = (params: JobDescriptionParam, locale: string) =>
  unstable_cache(
    () => jobDescriptionService.getJobDescriptions(params),
    ['recruitment-list', locale, JSON.stringify(params)],
    { tags: [RECRUITMENT_CACHE_TAG], revalidate: 60 }
  )()
