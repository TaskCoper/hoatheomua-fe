import 'server-only'

import { CACHE_LIFE } from '@/lib/cache-life'
import configService from '@/services/config.service'
import type { FeaturedCard, FeaturedCollection, FeaturedCollectionConfigItem } from '@/types/config.type'
import { cacheLife, cacheTag } from 'next/cache'
import { cache } from 'react'

const fetchFeaturedCollection = async (): Promise<FeaturedCollection | null> => {
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
}

export async function getFeaturedCollection(): Promise<FeaturedCollection | null> {
  'use cache'
  cacheLife(CACHE_LIFE.static1h)
  cacheTag('configs:products')

  return fetchFeaturedCollection()
}

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

/** Enabled card ids, for `generateStaticParams` to prebuild the hot detail pages. */
export const getAllFeaturedIds = async (): Promise<string[]> => {
  const collection = await getFeaturedCollection()
  return collection?.cards.filter((c) => c.enabled).map((c) => c.id) ?? []
}
