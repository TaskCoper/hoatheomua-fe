import 'server-only'

import { CONTENT_LIFE } from '@/lib/cache-life'
import configService from '@/services/config.service'
import type { OccasionCard, OccasionsCollection, OccasionsCollectionConfigItem } from '@/types/config.type'
import { cacheLife, cacheTag } from 'next/cache'
import { cache } from 'react'

export async function getOccasionsCollection(): Promise<OccasionsCollection | null> {
  'use cache'
  cacheTag('configs:products')
  cacheLife(CONTENT_LIFE)

  try {
    const configs = await configService.getPublicConfigs<OccasionsCollectionConfigItem>({
      group: 'products',
      key: 'products.occasions'
    })

    const raw = configs[0]?.value.value
    if (!raw) {
      return null
    }

    return JSON.parse(raw) as OccasionsCollection
  } catch {
    return null
  }
}

export const getOccasionCard = cache(async (id: string): Promise<OccasionCard | null> => {
  const collection = await getOccasionsCollection()

  if (!collection) {
    return null
  }

  const card = collection.cards.find((c) => c.id === id && c.enabled)
  return card ?? null
})

/** Enabled card ids, for `generateStaticParams` to prebuild the hot detail pages. */
export const getAllOccasionIds = async (): Promise<string[]> => {
  const collection = await getOccasionsCollection()
  return collection?.cards.filter((c) => c.enabled).map((c) => c.id) ?? []
}
