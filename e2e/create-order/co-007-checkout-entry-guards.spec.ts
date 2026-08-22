import { expect } from '@playwright/test'
import { getOrder } from '../api/orders.api'
import { FREE_SHIP_ADDRESS } from '../fixtures/address'
import { orderTest } from '../fixtures/order'
import { ORDER_NOTE, PRIMARY_PRODUCT, SECONDARY_PRODUCT } from '../fixtures/products'
import { CartPage } from '../pages/cart.page'
import { CheckoutPage } from '../pages/checkout.page'
import { OrderPage } from '../pages/order.page'
import { ProductPage } from '../pages/product.page'
import { dismissPromoPopup } from '../utils/promo-popup'

/**
 * CO-007 §3 - buying now must not touch the cart.
 *
 * Only §3 of CO-007 is implemented. The other sub-cases (empty-intent redirect, buy-now
 * entry, cancel-booking targets, post-order revisit, phone-less gate) are P2 and remain in
 * COVERAGE-PLAN-v2.md §6.4.
 *
 * `useCheckoutFlow` removes the ordered lines from the cart only when the intent came from
 * the cart:
 *
 *   if (source === 'cart') { items.forEach((item) => removeCartItem(item.lineId)) }
 *
 * Drop that guard and a buy-now purchase starts deleting cart lines the customer never
 * agreed to buy. It is silent, and the customer only finds out later.
 *
 * **Why the buy-now product is also put in the cart.** A buy-now item's lineId is
 * `buildLineId(productId, null, {})` - byte-for-byte what `handleAddToCart` computes for the
 * same product. So if the guard were removed, `removeCartItem(buyNowLineId)` would delete
 * *that product's cart line*. Buying a product that is **not** in the cart would make the
 * removal a silent no-op and this case would pass against the broken code. Two lines are
 * therefore loaded:
 *
 *   - SECONDARY - the same product bought via buy-now, so its lineId collides. This is the
 *     line that disappears if the `source` guard is dropped.
 *   - PRIMARY variant 0 - genuinely unrelated. This is the line that disappears if checkout
 *     clears the cart wholesale.
 *
 * Distinct from CO-006, which proves that a **cart**-sourced order removes exactly the
 * ordered lines. This proves a **buy-now**-sourced order removes nothing at all.
 */

orderTest.use({ addressSpec: FREE_SHIP_ADDRESS })

orderTest(
  'CO-007 - Mua ngay không làm thay đổi giỏ hàng',
  async ({ authedPage: page, savedAddress, createdOrders }) => {
    orderTest.slow()

    const products = new ProductPage(page)
    const cart = new CartPage(page)
    const checkout = new CheckoutPage(page)
    const order = new OrderPage(page)

    let unrelatedLineLabel = ''

    await orderTest.step('load the cart with an unrelated line', async () => {
      await products.search(PRIMARY_PRODUCT.searchTerm)
      await products.open(PRIMARY_PRODUCT.name, PRIMARY_PRODUCT.id)

      unrelatedLineLabel = await products.selectVariantAt(0)
      await products.addToCart()
    })

    await orderTest.step('put the buy-now product in the cart too', async () => {
      // same product that will be bought below, so its cart lineId matches the buy-now one
      await products.addFixtureToCart(SECONDARY_PRODUCT)

      await cart.goto()
      await expect(cart.line(unrelatedLineLabel)).toBeVisible()
      await expect(cart.line(SECONDARY_PRODUCT.name)).toBeVisible()
    })

    await orderTest.step('buy the second product directly, bypassing the cart', async () => {
      await page.goto(`/products/${SECONDARY_PRODUCT.id}`)

      await dismissPromoPopup(page)

      /*
       * A cold load, deliberately: `handleBuyNow` needs a phone number on the account, which
       * resolves from `GET /api/taskcoper/v1/users/{slug}` after hydration.
       *
       * `buyNow()` waits for the button to be enabled, and that wait is only meaningful
       * because `isBuyNowDisabled` includes the phone query's loading state. Before that
       * fix the button was clickable during the window, and clicking it toasted
       * `contactMissing` and never navigated - which is how this step originally failed.
       */
      await products.buyNow()
    })

    await orderTest.step('complete the buy-now checkout', async () => {
      await checkout.pickSavedAddress(savedAddress.receiverName)
      await checkout.setNote(ORDER_NOTE)

      // the buy-now intent carries one line and nothing from the cart
      await expect(checkout.sidebar).toContainText(SECONDARY_PRODUCT.name)
      await expect(checkout.sidebar, 'a cart line leaked into a buy-now checkout').not.toContainText(unrelatedLineLabel)

      await checkout.goToPayment()

      await checkout.placeOrder()

      // register cleanup before any assertion can throw
      createdOrders.push(order.id)
    })

    await orderTest.step('the order holds only the bought line', async () => {
      const detail = await getOrder(page, order.id)

      expect(detail.details, 'a buy-now order must carry exactly the one line bought').toHaveLength(1)
      expect(detail.details[0].name).toBe(SECONDARY_PRODUCT.name)
    })

    /*
     * The regression detector. Both lines have to survive, and each one catches a different
     * bug:
     *
     * - SECONDARY shares its lineId with the buy-now item, so it goes if the `source` guard
     *   is dropped;
     * - the PRIMARY variant is unrelated, so it goes if checkout clears the cart wholesale.
     */
    await orderTest.step('the cart is exactly as it was left', async () => {
      await cart.goto()

      await expect(
        cart.line(SECONDARY_PRODUCT.name),
        'the buy-now purchase removed the matching cart line - the source guard is gone'
      ).toBeVisible()
      await expect(cart.quantityOf(SECONDARY_PRODUCT.name)).toHaveText('1')

      await expect(
        cart.line(unrelatedLineLabel),
        'the buy-now purchase removed an unrelated cart line - checkout is clearing the whole cart'
      ).toBeVisible()
      await expect(cart.quantityOf(unrelatedLineLabel)).toHaveText('1')
    })
  }
)
