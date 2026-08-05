import 'server-only'

import { jobDescriptionService } from '@/features/recruitment/services'
import type { JobDescriptionParam } from '@/features/recruitment/types'
import { CACHE_LIFE } from '@/lib/cache-life'
import { cacheLife, cacheTag, unstable_cache } from 'next/cache'

export const RECRUITMENT_CACHE_TAG = 'recruitment'

export const jobDetailTag = (slug: string) => `recruitment:${slug}`

export async function getCachedJobs(params: JobDescriptionParam) {
  'use cache'
  cacheLife(CACHE_LIFE.recruitment)
  cacheTag(RECRUITMENT_CACHE_TAG)

  return jobDescriptionService.getJobDescriptions(params)
}

export const getCachedJobDescription = (slug: string) =>
  unstable_cache(async () => jobDescriptionService.getDescription({ slug }), ['job-detail', slug], {
    revalidate: 600,
    tags: [RECRUITMENT_CACHE_TAG, jobDetailTag(slug)]
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
