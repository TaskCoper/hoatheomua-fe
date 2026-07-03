import 'server-only'

import configService from '@/services/config.service'
import type { CompanyConfigItem } from '@/types/config.type'
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
