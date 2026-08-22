import { expect } from '@playwright/test'
import { FREE_SHIP_ADDRESS } from '../fixtures/address'
import { orderTest } from '../fixtures/order'
import { ORDER_NOTE, PRIMARY_PRODUCT } from '../fixtures/products'
import { CartPage } from '../pages/cart.page'
import { CheckoutPage } from '../pages/checkout.page'
import { ProductPage } from '../pages/product.page'
import { PUBLIC_CONFIGS_PATH } from '../utils/requests'

/**
 * CO-008 - what a customer inside the free-ship radius is shown when the threshold config
 * cannot be read.
 *
 * `checkout-client.tsx` derives the whole waiver from one number fetched at runtime:
 *
 *   const freeShipKm = Number(ahamoveConfigs.find((c) => c.key === 'ahamove.free_ship')?.value.value)
 *   const isFreeShip = freeShipKm >= 0 && distanceKm >= 0 && distanceKm <= freeShipKm
 *
 * If that config is missing, `Number(undefined)` is `NaN`; if it is present but not numeric,
 * `Number('...')` is `NaN`. Either way `NaN >= 0` is **false**, so `isFreeShip` is false and
 * the full Ahamove fee is charged - with no error, no toast and no fallback. The failure is
 * silent and it lands on the customer.
 *
 * This is a **KNOWN GAP pin, not an endorsement.** It records what the code does today so
 * the behaviour is visible in the suite rather than folklore. If a fallback is ever added,
 * this spec fails and should be rewritten to assert the waiver survives.
 *
 * The control is CO-001, which walks the identical path with the real config and asserts the
 * mirror image: the discount row is present and the total excludes shipping.
 *
 * No order is created - the divergence is fully observable at the sidebar, and creating one
 * would prove something else. See the note at the bottom on what the *server* does.
 */

/**
 * The one request this spec replaces: the ahamove config group, and nothing else.
 *
 * A URL predicate rather than a glob, because the app reads several groups through this same
 * path and a pattern loose enough to catch this one would stub all of them.
 */
const isAhamoveConfigRequest = (url: URL) =>
  url.pathname === PUBLIC_CONFIGS_PATH && url.searchParams.get('groupName') === 'ahamove'

/**
 * Two ways the same `NaN` is reached. They take different paths through the expression -
 * `find()` returning undefined versus a present-but-unparseable value - and both are
 * plausible in production: a renamed key, a purged config row, or an admin typing into a
 * field the UI treats as free text.
 */
const CONFIG_FAILURES = [
  { label: 'nhóm cấu hình ahamove rỗng', configs: [] },
  {
    label: 'ngưỡng miễn phí ship không phải là số',
    configs: [
      {
        id: 'dev-test-config',
        key: 'ahamove.free_ship',
        group: 'ahamove',
        isPublic: true,
        // the real shape, with only the inner `value` corrupted
        value: {
          group: 'ahamove',
          label: 'Miễn phí ship (km)',
          value: 'DEV TEST not-a-number',
          options: [],
          required: true,
          inputType: 'number',
          description: 'tính theo km',
          validations: []
        },
        kind: 'setting'
      }
    ]
  }
]

orderTest.use({ addressSpec: FREE_SHIP_ADDRESS })

for (const { label, configs } of CONFIG_FAILURES) {
  orderTest(
    `CO-008 - Mất cấu hình ngưỡng miễn phí ship (KNOWN GAP): ${label}`,
    async ({ authedPage: page, savedAddress }) => {
      orderTest.slow()

      const products = new ProductPage(page)
      const cart = new CartPage(page)
      const checkout = new CheckoutPage(page)

      // counted inside the handler, not from a request listener: this has to prove the *stub*
      // ran, and a predicate that never matched would still see the real request go past
      let configStubHits = 0

      // armed before the journey, because CheckoutClient reads the config on mount
      await page.route(isAhamoveConfigRequest, async (route) => {
        configStubHits++

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ value: configs, isSuccess: true, isFailed: false, error: null })
        })
      })

      let variantLabel = ''

      await orderTest.step('filter products and add to cart', async () => {
        variantLabel = await products.addFixtureToCart(PRIMARY_PRODUCT)
      })

      await orderTest.step('go to checkout through the cart', async () => {
        await cart.goto()
        await expect(cart.line(variantLabel)).toBeVisible()

        await cart.goToCheckout()
      })

      await orderTest.step('choose the in-radius saved address', async () => {
        await checkout.pickSavedAddress(savedAddress.receiverName)

        await checkout.expectImmediateDelivery()

        await checkout.setNote(ORDER_NOTE)
      })

      // the quote is real: Ahamove is not the subject here, the config read is
      let rawShippingFee = 0

      await orderTest.step('continue to payment and capture the quote', async () => {
        const quote = await checkout.goToPaymentCapturingQuote()

        rawShippingFee = quote.cheapest.data.total_fee

        expect(
          rawShippingFee,
          'Ahamove quoted 0 for the fixture address, so a missing waiver would be invisible'
        ).toBeGreaterThan(0)
      })

      await orderTest.step('the waiver is silently lost', async () => {
        expect(configStubHits, 'the config route was never hit - the predicate does not match').toBeGreaterThan(0)

        const subtotal = await checkout.sidebarAmount('Tạm tính')

        // charged in full, exactly as if the address were outside the radius
        expect(await checkout.sidebarAmount('Phí vận chuyển')).toBe(rawShippingFee)

        /*
         * The gap, in one assertion. CO-001 walks this same address with the real config and
         * asserts this row reads -rawShippingFee. Here it does not render at all: `NaN >= 0`
         * is false, so `shippingDiscount` stays 0 and the row is conditional on it.
         */
        await expect(
          checkout.sidebarRow('Giảm giá (bán kính miễn phí ship)'),
          'the free-ship discount survived a broken config - if a fallback was added, rewrite this spec'
        ).toHaveCount(0)

        // and the customer is asked for the shipping they should not have been charged
        expect(await checkout.sidebarTotalAmount()).toBe(subtotal + rawShippingFee)

        // no error surfaces anywhere: the config query has no `throwOnError`, and a NaN
        // threshold is indistinguishable from a legitimate out-of-radius quote
        await expect(checkout.validationToast).toHaveCount(0)
      })

      /*
       * Deliberately not asserted: what the **server** would charge.
       *
       * The server reads the same config from its own side
       * (`Order/Service.cs` - `ahamoveConfigs.GetValue("ahamove.free_ship", 0)`), which this
       * browser-side intercept cannot reach. With the real config intact server-side it would
       * still compute 0 for this address, so the customer would be *shown* a shipping charge
       * and then billed nothing - a divergence between the confirmed total and the charged
       * total, in the customer's favour this time.
       *
       * Proving that needs a real order and belongs with the `expectServerTotalsMatchUi`
       * family, not here. Recorded so the next reader does not assume it is covered.
       */
    }
  )
}
