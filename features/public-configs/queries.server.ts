import 'server-only'

import { CONTENT_LIFE } from '@/lib/cache-life'
import companyAddressService from '@/services/company-address.service'
import configService from '@/services/config.service'
import { cacheLife, cacheTag } from 'next/cache'
import { cache } from 'react'

export const publicConfigQueryKey = (group?: string, key?: string) => ['configs', 'content', group, key] as const

async function fetchPublicConfigsGroup<T extends { key: string }>(group: string, key?: string): Promise<T[]> {
  'use cache'
  cacheTag(`configs:${group}`)
  cacheLife(CONTENT_LIFE)

  try {
    return await configService.getPublicConfigs<T>({ group, key })
  } catch {
    return [] as T[]
  }
}

const cachedFetchPublicConfigsGroup = cache(fetchPublicConfigsGroup)

export const getPublicConfigsGroup = <T extends { key: string }>(group: string, key?: string) =>
  cachedFetchPublicConfigsGroup(group, key) as Promise<T[]>

async function fetchCompanyAddress() {
  'use cache'
  cacheTag('company-address')
  cacheLife(CONTENT_LIFE)

  try {
    return await companyAddressService.getCompanyAddress()
  } catch {
    return null
  }
}

export const getCompanyAddressCached = cache(fetchCompanyAddress)
