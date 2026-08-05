import 'server-only'

import { jobDescriptionService } from '@/features/recruitment/services'
import type { JobDescriptionParam } from '@/features/recruitment/types'
import { CACHE_LIFE } from '@/lib/cache-life'
import { cacheLife, cacheTag } from 'next/cache'

export const RECRUITMENT_CACHE_TAG = 'recruitment'

export async function getCachedJobs(params: JobDescriptionParam) {
  'use cache'
  cacheLife(CACHE_LIFE.recruitment)
  cacheTag(RECRUITMENT_CACHE_TAG)

  return jobDescriptionService.getJobDescriptions(params)
}

export async function getCachedJobDescription(slug: string) {
  'use cache'
  cacheLife(CACHE_LIFE.recruitment)
  cacheTag(RECRUITMENT_CACHE_TAG)

  return jobDescriptionService.getDescription({ slug })
}

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
