import 'server-only'

import configService from '@/services/config.service'
import type { CompanyConfigItem, ContactConfigItem } from '@/types/config.type'
import { unstable_cache } from 'next/cache'
import { cache } from 'react'

const REVALIDATE_SECONDS = 60 * 60 // 1h

const withPersistentCache = <T>(fetcher: () => Promise<T>, key: string[], tag: string) =>
  unstable_cache(fetcher, key, { revalidate: REVALIDATE_SECONDS, tags: [tag] })

export const getCompanyBgVideo = cache(
  (): Promise<string | null> =>
    withPersistentCache(
      async () => {
        try {
          const configs = await configService.getPublicConfigs<Extract<CompanyConfigItem, { key: 'company.bg_video' }>>(
            {
              group: 'company',
              key: 'company.bg_video'
            }
          )
          return configs[0]?.value.value ?? null
        } catch {
          return null
        }
      },
      ['company-bg-video'],
      'configs:company'
    )()
)

export const getCompanyBgMusic = cache(
  (): Promise<string | null> =>
    withPersistentCache(
      async () => {
        try {
          const configs = await configService.getPublicConfigs<Extract<CompanyConfigItem, { key: 'company.bg_music' }>>(
            {
              group: 'company',
              key: 'company.bg_music'
            }
          )
          return configs[0]?.value.value ?? null
        } catch {
          return null
        }
      },
      ['company-bg-music'],
      'configs:company'
    )()
)

export const getCompanyGpkd = cache(
  (): Promise<string | null> =>
    withPersistentCache(
      async () => {
        try {
          const configs = await configService.getPublicConfigs<Extract<CompanyConfigItem, { key: 'company.gpkd' }>>({
            group: 'company',
            key: 'company.gpkd'
          })
          return configs[0]?.value.value ?? null
        } catch {
          return null
        }
      },
      ['company-gpkd'],
      'configs:company'
    )()
)

export const getContactPhone = cache(
  (): Promise<string | null> =>
    withPersistentCache(
      async () => {
        try {
          const configs = await configService.getPublicConfigs<Extract<ContactConfigItem, { key: 'contact.phone' }>>({
            group: 'contact',
            key: 'contact.phone'
          })
          return configs[0]?.value.value ?? null
        } catch {
          return null
        }
      },
      ['contact-phone'],
      'configs:contact'
    )()
)

export const getContactEmail = cache(
  (): Promise<string | null> =>
    withPersistentCache(
      async () => {
        try {
          const configs = await configService.getPublicConfigs<Extract<ContactConfigItem, { key: 'contact.email' }>>({
            group: 'contact',
            key: 'contact.email'
          })
          return configs[0]?.value.value ?? null
        } catch {
          return null
        }
      },
      ['contact-email'],
      'configs:contact'
    )()
)

export const getCompanyHotlines = cache(
  (): Promise<string[]> =>
    withPersistentCache(
      async () => {
        try {
          const configs = await configService.getPublicConfigs<Extract<CompanyConfigItem, { key: 'company.hotlines' }>>(
            {
              group: 'company',
              key: 'company.hotlines'
            }
          )
          return configs[0]?.value.options.map((option) => option.value) ?? []
        } catch {
          return []
        }
      },
      ['company-hotlines'],
      'configs:company'
    )()
)
