import 'server-only'

import { CONTENT_LIFE } from '@/lib/cache-life'
import configService from '@/services/config.service'
import type { CompanyConfigItem, ContactConfigItem } from '@/types/config.type'
import { cacheLife, cacheTag } from 'next/cache'

async function readCompanyValue<K extends CompanyConfigItem['key']>(key: K): Promise<string | null> {
  'use cache'
  cacheTag('configs:company')
  cacheLife(CONTENT_LIFE)

  try {
    const configs = await configService.getPublicConfigs<Extract<CompanyConfigItem, { key: K }>>({
      group: 'company',
      key
    })

    const value = configs[0]?.value.value
    return typeof value === 'string' ? value : null
  } catch {
    return null
  }
}

async function readContactValue<K extends ContactConfigItem['key']>(key: K): Promise<string | null> {
  'use cache'
  cacheTag('configs:contact')
  cacheLife(CONTENT_LIFE)

  try {
    const configs = await configService.getPublicConfigs<Extract<ContactConfigItem, { key: K }>>({
      group: 'contact',
      key
    })
    const value = configs[0]?.value.value
    return typeof value === 'string' ? value : null
  } catch {
    return null
  }
}

export const getCompanyBgVideo = () => readCompanyValue('company.bg_video')

export const getCompanyBgMusic = () => readCompanyValue('company.bg_music')

export const getCompanyGpkd = () => readCompanyValue('company.gpkd')

export const getContactPhone = () => readContactValue('contact.phone')

export const getContactEmail = () => readContactValue('contact.email')

export async function getCompanyHotlines(): Promise<string[]> {
  'use cache'
  cacheTag('configs:company')
  cacheLife(CONTENT_LIFE)

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
