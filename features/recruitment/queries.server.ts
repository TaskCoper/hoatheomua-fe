import 'server-only'

import { jobDescriptionService } from '@/features/recruitment/services'
import type { JobDescriptionParam } from '@/features/recruitment/types'
import { CACHE_LIFE } from '@/lib/cache-life'
import { cacheLife, cacheTag } from 'next/cache'
import { cache } from 'react'

export const RECRUITMENT_CACHE_TAG = 'recruitment'

export const jobDetailTag = (slug: string) => `recruitment:${slug}`

export async function getCachedJobs(params: JobDescriptionParam) {
  'use cache'
  cacheLife(CACHE_LIFE.recruitment)
  cacheTag(RECRUITMENT_CACHE_TAG)

  return jobDescriptionService.getJobDescriptions(params)
}

export const getCachedJobDescription = cache(async (slug: string) => {
  return jobDescriptionService.getDescription({ slug })
})

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
