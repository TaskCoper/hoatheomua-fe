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

export const getCachedJobDescription = (slug: string) =>
  unstable_cache(() => jobDescriptionService.getDescription({ slug }), ['recruitment-detail', slug], {
    tags: [RECRUITMENT_CACHE_TAG],
    revalidate: 600
  })()

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
