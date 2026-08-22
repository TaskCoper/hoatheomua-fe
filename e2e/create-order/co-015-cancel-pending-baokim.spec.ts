import { expect } from '@playwright/test'
import { expectInsideFreeShipRadius, getFreeShipKm, getOrder, getOrderStatus } from '../api/orders.api'
import { FREE_SHIP_ADDRESS } from '../fixtures/address'
import { orderTest } from '../fixtures/order'
import { ORDER_NOTE, PRIMARY_PRODUCT } from '../fixtures/products'
import { CartPage } from '../pages/cart.page'
import { CheckoutPage } from '../pages/checkout.page'
import { OrderPage } from '../pages/order.page'
import { ProductPage } from '../pages/product.page'

/**
 * CO-015 - a pending order is cancelled by its owner.
 *
 * `Pending -> Cancelled` is the only order status transition the suite can drive
 * end to end without a payment, and until now it was covered nowhere: the other
 * cases only ever see cancel as a teardown call in the order fixture. It is also
 * the half of the lifecycle a customer reaches most often.
 *
 * Two backend details this pins deliberately:
 *
 * - cancel matches on `Id == id && Status == "Pending"` in a single query, so an
 *   already-cancelled order is indistinguishable from one that never existed and
 *   comes back as **400 "Order not found"** rather than a 404 or a 409. If that
 *   is ever tidied up, this test is where you find out.
 * - nothing is refunded or restocked, because there is nothing to refund: an
 *   unpaid order has no transaction.
 */

const QUANTITY = 1

orderTest.use({ addressSpec: FREE_SHIP_ADDRESS })

orderTest(
  'CO-015 - Khách huỷ được đơn đang chờ thanh toán',
  async ({ authedPage: page, savedAddress, createdOrders }) => {
    orderTest.slow()

    const products = new ProductPage(page)
    const cart = new CartPage(page)
    const checkout = new CheckoutPage(page)
    const order = new OrderPage(page)

    const freeShipKm = await getFreeShipKm(page)

    // Step 1 - the shortest path to a pending order, matching CO-001
    let variantLabel = ''

    await orderTest.step('filter products and add to cart', async () => {
      variantLabel = await products.addFixtureToCart(PRIMARY_PRODUCT)
    })

    await orderTest.step('go to checkout through the cart', async () => {
      await cart.goto()
      await expect(cart.line(variantLabel)).toBeVisible()
      await expect(cart.quantityOf(variantLabel)).toHaveText(String(QUANTITY))

      await cart.goToCheckout()
    })

    await orderTest.step('choose the saved address and write a note', async () => {
      await checkout.pickSavedAddress(savedAddress.receiverName)
      await checkout.setNote(ORDER_NOTE)
    })

    await orderTest.step('continue to payment', async () => {
      const quote = await checkout.goToPaymentCapturingQuote()

      expectInsideFreeShipRadius(quote.cheapest.data.distance, freeShipKm, FREE_SHIP_ADDRESS)
    })

    // this case cancels the order itself, but register it anyway so a failure
    // between here and the cancel step does not leak a pending order. The
    // fixture's second call is a harmless no-op once the order is cancelled.
    await orderTest.step('place the order', async () => {
      await checkout.placeOrder()

      createdOrders.push(order.id)
    })

    await orderTest.step('check the order starts out cancellable', async () => {
      await expect(order.statusBadge).toHaveText('Chờ xác nhận')
      await expect(order.cancelOrder).toBeVisible()
      await expect(order.payNow).toBeVisible()
      await expect(order.cancelledBanner).toHaveCount(0)
    })

    // Step 2 - backing out of the dialog must not touch the order. Without this
    // the test would pass even if the trigger cancelled on click.
    await orderTest.step('dismissing the confirm dialog leaves the order alone', async () => {
      await order.cancelOrder.click()
      await expect(order.cancelConfirm).toBeVisible()

      await order.cancelKeep.click()
      await expect(order.cancelConfirm).toBeHidden()

      await expect(order.statusBadge).toHaveText('Chờ xác nhận')
      expect(await getOrderStatus(page, order.id)).toBe('Pending')
    })

    // Step 3 - the transition itself. The detail page does not stay put: on
    // success it toasts and pushes to /orders, so the cancelled order has to be
    // revisited to see what it became.
    const mrcOrderId = order.id
    const orderUrl = order.url

    await orderTest.step('confirm the cancellation and land on the orders list', async () => {
      await order.cancel()

      await expect(order.cancelledToast).toBeVisible()
      await expect(page).toHaveURL(/\/orders$/)
    })

    await orderTest.step('the cancelled order reads as cancelled', async () => {
      await page.goto(orderUrl)

      await expect(order.statusBadge).toHaveText('Đã hủy')

      // a cancelled order can be neither paid nor cancelled again
      await expect(order.payNow).toHaveCount(0)
      await expect(order.cancelOrder).toHaveCount(0)
      await expect(order.section('Thanh toán đơn hàng')).toHaveCount(0)

      await expect(order.cancelledBanner).toBeVisible()
      await expect(order.section('Nhật ký đơn hàng')).toContainText('Đã hủy đơn hàng')
    })

    await orderTest.step('check the cancelled order over the API', async () => {
      const detail = await getOrder(page, mrcOrderId)

      expect(detail.status).toBe('Cancelled')

      // nothing was ever paid, so there is nothing to refund and no ride to book
      expect(detail.transaction).toBeNull()
      expect(detail.ahahaMoveOrderId).toBeFalsy()
      expect(detail.ahahaMoveTrackingUrl).toBeFalsy()

      // the polling endpoint the detail page uses has to agree with the detail one
      expect(await getOrderStatus(page, mrcOrderId)).toBe('Cancelled')
    })

    await orderTest.step('cancelling twice is rejected', async () => {
      const response = await page.request.patch(`/api/v1/orders/${mrcOrderId}/cancel`)

      await expect(response, 'a cancelled order must not be cancellable again').not.toBeOK()

      // the backend folds the status check into the lookup, so a non-Pending order
      // reads as a missing one - 400 rather than the 404 or 409 you would expect
      expect(response.status()).toBe(400)
      expect((await response.json()).detail).toBe('Order not found')

      // and the rejection must not have changed anything
      expect((await getOrder(page, mrcOrderId)).status).toBe('Cancelled')
    })
  }
)
