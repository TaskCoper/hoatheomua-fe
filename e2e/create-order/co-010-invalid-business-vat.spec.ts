import { expect } from '@playwright/test'
import { FREE_SHIP_ADDRESS } from '../fixtures/address'
import { BUSINESS_INVOICE } from '../fixtures/invoice'
import { orderTest } from '../fixtures/order'
import { ORDER_NOTE, PRIMARY_PRODUCT } from '../fixtures/products'
import { CartPage } from '../pages/cart.page'
import { CheckoutPage } from '../pages/checkout.page'
import { OrderPage } from '../pages/order.page'
import { ProductPage } from '../pages/product.page'
import { countPostsTo, CREATE_ORDER_PATH } from '../utils/requests'

/**
 * CO-010 (reduced) - a Business invoice cannot be submitted without its required fields.
 *
 * UT-003 owns the rule matrix: which fields each invoice type requires, and the exact
 * message each one produces. Repeating that here would cost a five-minute browser journey
 * per field to learn what a 5ms schema parse already tells us.
 *
 * What only a browser can answer, and what this case is reduced to:
 *
 * 1. the inline error actually **renders** under `#taxCode` - a schema issue with a correct
 *    `path` still fails the customer if `FieldError` never mounts;
 * 2. **no `POST /api/v1/orders` is fired** - the gate really blocks the submit rather than
 *    merely decorating the form;
 * 3. the gate **re-opens**: once the fields are filled the same button creates an order.
 *
 * `CheckoutPage.placeOrder()` waits for a `/orders/{id}` URL, so it cannot be used for the
 * blocked submit - the raw button is clicked instead. `placeOrder()` neither retries a
 * swallowed click nor counts create-order calls, so the counter below is this spec's own.
 *
 * Order matters in the blocked step, because of the swallowed-first-click race (README open
 * risk #5): the toast and the inline error are asserted **before** the request count, since
 * both only appear once the submit was genuinely processed. A zero-POST assertion on its own
 * would pass just as happily against a click that never landed.
 */

const QUANTITY = 1

// from common.validation.required + orders.checkout.taxCodeLabel; pinned exactly by UT-003
const TAX_CODE_REQUIRED = 'Mã số thuế là bắt buộc.'

orderTest.use({ addressSpec: FREE_SHIP_ADDRESS })

orderTest(
  'CO-010 - Hoá đơn công ty thiếu thông tin bắt buộc',
  async ({ authedPage: page, savedAddress, createdOrders }) => {
    orderTest.slow()

    const products = new ProductPage(page)
    const cart = new CartPage(page)
    const checkout = new CheckoutPage(page)
    const order = new OrderPage(page)

    const createOrders = countPostsTo(page, CREATE_ORDER_PATH)

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

      await checkout.expectImmediateDelivery()

      await checkout.setNote(ORDER_NOTE)
    })

    // the Ahamove quote still has to land, or the submit button never enables and the
    // blocked-submit assertion below would pass for the wrong reason
    await orderTest.step('continue to payment', async () => {
      await checkout.goToPayment()
    })

    await orderTest.step('turn the invoice on and pick Business', async () => {
      await checkout.enableInvoice()

      await checkout.businessTab.click()
      await expect(checkout.businessTab).toHaveAttribute('data-state', 'active')

      // nothing typed yet, so nothing can have errored yet
      await expect(checkout.fieldError('taxCode')).toHaveCount(0)
    })

    await orderTest.step('submitting with the required fields empty is blocked', async () => {
      // the button is enabled: this is a validation gate, not a disabled control
      await expect(checkout.submitOrder).toBeEnabled()

      await checkout.submitOrder.click()

      await expect(checkout.validationToast).toBeVisible()
      await expect(checkout.fieldError('taxCode')).toHaveText(TAX_CODE_REQUIRED)

      // the assertion that matters: the gate blocks the request, it does not merely
      // decorate the form afterwards
      expect(createOrders.count, 'an invalid invoice must not reach the create-order endpoint').toBe(0)

      await expect(page).toHaveURL(/\/checkout$/)
    })

    await orderTest.step('filling the fields re-opens the gate', async () => {
      await checkout.fillBusinessInvoice(BUSINESS_INVOICE)

      await expect(checkout.fieldError('taxCode')).toHaveCount(0)

      await checkout.placeOrder()

      // register cleanup before any assertion can throw
      createdOrders.push(order.id)

      expect(createOrders.count, 'the recovered submit must create exactly one order').toBe(1)
    })
  }
)
