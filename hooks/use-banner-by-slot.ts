'use client'

import { BannerItem, BannerSlot, BannersCollection, BannersCollectionConfigItem } from '@/types/config.type'
import { useMemo } from 'react'
import { useGetPublicConfigs } from './use-get-public-configs'

interface BannersState {
  sectionEnabled: boolean
  items: BannerItem[]
  getBanner: (slot: BannerSlot) => BannerItem | undefined
}

export function useBanners(): BannersState {
  const { configs } = useGetPublicConfigs<BannersCollectionConfigItem, 'banners.collection'>({
    group: 'banners',
    key: 'banners.collection'
  })

  return useMemo<BannersState>(() => {
    const raw = configs[0]?.value.value
    if (!raw) return { sectionEnabled: false, items: [], getBanner: () => undefined }

    try {
      const parsed = JSON.parse(raw) as BannersCollection
      const items = (parsed.items ?? []).filter((item) => item.enabled)
      const bySlot = new Map(items.map((item) => [item.slot, item]))
      return {
        sectionEnabled: parsed.section?.enabled ?? false,
        items,
        getBanner: (slot) => bySlot.get(slot)
      }
    } catch {
      return { sectionEnabled: false, items: [], getBanner: () => undefined }
    }
  }, [configs])
}

export function useBannerBySlot(slot: BannerSlot): BannerItem | undefined {
  const { sectionEnabled, getBanner } = useBanners()
  return sectionEnabled ? getBanner(slot) : undefined
}
