import { expect } from '@playwright/test'
import { FREE_SHIP_ADDRESS } from '../fixtures/address'
import { PERSONAL_INVOICE } from '../fixtures/invoice'
import { orderTest } from '../fixtures/order'
import { ORDER_NOTE, PRIMARY_PRODUCT } from '../fixtures/products'
import { CartPage } from '../pages/cart.page'
import { CheckoutPage } from '../pages/checkout.page'
import { OrderPage } from '../pages/order.page'
import { ProductPage } from '../pages/product.page'
import { countPostsTo, CREATE_ORDER_PATH } from '../utils/requests'

/**
 * CO-011 (reduced) - a Personal invoice cannot be submitted without its required fields.
 *
 * The mirror of CO-010 on the branch with more surface: Personal requires five fields to
 * Business's three (`validations.ts:91-97`).
 *
 * Scope, deliberately narrow:
 *
 * - **UT-003** owns which fields are required and what each message says. The per-field loop
 *   the original plan wanted here lives there, where five cases cost 5ms instead of five
 *   browser journeys.
 * - **CO-009** owns what a Personal invoice puts on the wire and what the server does with
 *   it - the payload's `invoiceType`/`taxCode` and the order's `vatFee: 0`. This case does
 *   not repeat any of it.
 *
 * What is left, and what only a browser proves: the inline error renders, the submit is
 * genuinely blocked (zero `POST /api/v1/orders`), and the gate re-opens once the fields are
 * filled.
 *
 * The Personal tab is asserted active rather than clicked - `enableInvoice()` already lands
 * there (`invoice-fields.tsx:107`), so a changed default surfaces here rather than as a
 * confusing validation failure later.
 *
 * As in CO-010, the toast and the inline error are asserted **before** the request count:
 * both only appear once the submit was genuinely processed, so they are what tells a real
 * block apart from the swallowed first click of README open risk #5.
 */

const QUANTITY = 1

// from common.validation.required + orders.checkout.identityNumber; pinned exactly by UT-003
const IDENTITY_REQUIRED = 'CCCD/CMND là bắt buộc.'

orderTest.use({ addressSpec: FREE_SHIP_ADDRESS })

orderTest(
  'CO-011 - Hoá đơn cá nhân thiếu thông tin bắt buộc',
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

    await orderTest.step('continue to payment', async () => {
      await checkout.goToPayment()
    })

    await orderTest.step('turn the invoice on and stay on Personal', async () => {
      // enableInvoice already asserts the tab lands on Cá nhân; this is the branch under test
      await checkout.enableInvoice()

      await expect(checkout.identityNumber).toBeVisible()
      await expect(checkout.taxCode).toHaveCount(0)
      await expect(checkout.fieldError('identityNumber')).toHaveCount(0)
    })

    await orderTest.step('submitting with the required fields empty is blocked', async () => {
      await expect(checkout.submitOrder).toBeEnabled()

      await checkout.submitOrder.click()

      await expect(checkout.validationToast).toBeVisible()
      await expect(checkout.fieldError('identityNumber')).toHaveText(IDENTITY_REQUIRED)

      expect(createOrders.count, 'an invalid invoice must not reach the create-order endpoint').toBe(0)

      await expect(page).toHaveURL(/\/checkout$/)
    })

    await orderTest.step('filling the fields re-opens the gate', async () => {
      await checkout.fillPersonalInvoice(PERSONAL_INVOICE)

      await expect(checkout.fieldError('identityNumber')).toHaveCount(0)

      await checkout.placeOrder()

      // register cleanup before any assertion can throw
      createdOrders.push(order.id)

      expect(createOrders.count, 'the recovered submit must create exactly one order').toBe(1)
    })
  }
)
