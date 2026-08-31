'use client'

import { useGetPublicConfigs } from '@/hooks/use-get-public-configs'
import type { AhamoveConfigItem } from '@/types/config.type'

export const useFreeShipKm = (): number => {
  const { configs } = useGetPublicConfigs<AhamoveConfigItem>({ group: 'ahamove' })

  return Number(configs.find((config) => config.key === 'ahamove.free_ship')?.value.value)
}
