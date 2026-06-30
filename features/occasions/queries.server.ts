import 'server-only'

import configService from '@/services/config.service'
import type { OccasionCard, OccasionsCollection, OccasionsCollectionConfigItem } from '@/types/config.type'
import { cache } from 'react'

export const getOccasionsCollection = cache(async (): Promise<OccasionsCollection | null> => {
  try {
    const configs = await configService.getPublicConfigs<OccasionsCollectionConfigItem>({
      group: 'products',
      key: 'products.occasions'
    })
    const raw = configs[0]?.value.value
    if (!raw) return null
    return JSON.parse(raw) as OccasionsCollection
  } catch {
    return null
  }
})

export const getOccasionCard = cache(async (id: string): Promise<OccasionCard | null> => {
  const collection = await getOccasionsCollection()
  if (!collection) return null
  const card = collection.cards.find((c) => c.id === id && c.enabled)
  return card ?? null
})
