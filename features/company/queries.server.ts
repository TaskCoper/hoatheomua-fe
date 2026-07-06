import 'server-only'

import configService from '@/services/config.service'
import type { CompanyConfigItem, ContactConfigItem } from '@/types/config.type'
import { cache } from 'react'

export const getCompanyBgVideo = cache(async (): Promise<string | null> => {
  try {
    const configs = await configService.getPublicConfigs<Extract<CompanyConfigItem, { key: 'company.bg_video' }>>({
      group: 'company',
      key: 'company.bg_video'
    })
    return configs[0]?.value.value ?? null
  } catch {
    return null
  }
})

export const getCompanyBgMusic = cache(async (): Promise<string | null> => {
  try {
    const configs = await configService.getPublicConfigs<Extract<CompanyConfigItem, { key: 'company.bg_music' }>>({
      group: 'company',
      key: 'company.bg_music'
    })
    return configs[0]?.value.value ?? null
  } catch {
    return null
  }
})

export const getCompanyGpkd = cache(async (): Promise<string | null> => {
  try {
    const configs = await configService.getPublicConfigs<Extract<CompanyConfigItem, { key: 'company.gpkd' }>>({
      group: 'company',
      key: 'company.gpkd'
    })
    return configs[0]?.value.value ?? null
  } catch {
    return null
  }
})

export const getContactPhone = cache(async (): Promise<string | null> => {
  try {
    const configs = await configService.getPublicConfigs<Extract<ContactConfigItem, { key: 'contact.phone' }>>({
      group: 'contact',
      key: 'contact.phone'
    })
    return configs[0]?.value.value ?? null
  } catch {
    return null
  }
})

export const getContactEmail = cache(async (): Promise<string | null> => {
  try {
    const configs = await configService.getPublicConfigs<Extract<ContactConfigItem, { key: 'contact.email' }>>({
      group: 'contact',
      key: 'contact.email'
    })
    return configs[0]?.value.value ?? null
  } catch {
    return null
  }
})

export const getCompanyHotlines = cache(async (): Promise<string[]> => {
  try {
    const configs = await configService.getPublicConfigs<Extract<CompanyConfigItem, { key: 'company.hotlines' }>>({
      group: 'company',
      key: 'company.hotlines'
    })
    return configs[0]?.value.options.map((option) => option.value) ?? []
  } catch {
    return []
  }
})
