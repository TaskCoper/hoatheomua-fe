'use client'

import { useGetPublicConfigs } from '@/hooks/use-get-public-configs'
import type { CardConfigItem } from '@/types/config.type'
import { useMemo } from 'react'
import {
  CARD_CONFIG_GROUP,
  CARD_PRICES_KEY,
  CARD_SIZES_KEY,
  DEFAULT_CARD_PRICE_TIERS,
  DEFAULT_CARD_SIZES,
  parseCardPriceTiers,
  parseCardSizes,
  type CardConfig
} from '../cards/card-config'

/** Falls back to the built-in ladder on a missing or malformed blob. */
export const useCardConfig = () => {
  const { configs, isGettingConfigs } = useGetPublicConfigs<CardConfigItem>({
    group: CARD_CONFIG_GROUP,
    options: {
      staleTime: 5 * 60_000,
      gcTime: 30 * 60_000,
      retry: false,
      throwOnError: false
    }
  })

  const cardConfig = useMemo<CardConfig>(() => {
    const sizes = parseCardSizes(configs.find((config) => config.key === CARD_SIZES_KEY)?.value.value)
    const priceTiers = parseCardPriceTiers(configs.find((config) => config.key === CARD_PRICES_KEY)?.value.value)

    return {
      sizes: sizes ?? DEFAULT_CARD_SIZES,
      priceTiers: priceTiers ?? DEFAULT_CARD_PRICE_TIERS
    }
  }, [configs])

  return { cardConfig, isGettingCardConfig: isGettingConfigs }
}
