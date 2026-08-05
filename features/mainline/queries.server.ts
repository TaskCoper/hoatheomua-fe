import 'server-only'

import configService from '@/services/config.service'
import type { MainlineCard, MainlineCollection, MainlineCollectionConfigItem } from '@/types/config.type'
import { unstable_cache } from 'next/cache'
import { cache } from 'react'

const fetchMainlineCollection = async (): Promise<MainlineCollection | null> => {
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
}

export const getMainlineCollection = cache(() =>
  unstable_cache(fetchMainlineCollection, ['mainline-collection'], {
    revalidate: 60 * 60,
    tags: ['configs:products']
  })()
)

export const getMainlineCard = cache(async (id: string): Promise<MainlineCard | null> => {
  const collection = await getMainlineCollection()
  if (!collection) return null
  const card = collection.cards.find((c) => c.id === id && c.enabled)
  return card ?? null
})

/** Enabled card ids, for `generateStaticParams` to prebuild the hot detail pages. */
export const getAllMainlineIds = async (): Promise<string[]> => {
  const collection = await getMainlineCollection()
  return collection?.cards.filter((c) => c.enabled).map((c) => c.id) ?? []
}
