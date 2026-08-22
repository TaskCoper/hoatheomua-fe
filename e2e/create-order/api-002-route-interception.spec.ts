import { expect } from '@playwright/test'
import { FREE_SHIP_ADDRESS } from '../fixtures/address'
import { orderTest } from '../fixtures/order'
import { PRIMARY_PRODUCT } from '../fixtures/products'
import { CartPage } from '../pages/cart.page'
import { CheckoutPage } from '../pages/checkout.page'
import { ProductPage } from '../pages/product.page'

/**
 * API-002 - the pilot for `page.route`.
 *
 * Written before any other spec intercepted a route, so the technique was proven here once,
 * in isolation, against the seam the dependent cases would actually use - rather than being
 * debugged for the first time inside a case that is also trying to assert something else.
 * CO-008 and CO-012 now use it for real; CO-007, CO-020 and CO-021 still need it.
 *
 * `/api/geocode/autocomplete` is the best seam in the codebase: a same-origin Next route
 * handler we own, which proxies VietMap. Intercepting it replaces our own BFF's response, so
 * the suggestion list becomes deterministic without VietMap latency or quota.
 *
 * This is scaffolding. It asserts no customer-facing rule, and once interception is
 * established in three real specs it can be deleted.
 *
 * **Not a template for every seam.** Intercepting `/api/v1/ahamove/estimate` would replace
 * *our backend's* response, not Ahamove's - which silently removes both the backend/Ahamove
 * contract and the server's own fee computation from coverage. See COVERAGE-PLAN-v2.md §1.
 */

const AUTOCOMPLETE_ROUTE = '**/api/geocode/autocomplete*'

/**
 * The exact shape `app/api/geocode/autocomplete/route.ts` returns: `{ results: [...] }`,
 * each entry narrowed to `refId` / `name` / `address` / `display`. The values are obviously
 * synthetic so a stubbed suggestion can never be mistaken for a real VietMap one.
 */
const STUBBED_SUGGESTIONS = [
  { refId: 'dev-test-ref-1', name: 'DEV TEST Đường Một', address: 'DEV TEST, Quận 1, TP. HCM', display: 'Một' },
  { refId: 'dev-test-ref-2', name: 'DEV TEST Đường Hai', address: 'DEV TEST, Quận 3, TP. HCM', display: 'Hai' },
  { refId: 'dev-test-ref-3', name: 'DEV TEST Đường Ba', address: 'DEV TEST, Quận 5, TP. HCM', display: 'Ba' }
]

orderTest.use({ addressSpec: FREE_SHIP_ADDRESS })

orderTest('API-002 - Chặn được API geocode autocomplete', async ({ authedPage: page, savedAddress }) => {
  orderTest.slow()

  const products = new ProductPage(page)
  const cart = new CartPage(page)
  const checkout = new CheckoutPage(page)

  let autocompleteCalls = 0

  await orderTest.step('reach checkout step 1', async () => {
    const variantLabel = await products.addFixtureToCart(PRIMARY_PRODUCT)

    await cart.goto()
    await expect(cart.line(variantLabel)).toBeVisible()

    await cart.goToCheckout()

    // the picker only renders because the fixture saved an address, and the toggle beside it
    // is what exposes the autocomplete input. Selecting first mirrors CO-002/CO-004: the
    // fixture row is not the account default, so nothing is selected until it is picked.
    await checkout.pickSavedAddress(savedAddress.receiverName)
    await expect(checkout.addressPicker).toContainText(savedAddress.receiverName)
  })

  /*
   * Armed here, not at file scope. The `savedAddress` fixture creates its row through the
   * profile dialog, which drives this same autocomplete component - stubbing it earlier
   * would feed the fixture synthetic suggestions and it would never resolve a real address.
   * Fixture setup completes before the test body runs, so this is the first safe moment.
   */
  await orderTest.step('stub the autocomplete seam', async () => {
    await page.route(AUTOCOMPLETE_ROUTE, async (route) => {
      autocompleteCalls++

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ results: STUBBED_SUGGESTIONS })
      })
    })

    await checkout.switchToManualAddress()
    await checkout.expectManualFieldsEmpty()
  })

  await orderTest.step('the suggestion list is exactly what the stub returned', async () => {
    // the hook only queries at >= 2 characters (use-address-autocomplete.ts)
    await checkout.addressLine.fill('dev test')

    const options = page.getByRole('option')

    await expect(options).toHaveCount(STUBBED_SUGGESTIONS.length)

    // each row renders `name || display` as its title and `address` beneath it
    for (const [index, suggestion] of STUBBED_SUGGESTIONS.entries()) {
      await expect(options.nth(index)).toContainText(suggestion.name)
      await expect(options.nth(index)).toContainText(suggestion.address)
    }

    expect(autocompleteCalls, 'the route was never hit - the URL pattern does not match').toBeGreaterThan(0)
  })

  await orderTest.step('unrouting restores the real seam', async () => {
    await page.unroute(AUTOCOMPLETE_ROUTE)

    const callsBefore = autocompleteCalls

    await checkout.addressLine.fill(FREE_SHIP_ADDRESS.addressQuery)

    // a real VietMap suggestion for the fixture address, which the stub could not produce
    await expect(page.getByRole('option').first()).toContainText(FREE_SHIP_ADDRESS.addressLineText)

    expect(autocompleteCalls, 'the handler still ran after unroute - the stub outlived the test').toBe(callsBefore)
  })
})
