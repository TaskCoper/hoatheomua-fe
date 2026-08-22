import { expect } from '@playwright/test'
import { getOrder } from '../api/orders.api'
import { FREE_SHIP_ADDRESS } from '../fixtures/address'
import { BUSINESS_INVOICE, PERSONAL_INVOICE } from '../fixtures/invoice'
import { orderTest } from '../fixtures/order'
import { ORDER_NOTE, PRIMARY_PRODUCT } from '../fixtures/products'
import { CartPage } from '../pages/cart.page'
import { CheckoutPage } from '../pages/checkout.page'
import { OrderPage } from '../pages/order.page'
import { ProductPage } from '../pages/product.page'
import { countPostsTo, CREATE_ORDER_PATH, waitForCreateOrderRequest } from '../utils/requests'

/**
 * CO-009 - switching invoice type clears the branch being left.
 *
 * Regression cover for the 2026-08-19 fix. Before it, the `invoiceType` tab was a bare
 * `field.onChange`: fill a Business tax code, switch to Personal, and the tax code survived
 * in form state. `hasTaxCode` (`checkout-client.tsx:120`) stayed true, the sidebar showed a
 * VAT 8% row on a Personal invoice, and the server charged the 8% because it keys VAT off
 * the tax code rather than the invoice type. The customer was shown, and billed, VAT on an
 * invoice type that carries none.
 *
 * UT-001 already proves `buildCheckoutPayload` filters by `invoiceType`. That is a different
 * contract: it takes form state as given. This case proves the *form* can only reach the
 * right states in the first place - which is the half the fix actually changed, and the half
 * a payload unit test cannot see.
 *
 * **What actually detects a regression here.** The fix has three layers, and layers 2
 * (`payloads.ts` filters by `invoiceType`) and 3 (`hasTaxCode` also requires Business) mask
 * every downstream signal of a stale value:
 *
 * - the sidebar VAT row disappears on the Personal tab whether or not `taxCode` was cleared;
 * - the POST body carries `taxCode: null` for a Personal invoice whether or not it was
 *   cleared;
 * - neither branch's inputs exist in the DOM while the other tab is active.
 *
 * So the only true detector is to **remount the input and read the value back** - which
 * means visiting the tab that owns each field *after* leaving it:
 *
 * - Personal -> Business clears `identityNumber` / `receiptFullName` / `receiptAddress`,
 *   proven on the way back to Personal (step 5);
 * - Business -> Personal clears `taxCode`, proven by returning to Business (step 6).
 *
 * The sidebar and payload assertions are kept, but as secondary cover for layers 2 and 3.
 * They are not what fails when layer 1 breaks.
 *
 * `receiptEmail` / `receiptPhoneNumber` are deliberately expected to **survive** a tab
 * switch: both invoice types require them (`validations.ts:89-90`, `:95-96`) and both send
 * them, so carrying them across is correct data rather than a leak. They are typed exactly
 * once, on the first visit to the Personal tab, and never retyped - so the order that comes
 * out at the end proves they were preserved the whole way through.
 *
 * No delivery scheduling and a free-ship address: this case is about invoice state, and
 * everything else is kept at CO-001's values so a failure here can only be the invoice.
 */

const QUANTITY = 1

orderTest.use({ addressSpec: FREE_SHIP_ADDRESS })

