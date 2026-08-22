import { expect } from '@playwright/test'
import { FREE_SHIP_ADDRESS } from '../fixtures/address'
import { orderTest } from '../fixtures/order'
import { ORDER_NOTE, PRIMARY_PRODUCT } from '../fixtures/products'
import { CartPage } from '../pages/cart.page'
import { CheckoutPage } from '../pages/checkout.page'
import { ProductPage } from '../pages/product.page'
import { CREATE_ORDER_PATH, isPostTo } from '../utils/requests'

/**
 * CO-012 §4 - a failed create-order must cost the customer nothing.
 *
 * Only §4 of CO-012 is implemented. Back-navigation, address re-quoting, the estimate-500
 * path and the retry leg are P2 and remain in COVERAGE-PLAN-v2.md §6.4.
 *
 * `handleConfirmOrder` does its cleanup strictly **after** a successful `createOrder`:
 *
 *   const { mrc_order_id } = await createOrder({ ... })
 *   if (source === 'cart') items.forEach((item) => removeCartItem(item.lineId))
 *   hasSubmittedRef.current = true
 *   clearIntent()
 *   router.push(`/orders/${mrc_order_id}`)
 *
 * so a throw has to leave all four alone. Move any of them above the await - or into a
 * `finally` - and a customer whose order failed loses their basket **and** has no order.
 * That is the worst outcome in the whole flow: they have nothing to retry with.
 *
 * The 500 is produced by intercepting our own `POST /api/v1/orders`. That is legitimate
 * here precisely because it is a transport-level outcome: the stub invents no data, so
 * nothing about pricing is faked (COVERAGE-PLAN-v2.md §1).
 *
 * No order is created - the only submit is the intercepted one.
 */

/**
 * Narrowed to the create-order pathname, and to POST inside the handler: `/api/v1/orders` is
 * also the order-list GET, and the detail poll lives under the same prefix, so anything that
 * is not the create call is passed straight through.
 *
 * Held in a const because `page.unroute` matches its url argument by **identity** - passing
 * an equivalent-looking arrow function would remove nothing and leave the stub armed for the
 * rest of the test.
 */
const isCreateOrderUrl = (url: URL) => url.pathname === CREATE_ORDER_PATH

orderTest.use({ addressSpec: FREE_SHIP_ADDRESS })

orderTest(
  'CO-012 - Tạo đơn thất bại vẫn giữ nguyên giỏ hàng và phiên checkout',
  async ({ authedPage: page, savedAddress }) => {
    orderTest.slow()

    const products = new ProductPage(page)
    const cart = new CartPage(page)
    const checkout = new CheckoutPage(page)

    let createOrderAttempts = 0
    let variantLabel = ''

    await orderTest.step('reach the payment step through the cart', async () => {
      variantLabel = await products.addFixtureToCart(PRIMARY_PRODUCT)

      await cart.goto()
      await expect(cart.line(variantLabel)).toBeVisible()

      await cart.goToCheckout()

      await checkout.pickSavedAddress(savedAddress.receiverName)
      await checkout.setNote(ORDER_NOTE)

      // the estimate is left real: only the create call is being failed
      await checkout.goToPayment()
    })

    await orderTest.step('the create-order call fails', async () => {
      await page.route(isCreateOrderUrl, async (route) => {
        if (route.request().method() !== 'POST') return route.fallback()

        createOrderAttempts++

        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ messageCode: 'DEV_TEST_FORCED_FAILURE', detail: '' })
        })
      })

      // the meaningful synchronisation point is the failed response, not the toast
      const [failedResponse] = await Promise.all([
        page.waitForResponse((response) => isPostTo(CREATE_ORDER_PATH)(response.request())),
        checkout.submitOrder.click()
      ])

      expect(failedResponse.status()).toBe(500)
      expect(createOrderAttempts, 'the create-order route was never hit').toBe(1)

      await expect(checkout.createOrderErrorToast).toBeVisible()

      // no redirect: a customer who has not got an order must not land on an order page
      await expect(page).toHaveURL(/\/checkout$/)

      // same reference the route was armed with, so the stub really is removed
      await page.unroute(isCreateOrderUrl)
    })

    await orderTest.step('the cart still holds the line', async () => {
      await cart.goto()

      await expect(
        cart.line(variantLabel),
        'a failed order emptied the cart - the customer lost their basket and has no order to show for it'
      ).toBeVisible()
      await expect(cart.quantityOf(variantLabel)).toHaveText('1')
    })

    await orderTest.step('the checkout intent survives', async () => {
      await page.goto('/checkout')

      /*
       * `useCheckoutFlow` bounces to /cart whenever the intent is empty, so staying on
       * /checkout is the observable proof that `clearIntent()` did not run. Asserted through
       * the URL and the summary rather than by reading storage.
       */
      await expect(page, 'the intent was cleared by a failed order, so checkout bounced to /cart').toHaveURL(
        /\/checkout$/
      )
      await expect(checkout.sidebar).toContainText(variantLabel)
    })
  }
)
