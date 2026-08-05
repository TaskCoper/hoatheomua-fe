import 'server-only'

import { CACHE_LIFE } from '@/lib/cache-life'
import companyAddressService from '@/services/company-address.service'
import configService from '@/services/config.service'
import { cacheLife, cacheTag } from 'next/cache'

export const publicConfigQueryKey = (group?: string, key?: string) => ['configs', 'content', group, key] as const

const fetchPublicConfigsGroup = async <T extends { key: string }>(group: string, key?: string) => {
  try {
    return await configService.getPublicConfigs<T>({ group, key })
  } catch {
    return [] as T[]
  }
}

export async function getPublicConfigsGroup<T extends { key: string }>(group: string, key?: string) {
  'use cache'
  cacheLife(CACHE_LIFE.configs)
  cacheTag(`configs:${group}`)

  return fetchPublicConfigsGroup<T>(group, key)
}

export async function getCompanyAddressCached() {
  'use cache'
  cacheLife(CACHE_LIFE.configs)
  cacheTag('company-address')

  try {
    return await companyAddressService.getCompanyAddress()
  } catch {
    return null
  }
}
