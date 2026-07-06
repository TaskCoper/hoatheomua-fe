import 'server-only'

import companyAddressService from '@/services/company-address.service'
import configService from '@/services/config.service'
import { unstable_cache } from 'next/cache'
import { cache } from 'react'

const REVALIDATE_SECONDS = 300

const withCache = <T>(fetcher: () => Promise<T>, key: string[], tag: string) =>
  unstable_cache(fetcher, key, { revalidate: REVALIDATE_SECONDS, tags: [tag] })

export const publicConfigQueryKey = (group?: string, key?: string) =>
  ['configs', 'content', group, key] as const

const fetchPublicConfigsGroup = async <T extends { key: string }>(group: string, key?: string) => {
  try {
    return await configService.getPublicConfigs<T>({ group, key })
  } catch {
    return [] as T[]
  }
}

const cachedFetchPublicConfigsGroup = cache(
  <T extends { key: string }>(group: string, key?: string) =>
    withCache(() => fetchPublicConfigsGroup<T>(group, key), ['public-configs', group, key ?? '_all'], `configs:${group}`)()
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
