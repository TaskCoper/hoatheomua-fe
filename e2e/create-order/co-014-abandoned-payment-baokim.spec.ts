import { expect } from '@playwright/test'
import { getOrder, getOrderStatus } from '../api/orders.api'
import { FREE_SHIP_ADDRESS } from '../fixtures/address'
import { orderTest } from '../fixtures/order'
import { ORDER_NOTE, PRIMARY_PRODUCT } from '../fixtures/products'
import { CartPage } from '../pages/cart.page'
import { CheckoutPage } from '../pages/checkout.page'
import { OrderPage } from '../pages/order.page'
import { ProductPage } from '../pages/product.page'
import { countRequests, isOrderStatusPoll } from '../utils/requests'

/**
 * CO-014 - a payment that is started and never finished.
 *
 * The original spec called this "BaoKim payment failure", which the system
 * cannot express: `Order.Status` is a plain string and only ever holds Pending,
 * Paid or Cancelled. There is no Failed, no Expired, and nothing ages a stale
 * Pending order out - so a failed payment, an abandoned one and one the customer
 * has not got round to yet are the same state.
 *
 * What is actually worth asserting, then, is that nothing happens: the order
 * does not drift to Paid on its own, no transaction appears, no Ahamove ride is
 * booked, and the customer keeps both the pay and the cancel affordances. The
 * one thing that must keep moving is the 5s status poll, because that is what
 * would flip the page over if the payment did land.
 *
 * The customer is sent to the gateway and comes straight back without paying,
 * which is as close to an abandoned payment as a test can get without a card.
 */

/**
 * How many of the detail page's own 5s status polls have to go by before "nothing moved" is
 * more than a single reading. Three is ~15s of real observation; the wait below is driven by
 * the poll count rather than by a sleep, so a page that stopped polling fails on time rather
 * than passing quietly.
 */
const OBSERVED_POLLS = 3

orderTest.use({ addressSpec: FREE_SHIP_ADDRESS })

orderTest(
  'CO-014 - Đơn bỏ dở thanh toán vẫn giữ nguyên trạng thái chờ',
  async ({ authedPage: page, savedAddress, createdOrders }) => {
    orderTest.slow()

    const products = new ProductPage(page)
    const cart = new CartPage(page)
    const checkout = new CheckoutPage(page)
    const order = new OrderPage(page)

    const statusPolls = countRequests(page, isOrderStatusPoll)

    let variantLabel = ''

    await orderTest.step('create a pending BaoKim order', async () => {
      variantLabel = await products.addFixtureToCart(PRIMARY_PRODUCT)

      await cart.goto()
      await expect(cart.line(variantLabel)).toBeVisible()

      await cart.goToCheckout()

      await checkout.pickSavedAddress(savedAddress.receiverName)
      await checkout.setNote(ORDER_NOTE)

      await checkout.goToPaymentCapturingQuote()

      await checkout.placeOrder()

      createdOrders.push(order.id)
    })

    const mrcOrderId = order.id

    // Step 1 - the handoff exists and is the customer's only route to paying
    let paymentUrl = ''

    await orderTest.step('the gateway handoff is offered', async () => {
      await expect(order.statusBadge).toHaveText('Chờ xác nhận')

      const detail = await getOrder(page, mrcOrderId)
      expect(detail.paymentUrl, 'a BaoKim order without a paymentUrl cannot be paid at all').toBeTruthy()

      paymentUrl = detail.paymentUrl as string

      await expect(order.payNow).toBeVisible()
      await expect(order.payNow.locator('xpath=ancestor::a[1]')).toHaveAttribute('href', paymentUrl)
    })

    // Step 2 - leave for the gateway and come back without paying. The gateway is
    // a third party, so this only opens its page and abandons it; what matters is
    // that returning to the order changes nothing.
    await orderTest.step('visit the gateway and abandon it', async () => {
      const gatewayPage = await page.context().newPage()

      try {
        await gatewayPage.goto(paymentUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 })
      } catch {
        // the gateway being slow or unreachable is not this test's subject - the
        // order must be untouched either way, which the next step asserts
      } finally {
        await gatewayPage.close()
      }

      await page.reload()
      await expect(order.statusBadge).toHaveText('Chờ xác nhận')
    })

    // Step 3 - the actual assertion: nothing moves on its own
    await orderTest.step('the order stays pending while nothing pays it', async () => {
      const pollsBefore = statusPolls.count
      const observed = new Set<string>()

      /*
       * The observation window is driven by the page's own poll rather than by a sleep.
       *
       * `useGetOrderStatus` refetches every 5s while the order is Pending, and that poll is
       * what would flip the page over if a payment landed - so a regression that silences it
       * strands the customer on a stale page forever. Waiting for three of them is both the
       * assertion and the clock.
       *
       * Each round also reads the status from the server, so "it stayed Pending" is several
       * independent readings rather than one lucky sample.
       */
      await expect
        .poll(
          async () => {
            observed.add(await getOrderStatus(page, mrcOrderId))

            return statusPolls.count - pollsBefore
          },
          {
            timeout: 40_000,
            intervals: [2_000],
            message: 'the detail page stopped polling GET /orders/{id}/status while the order was still Pending'
          }
        )
        .toBeGreaterThanOrEqual(OBSERVED_POLLS)

      expect([...observed], 'an unpaid order became something other than Pending').toEqual(['Pending'])
    })

    await orderTest.step('nothing was recorded, charged or dispatched', async () => {
      const detail = await getOrder(page, mrcOrderId)

      expect(detail.status).toBe('Pending')

      // the transaction row is written by the webhook and by nothing else, so a
      // non-null one here would mean the order was credited without a payment
      expect(detail.transaction).toBeNull()

      // dispatch is part of the same write as the Paid flip, so an unpaid order
      // must never have a ride booked - that would be a delivery nobody paid for
      expect(detail.ahahaMoveOrderId).toBeFalsy()
      expect(detail.ahahaMoveTrackingUrl).toBeFalsy()
      await expect(order.section('Theo dõi đơn hàng')).toHaveCount(0)

      // and the timeline must not claim a payment that never happened
      await expect(order.section('Nhật ký đơn hàng')).not.toContainText('Xác nhận thanh toán')
      await expect(order.section('Thông tin chuyển khoản')).toHaveCount(0)

      // the customer keeps both ways out: pay it or cancel it
      await expect(order.payNow).toBeVisible()
      await expect(order.cancelOrder).toBeVisible()
    })
  }
)
