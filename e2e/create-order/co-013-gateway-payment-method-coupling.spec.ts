import { expect } from '@playwright/test'
import { FREE_SHIP_ADDRESS } from '../fixtures/address'
import { orderTest } from '../fixtures/order'
import { PRIMARY_PRODUCT } from '../fixtures/products'
import { CartPage } from '../pages/cart.page'
import { CheckoutPage } from '../pages/checkout.page'
import { ProductPage } from '../pages/product.page'

/**
 * CO-013 - the gateway and the payment method stay coupled.
 *
 * `GatewayPaymentMethods` binds BaoKim to method 1 (VA) and SePay to method 6
 * (VNPay QR), and `handleGatewayChange` rewrites the selection on every switch
 * (`checkout-client.tsx`). Getting this wrong ships a paymentMethod the chosen
 * gateway does not offer, which the backend accepts without complaint - its
 * create-order DTO takes any PaymentMethod value and never cross-checks it
 * against Gateway.
 *
 * This lived inside CO-004 until that case moved to BaoKim. It is separated
 * rather than deleted because it is pure client-side logic, so it still earns
 * its keep while the SePay webhook is broken, and it needs no order at all.
 *
 * No order is created: the coupling is a rendering rule, so there is nothing to
 * submit.
 */

orderTest.use({ addressSpec: FREE_SHIP_ADDRESS })

orderTest(
  'CO-013 - Phương thức thanh toán luôn đi theo cổng thanh toán',
  async ({ authedPage: page, savedAddress }) => {
    orderTest.slow()

    const products = new ProductPage(page)
    const cart = new CartPage(page)
    const checkout = new CheckoutPage(page)

    let variantLabel = ''

    await orderTest.step('reach the payment step', async () => {
      variantLabel = await products.addFixtureToCart(PRIMARY_PRODUCT)

      await cart.goto()
      await expect(cart.line(variantLabel)).toBeVisible()

      await cart.goToCheckout()

      await checkout.pickSavedAddress(savedAddress.receiverName)

      // the quote has to land or the payment step never settles, which is what the helper
      // asserts - nothing here depends on the fee itself
      await checkout.goToPaymentCapturingQuote()
    })

    await orderTest.step('BaoKim is the default and offers VA only', async () => {
      await expect(checkout.gateway('BaoKim')).toBeChecked()
      await expect(checkout.gateway('Sepay')).not.toBeChecked()

      await expect(checkout.paymentMethodRadio('1')).toBeChecked()
      await expect(checkout.paymentMethodRadio('6')).toHaveCount(0)
    })

    await orderTest.step('switching to SePay moves the selection to VNPay QR', async () => {
      await checkout.selectGateway('Sepay')

      // GatewayPaymentMethods.Sepay is [6], so VA is not rendered at all - and
      // handleGatewayChange has to have moved the selection off it rather than
      // leaving it pointing at a method that is no longer on screen
      await expect(checkout.paymentMethodRadio('6')).toBeChecked()
      await expect(checkout.paymentMethodRadio('1')).toHaveCount(0)
    })

    await orderTest.step('switching back to BaoKim returns the selection to VA', async () => {
      await checkout.selectGateway('BaoKim')

      // the coupling has to work in both directions: a selection stranded on 6
      // would be sent with gateway BaoKim, and the backend would take it
      await expect(checkout.paymentMethodRadio('1')).toBeChecked()
      await expect(checkout.paymentMethodRadio('6')).toHaveCount(0)
    })

    // Nothing is submitted. The coupling is a rendering-and-state rule, and the
    // cases that place orders (CO-001..CO-004, CO-005) all leave the gateway
    // where they found it - so an order created here would only be one more row
    // to clean up.
  }
)
