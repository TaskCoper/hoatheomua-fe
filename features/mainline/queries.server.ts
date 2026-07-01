import 'server-only'

import configService from '@/services/config.service'
import type { MainlineCard, MainlineCollection, MainlineCollectionConfigItem } from '@/types/config.type'
import { cache } from 'react'

export const getMainlineCollection = cache(async (): Promise<MainlineCollection | null> => {
  try {
    const configs = await configService.getPublicConfigs<MainlineCollectionConfigItem>({
      group: 'products',
      key: 'products.mainline'
    })
    const raw = configs[0]?.value.value
    if (!raw) return null
    return JSON.parse(raw) as MainlineCollection
  } catch {
    return null
  }
})

export const getMainlineCard = cache(async (id: string): Promise<MainlineCard | null> => {
  const collection = await getMainlineCollection()
  if (!collection) return null
  const card = collection.cards.find((c) => c.id === id && c.enabled)
  return card ?? null
})
