import type { OrderDetail } from '@/features/orders/types'
import type { AhamoveConfigItem } from '@/types/config.type'
import { type Page } from '@playwright/test'
import { unwrap } from './unwrap'

// the order detail API is keyed by mrc_order_id, the same id the URL carries
export const getOrder = (page: Page, mrcOrderId: string) => unwrap<OrderDetail>(page, `/api/v1/orders/${mrcOrderId}`)

// the free-ship threshold in km; NaN if the config is missing, matching the app
export const getFreeShipKm = async (page: Page): Promise<number> => {
  const configs = await unwrap<AhamoveConfigItem[]>(page, '/api/v1/configs/public?groupName=ahamove')

  return Number(configs.find((config) => config.key === 'ahamove.free_ship')?.value.value)
}

export const getAddressIds = async (page: Page): Promise<string[]> => {
  const addresses = await unwrap<{ id: string }[]>(page, '/api/v1/addresses')

  return addresses.map((address) => address.id)
}

export const getAddressCount = async (page: Page): Promise<number> => (await getAddressIds(page)).length

export const cancelOrderByMrcId = async (page: Page, mrcOrderId: string) => {
  const response = await page.request.patch(`/api/v1/orders/${mrcOrderId}/cancel`)

  return response.ok()
}
