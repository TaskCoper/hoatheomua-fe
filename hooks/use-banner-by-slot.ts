'use client'

import {
  BANNER_SLOTS,
  BannerItem,
  BannerSlot,
  BannersCollection,
  BannersCollectionConfigItem
} from '@/types/config.type'
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

/**
 * Aspect each slot is framed against in the admin - mirrors `BANNER_SLOT_SHAPE` in taskcoper-fe,
 * including its 3:1 default for unknown slots. Only used when a banner carries an `#iv=` framing:
 * that is the one case where the slot has to reserve a box instead of following the asset's own
 * aspect, and the box has to be the one the author cropped against.
 */
const BANNER_SLOT_ASPECT: Record<string, number> = {
  [BANNER_SLOTS.homeCollection]: 16 / 5,
  [BANNER_SLOTS.homeSale]: 5,
  [BANNER_SLOTS.products]: 5,
  [BANNER_SLOTS.product]: 5
}

const DEFAULT_BANNER_ASPECT = 3

const ASPECT_BY_NORMALIZED_SLOT = new Map(
  Object.entries(BANNER_SLOT_ASPECT).map(([slot, aspect]) => [normalizeSlot(slot), aspect])
)

export const bannerAspectForSlot = (slot: BannerSlot): number =>
  ASPECT_BY_NORMALIZED_SLOT.get(normalizeSlot(slot)) ?? DEFAULT_BANNER_ASPECT

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
