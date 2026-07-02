import 'server-only'

import configService from '@/services/config.service'
import type { FeaturedCard, FeaturedCollection, FeaturedCollectionConfigItem } from '@/types/config.type'
import { cache } from 'react'

export const getFeaturedCollection = cache(async (): Promise<FeaturedCollection | null> => {
  try {
    const configs = await configService.getPublicConfigs<FeaturedCollectionConfigItem>({
      group: 'products',
      key: 'products.featured'
    })
    const raw = configs[0]?.value.value
    if (!raw) return null
    return JSON.parse(raw) as FeaturedCollection
  } catch {
    return null
  }
})

export interface FeaturedCardWithFlags {
  card: FeaturedCard
  hasCampaigns: boolean
}

export const getFeaturedCard = cache(async (id: string): Promise<FeaturedCardWithFlags | null> => {
  const collection = await getFeaturedCollection()
  if (!collection) return null
  const card = collection.cards.find((c) => c.id === id && c.enabled)
  return card ? { card, hasCampaigns: collection.hasCampaigns } : null
})
