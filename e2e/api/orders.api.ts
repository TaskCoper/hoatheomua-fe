import type { OrderDetail, OrderStatus } from '@/features/orders/types'
import type { AhamoveConfigItem, OrderTag } from '@/types/config.type'
import { expect, type Page } from '@playwright/test'
import type { AddressSpec } from '../fixtures/address'
import { unwrap } from './unwrap'

// the order detail API is keyed by mrc_order_id, the same id the URL carries
export const getOrder = (page: Page, mrcOrderId: string) => unwrap<OrderDetail>(page, `/api/v1/orders/${mrcOrderId}`)

export const getOrderStatus = (page: Page, mrcOrderId: string) =>
  unwrap<OrderStatus>(page, `/api/v1/orders/${mrcOrderId}/status`)

// the free-ship threshold in km; NaN if the config is missing, matching the app
export const getFreeShipKm = async (page: Page): Promise<number> => {
  const configs = await unwrap<AhamoveConfigItem[]>(page, '/api/v1/configs/public?groupName=ahamove')

  return Number(configs.find((config) => config.key === 'ahamove.free_ship')?.value.value)
}

export const getOrderTags = (page: Page) => unwrap<OrderTag>(page, '/api/v1/configs/order-tags')

/**
 * The first delivery slot the config offers, asserted to exist.
 *
 * With no configured slot the select renders disabled, and a spec about scheduling fails
 * somewhere confusing further down instead of here.
 */
export const getFirstDeliverySlot = async (page: Page) => {
  const orderTags = await getOrderTags(page)

  expect(
    orderTags.options?.length ?? 0,
    'the order-tags config carries no delivery slots - the slot select renders disabled'
  ).toBeGreaterThan(0)

  return orderTags.options[0]
}

/**
 * The fixture addresses are only meaningful relative to the live `ahamove.free_ship`
 * threshold, and both are outside this repository's control - the threshold is server-owned
 * config and the distance is Ahamove's. When one of them moves, a case built on a waiver
 * fails on the money assertion, which reads as a pricing bug rather than as stale fixture
 * data. These say which it is.
 */
export const expectInsideFreeShipRadius = (distanceKm: number, freeShipKm: number, address: AddressSpec) => {
  expect(
    distanceKm,
    `FREE_SHIP_ADDRESS "${address.addressQuery}" was quoted at ${distanceKm}km but ` +
      `ahamove.free_ship is ${freeShipKm}km - this address is no longer inside the radius`
  ).toBeLessThan(freeShipKm)
}

export const expectOutsideFreeShipRadius = (distanceKm: number, freeShipKm: number, address: AddressSpec) => {
  expect(
    distanceKm,
    `PAID_SHIP_ADDRESS "${address.addressQuery}" was quoted at ${distanceKm}km but ` +
      `ahamove.free_ship is ${freeShipKm}km - this address is no longer outside the radius`
  ).toBeGreaterThan(freeShipKm)
}

export interface UiTotals {
  productsSubtotal: number
  shippingFee: number
  vatAmount: number
  grandTotal: number
}

export const expectServerTotalsMatchUi = async (page: Page, mrcOrderId: string, ui: UiTotals) => {
  const order = await getOrder(page, mrcOrderId)

  expect(order.productFee, 'the subtotal shown at checkout is not what the server priced').toBe(ui.productsSubtotal)
  expect(order.shippingFee, 'the shipping fee shown at checkout is not what the server quoted').toBe(ui.shippingFee)
  expect(order.vatFee, 'the VAT shown at checkout is not what the server charged').toBe(ui.vatAmount)
  expect(order.totalFee, 'the customer was shown a different total than the one they will pay').toBe(ui.grandTotal)

  // a total that does not add up means one of the parts is being ignored, which
  // the three checks above would miss if two of them were wrong in opposite
  // directions
  expect(order.totalFee).toBe(order.productFee + order.shippingFee + order.vatFee)

  return order
}

/**
 * Waits for the Ahamove booking an immediate-delivery order gets once it is
 * paid.
 *
 * The backend books the ride and flips the status inside one transaction, so in
 * practice the tracking fields are already there the moment the order reads
 * Paid. The poll stays because it costs nothing and keeps the test honest if the
 * booking ever moves to a background job. It reads the API rather than the UI
 * because the detail page stops polling as soon as the status changes.
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
