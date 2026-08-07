import 'server-only'

import { jobDescriptionService } from '@/features/recruitment/services'
import type { JobDescriptionParam, JobDetail } from '@/features/recruitment/types'
import { CONTENT_LIFE, RECRUITMENT_LIST_LIFE } from '@/lib/cache-life'
import { isAxiosError } from 'axios'
import { cacheLife, cacheTag } from 'next/cache'
import { cache } from 'react'

export const RECRUITMENT_CACHE_TAG = 'recruitment'

export async function getCachedJobs(params: JobDescriptionParam) {
  'use cache'
  cacheTag(RECRUITMENT_CACHE_TAG)
  cacheLife(RECRUITMENT_LIST_LIFE)

  return jobDescriptionService.getJobDescriptions(params)
}

async function getJobDescriptionCached(slug: string): Promise<JobDetail | null> {
  'use cache'
  cacheTag(RECRUITMENT_CACHE_TAG)
  cacheLife(CONTENT_LIFE)

  try {
    return await jobDescriptionService.getDescription({ slug })
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) return null
    throw error
  }
}

export const getCachedJobDescription = cache(getJobDescriptionCached)

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
