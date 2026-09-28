'use client'

import { useGetPublicConfigs } from '@/hooks/use-get-public-configs'
import type { CardConfigItem } from '@/types/config.type'
import { useMemo } from 'react'
import {
  CARD_CONFIG_GROUP,
  CARD_PRICES_KEY,
  CARD_SIZES_KEY,
  parseCardPriceTiers,
  parseCardSizes,
  type CardConfig
} from '../cards/card-config'
import { ARE_CARDS_ENABLED } from '../cards/card-feature'

export const useCardConfig = () => {
  const { configs, isGettingConfigs } = useGetPublicConfigs<CardConfigItem>({
    group: CARD_CONFIG_GROUP,
    options: {
      enabled: ARE_CARDS_ENABLED,
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
      sizes: sizes ?? [],
      priceTiers: priceTiers ?? []
    }
  }, [configs])

  return { cardConfig, isGettingCardConfig: isGettingConfigs }
}
