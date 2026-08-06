import 'server-only'

import { jobDescriptionService } from '@/features/recruitment/services'
import type { JobDescriptionParam, JobDetail } from '@/features/recruitment/types'
import { isAxiosError } from 'axios'
import { unstable_cache } from 'next/cache'
import { cache } from 'react'

export const RECRUITMENT_CACHE_TAG = 'recruitment'

export const getCachedJobs = (params: JobDescriptionParam, locale: string) =>
  unstable_cache(
    () => jobDescriptionService.getJobDescriptions(params),
    ['recruitment-list', locale, JSON.stringify(params)],
    { tags: [RECRUITMENT_CACHE_TAG], revalidate: 600 }
  )()

export const getCachedJobDescription = cache(
  (slug: string): Promise<JobDetail | null> =>
    unstable_cache(
      async () => {
        try {
          return await jobDescriptionService.getDescription({ slug })
        } catch (error) {
          if (isAxiosError(error) && error.response?.status === 404) return null
          throw error
        }
      },
      ['recruitment-detail', slug],
      { tags: [RECRUITMENT_CACHE_TAG], revalidate: 3600 }
    )()
)

export const getAllJobSlugs = async (): Promise<string[]> => {
  const slugs: string[] = []
  let pageIndex = 1

  try {
    while (true) {
      const page = await jobDescriptionService.getJobDescriptions({ pageIndex, pageSize: 50 })

      for (const job of page.value.items) {
        slugs.push(job.slug)
      }

      if (!page.value.hasNextPage) break
      pageIndex += 1
    }
  } catch (error) {
    console.error('[SSR] job slugs enumeration failed:', error)
    return slugs
  }

  return slugs
}
