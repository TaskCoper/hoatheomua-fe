'use client'

import { BannerItem, BannerSlot, BannersCollection, BannersCollectionConfigItem } from '@/types/config.type'
import { useMemo } from 'react'
import { useGetPublicConfigs } from './use-get-public-configs'

export type BannerSlotState = { status: 'banner'; banner: BannerItem } | { status: 'fallback' } | { status: 'hidden' }

const FALLBACK: BannerSlotState = { status: 'fallback' }
const HIDDEN: BannerSlotState = { status: 'hidden' }

const normalizeSlot = (slot: BannerSlot) =>
  slot
    .trim()
    .toLowerCase()
    .replace(/[-_.\s]/g, '')

interface BannersState {
  /** True once a parseable config row exists - i.e. the config decides, not the fallbacks. */
  configured: boolean
  sectionEnabled: boolean
  items: BannerItem[]
  getSlot: (slot: BannerSlot) => BannerSlotState
}

const UNCONFIGURED: BannersState = {
  configured: false,
  sectionEnabled: false,
  items: [],
  getSlot: () => FALLBACK
}

export function useBanners(): BannersState {
  const { configs } = useGetPublicConfigs<BannersCollectionConfigItem, 'banners.collection'>({
    group: 'banners',
    key: 'banners.collection'
  })

  return useMemo<BannersState>(() => {
    const raw = configs[0]?.value.value
    if (!raw) return UNCONFIGURED

    try {
      const parsed = JSON.parse(raw) as BannersCollection
      const items = (parsed.items ?? []).filter((item) => item.enabled)
      const bySlot = new Map(items.map((item) => [normalizeSlot(item.slot), item]))
      const sectionEnabled = parsed.section?.enabled ?? false

      return {
        configured: true,
        sectionEnabled,
        items,
        getSlot: (slot) => {
          if (!sectionEnabled) return HIDDEN
          const banner = bySlot.get(normalizeSlot(slot))
          return banner ? { status: 'banner', banner } : HIDDEN
        }
      }
    } catch {
      return UNCONFIGURED
    }
  }, [configs])
}

export function useBannerSlot(slot: BannerSlot): BannerSlotState {
  return useBanners().getSlot(slot)
}
