import 'server-only'

import companyAddressService from '@/services/company-address.service'
import configService from '@/services/config.service'
import { unstable_cache } from 'next/cache'
import { cache } from 'react'

// On-demand revalidation (app/api/revalidate) purges `configs:${group}` the
// moment a config actually changes, so this is just a safety-net window. This
// cache is touched by every public page via the shared layout, so it becomes
// the floor for all of them - matches the 3600s convention used by the other
// rarely-changing caches (company, categories, articles, recruitment-detail)
// so it stops silently clipping pages that intentionally chose a longer window
// (recruitment 600s, news/static pages 3600s).
const REVALIDATE_SECONDS = 3600

const withCache = <T>(fetcher: () => Promise<T>, key: string[], tag: string) =>
  unstable_cache(fetcher, key, { revalidate: REVALIDATE_SECONDS, tags: [tag] })

export const publicConfigQueryKey = (group?: string, key?: string) => ['configs', 'content', group, key] as const

const fetchPublicConfigsGroup = async <T extends { key: string }>(group: string, key?: string) => {
  try {
    return await configService.getPublicConfigs<T>({ group, key })
  } catch {
    return [] as T[]
  }
}

const cachedFetchPublicConfigsGroup = cache(<T extends { key: string }>(group: string, key?: string) =>
  withCache(
    () => fetchPublicConfigsGroup<T>(group, key),
    ['public-configs', group, key ?? '_all'],
    `configs:${group}`
  )()
)

export const getPublicConfigsGroup = <T extends { key: string }>(group: string, key?: string) =>
  cachedFetchPublicConfigsGroup<T>(group, key)

export const getCompanyAddressCached = cache(async () => {
  return unstable_cache(
    async () => {
      try {
        return await companyAddressService.getCompanyAddress()
      } catch {
        return null
      }
    },
    ['company-address'],
    { revalidate: REVALIDATE_SECONDS, tags: ['company-address'] }
  )()
})
