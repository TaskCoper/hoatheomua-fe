import 'server-only'

import { CACHE_LIFE } from '@/lib/cache-life'
import configService from '@/services/config.service'
import type { CompanyConfigItem, ContactConfigItem } from '@/types/config.type'
import { cacheLife, cacheTag } from 'next/cache'

export async function getCompanyBgVideo(): Promise<string | null> {
  'use cache'
  cacheLife(CACHE_LIFE.static1h)
  cacheTag('configs:company')

  try {
    const configs = await configService.getPublicConfigs<Extract<CompanyConfigItem, { key: 'company.bg_video' }>>({
      group: 'company',
      key: 'company.bg_video'
    })
    return configs[0]?.value.value ?? null
  } catch {
    return null
  }
}

export async function getCompanyBgMusic(): Promise<string | null> {
  'use cache'
  cacheLife(CACHE_LIFE.static1h)
  cacheTag('configs:company')

  try {
    const configs = await configService.getPublicConfigs<Extract<CompanyConfigItem, { key: 'company.bg_music' }>>({
      group: 'company',
      key: 'company.bg_music'
    })
    return configs[0]?.value.value ?? null
  } catch {
    return null
  }
}

export async function getCompanyGpkd(): Promise<string | null> {
  'use cache'
  cacheLife(CACHE_LIFE.static1h)
  cacheTag('configs:company')

  try {
    const configs = await configService.getPublicConfigs<Extract<CompanyConfigItem, { key: 'company.gpkd' }>>({
      group: 'company',
      key: 'company.gpkd'
    })
    return configs[0]?.value.value ?? null
  } catch {
    return null
  }
}

export async function getContactPhone(): Promise<string | null> {
  'use cache'
  cacheLife(CACHE_LIFE.static1h)
  cacheTag('configs:contact')

  try {
    const configs = await configService.getPublicConfigs<Extract<ContactConfigItem, { key: 'contact.phone' }>>({
      group: 'contact',
      key: 'contact.phone'
    })
    return configs[0]?.value.value ?? null
  } catch {
    return null
  }
}

export async function getContactEmail(): Promise<string | null> {
  'use cache'
  cacheLife(CACHE_LIFE.static1h)
  cacheTag('configs:contact')

  try {
    const configs = await configService.getPublicConfigs<Extract<ContactConfigItem, { key: 'contact.email' }>>({
      group: 'contact',
      key: 'contact.email'
    })
    return configs[0]?.value.value ?? null
  } catch {
    return null
  }
}

export async function getCompanyHotlines(): Promise<string[]> {
  'use cache'
  cacheLife(CACHE_LIFE.static1h)
  cacheTag('configs:company')

  try {
    const configs = await configService.getPublicConfigs<Extract<CompanyConfigItem, { key: 'company.hotlines' }>>({
      group: 'company',
      key: 'company.hotlines'
    })
    return configs[0]?.value.options.map((option) => option.value) ?? []
  } catch {
    return []
  }
}