orderTest(
  'CO-009 - Đổi loại hoá đơn xoá dữ liệu của loại vừa rời đi',
  async ({ authedPage: page, savedAddress, createdOrders }) => {
    orderTest.slow()

    const products = new ProductPage(page)
    const cart = new CartPage(page)
    const checkout = new CheckoutPage(page)
    const order = new OrderPage(page)

    const createOrders = countPostsTo(page, CREATE_ORDER_PATH)

    // Step 1 - see addressTest at e2e/fixtures/address.ts

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

      // immediate delivery, as CO-001
      await checkout.expectImmediateDelivery()

      await checkout.setNote(ORDER_NOTE)
    })

    await orderTest.step('continue to payment', async () => {
      await checkout.goToPayment()
    })

    // Step 2 - the switch lands on Cá nhân, so this is the branch that gets filled first
    await orderTest.step('fill every Personal invoice field', async () => {
      await checkout.enableInvoice()

      await checkout.fillPersonalInvoice(PERSONAL_INVOICE)

      await expect(checkout.identityNumber).toHaveValue(PERSONAL_INVOICE.identityNumber)
      await expect(checkout.receiptFullName).toHaveValue(PERSONAL_INVOICE.fullName)
      await expect(checkout.receiptAddress).toHaveValue(PERSONAL_INVOICE.address)

      // no tax code exists on this tab, so no VAT can be previewed yet
      await expect(checkout.taxCode).toHaveCount(0)
      await expect(checkout.sidebarRow('VAT 8%')).toHaveCount(0)
    })

    // Step 3 - leaving Cá nhân has to clear what only Cá nhân owns
    const subtotal = await checkout.sidebarAmount('Tạm tính')

    await orderTest.step('switch to Business', async () => {
      await checkout.businessTab.click()
      await expect(checkout.businessTab).toHaveAttribute('data-state', 'active')

      // the Personal-only inputs are unmounted by the invoiceType guard, so their
      // values can only be read back on the way home - step 5 does that
      await expect(checkout.identityNumber).toHaveCount(0)
      await expect(checkout.receiptFullName).toHaveCount(0)
      await expect(checkout.receiptAddress).toHaveCount(0)

      // arriving on a branch never visited, the tax code must start empty
      await expect(checkout.taxCode).toHaveValue('')

      // shared by both types, so a switch must not make the customer retype them
      await expect(checkout.receiptEmail).toHaveValue(PERSONAL_INVOICE.email)
      await expect(checkout.receiptPhoneNumber).toHaveValue(PERSONAL_INVOICE.phoneNumber)

      // an empty tax code is still no VAT
      await expect(checkout.sidebarRow('VAT 8%')).toHaveCount(0)
    })

    // Step 4 - a Business tax code is what turns the VAT row on
    await orderTest.step('enter a tax code and see VAT appear', async () => {
      await checkout.taxCode.fill(BUSINESS_INVOICE.taxCode)

      expect(await checkout.sidebarAmount('VAT 8%')).toBe(Math.round(subtotal * 0.08))
    })

    // Step 5 - PRIMARY DETECTOR for the Personal -> Business direction. The three
    // Personal-only inputs are unmounted while Business is active, so returning here is the
    // only place their cleared values can be read back.
    await orderTest.step('switch back to Personal', async () => {
      await checkout.personalTab.click()
      await expect(checkout.personalTab).toHaveAttribute('data-state', 'active')

      // cleared on the way out in step 3, and they must not come back
      await expect(checkout.identityNumber).toHaveValue('')
      await expect(checkout.receiptFullName).toHaveValue('')
      await expect(checkout.receiptAddress).toHaveValue('')

      // still never retyped
      await expect(checkout.receiptEmail).toHaveValue(PERSONAL_INVOICE.email)
      await expect(checkout.receiptPhoneNumber).toHaveValue(PERSONAL_INVOICE.phoneNumber)

      /*
       * Secondary, and deliberately not relied on: `hasTaxCode` also requires
       * `invoiceType === Business` (checkout-client.tsx:120), so the VAT row disappears on
       * this tab whether or not the tax code was actually cleared. It asserts the sidebar
       * renders correctly; it cannot detect a clearing regression. Same for
       * `taxCode` being absent from the DOM - the input simply is not on this tab.
       */
      await expect(checkout.sidebarRow('VAT 8%')).toHaveCount(0)
      await expect(checkout.taxCode).toHaveCount(0)
    })

    // Step 6 - PRIMARY DETECTOR for the Business -> Personal direction.
    //
    // Every downstream signal for a surviving taxCode is masked: the input is unmounted on
    // the Personal tab, the VAT row is gated on invoiceType, and `buildCheckoutPayload`
    // nulls taxCode for a non-Business invoice regardless of form state. So a stale taxCode
    // is only observable by remounting the input that renders it.
    await orderTest.step('return to Business to prove the tax code was cleared', async () => {
      await checkout.businessTab.click()
      await expect(checkout.businessTab).toHaveAttribute('data-state', 'active')

      await expect(
        checkout.taxCode,
        'leaving the Business tab must clear taxCode - a stale one makes the server charge 8% VAT on a Personal invoice'
      ).toHaveValue('')

      // and the shared fields have now survived three switches without being retyped
      await expect(checkout.receiptEmail).toHaveValue(PERSONAL_INVOICE.email)
      await expect(checkout.receiptPhoneNumber).toHaveValue(PERSONAL_INVOICE.phoneNumber)
    })

    // Step 7 - back to Personal for the order itself, refilling only what was cleared so the
    // email and phone that reach the wire are the ones typed once in step 2
    let checkoutPayload: Record<string, unknown> = {}

    await orderTest.step('refill the Personal fields and place the order', async () => {
      await checkout.personalTab.click()
      await expect(checkout.personalTab).toHaveAttribute('data-state', 'active')

      await checkout.identityNumber.fill(PERSONAL_INVOICE.identityNumber)
      await checkout.receiptFullName.fill(PERSONAL_INVOICE.fullName)
      await checkout.receiptAddress.fill(PERSONAL_INVOICE.address)

      const createRequest = waitForCreateOrderRequest(page)

      await checkout.placeOrder()

      // register cleanup before any assertion can throw
      createdOrders.push(order.id)

      checkoutPayload = (await createRequest).postDataJSON()
    })

    await orderTest.step('check the create-order request body', async () => {
      expect(checkoutPayload).toMatchObject({
        isExportInvoice: true,
        invoiceType: 'Personal',
        // secondary: `buildCheckoutPayload` nulls this for any non-Business invoice, so it
        // guards layer 2 rather than the form clearing. Step 6 is what proves the clear.
        taxCode: null,
        identityNumber: PERSONAL_INVOICE.identityNumber,
        receiptFullName: PERSONAL_INVOICE.fullName,
        receiptAddress: PERSONAL_INVOICE.address,
        // carried across two tab switches without being retyped
        receiptEmail: PERSONAL_INVOICE.email,
        receiptPhoneNumber: PERSONAL_INVOICE.phoneNumber,
        remarks: ORDER_NOTE
      })
    })

    await orderTest.step('check the created order over the API', async () => {
      const detail = await getOrder(page, order.id)

      expect(detail.invoiceType).toBe('Personal')
      expect(detail.taxCode).toBeNull()
      // the server charges VAT whenever a tax code is present, so a null tax code is the
      // only thing standing between this customer and an 8% they never agreed to
      expect(detail.vatFee, 'a Personal invoice must not be charged VAT').toBe(0)
      expect(detail.totalFee).toBe(detail.productFee + detail.shippingFee)

      await expect(order.row('VAT 8%')).toHaveCount(0)

      expect(createOrders.count, 'a single submit must create a single order').toBe(1)
    })
  }
)
