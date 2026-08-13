import type { OrderDetail } from '@/features/orders/types'
import type { AhamoveConfigItem, OrderTag } from '@/types/config.type'
import { expect, type Page } from '@playwright/test'
import { unwrap } from './unwrap'

// the order detail API is keyed by mrc_order_id, the same id the URL carries
export const getOrder = (page: Page, mrcOrderId: string) => unwrap<OrderDetail>(page, `/api/v1/orders/${mrcOrderId}`)

// the free-ship threshold in km; NaN if the config is missing, matching the app
export const getFreeShipKm = async (page: Page): Promise<number> => {
  const configs = await unwrap<AhamoveConfigItem[]>(page, '/api/v1/configs/public?groupName=ahamove')

  return Number(configs.find((config) => config.key === 'ahamove.free_ship')?.value.value)
}

export const getOrderTags = (page: Page) => unwrap<OrderTag>(page, '/api/v1/configs/order-tags')

export const getAddressIds = async (page: Page): Promise<string[]> => {
  const addresses = await unwrap<{ id: string }[]>(page, '/api/v1/addresses')

  return addresses.map((address) => address.id)
}

export const getAddressCount = async (page: Page): Promise<number> => (await getAddressIds(page)).length

/**
 * Waits for the Ahamove booking an immediate-delivery order gets once it is
 * paid. The webhook writes the transaction first and the ride is booked after
 * it, so the tracking fields land some time *after* the status flips to Paid -
 * and the detail page stops polling at that point, which is why this reads the
 * API rather than the UI.
 */
export const waitForAhamoveDispatch = async (page: Page, mrcOrderId: string, timeout: number) => {
  let detail!: OrderDetail

  await expect
    .poll(
      async () => {
        detail = await getOrder(page, mrcOrderId)

        return Boolean(detail.ahahaMoveOrderId && detail.ahahaMoveTrackingUrl)
      },
      {
        timeout,
        message:
          `order ${mrcOrderId} was paid but never got an Ahamove booking - ` +
          'an immediate-delivery order must be dispatched as soon as it is paid'
      }
    )
    .toBe(true)

  return detail
}

export const cancelOrderByMrcId = async (page: Page, mrcOrderId: string) => {
  const response = await page.request.patch(`/api/v1/orders/${mrcOrderId}/cancel`)

  return response.ok()
}
