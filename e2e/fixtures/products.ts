/**
 * Catalogue fixtures shared by every spec that buys something.
 *
 * These were duplicated byte-for-byte across nine create-order specs plus
 * `e2e/checkout/checkout.spec.ts`. They are shared immutable fixture data, not
 * deliberately-varied test data, so a rename or a stock-out in the catalogue used to turn
 * ten specs red at once with timeouts that read as "checkout is broken". `API-001` now
 * fails first and names the real cause. See COVERAGE-PLAN-v2.md §2.
 *
 * `e2e/fixtures/address.ts` already centralises FREE_SHIP_ADDRESS / PAID_SHIP_ADDRESS;
 * products were the inconsistency.
 */

export interface ProductFixture {
  /** typed into the products searchbox by `ProductPage.search` */
  searchTerm: string
  /**
   * The product link's accessible name, and the `<h1>` on its detail page.
   *
   * `ProductPage.open` uses `getByRole('link', { name })`, which matches by **substring**.
   * The name therefore has to be unambiguous *within the results `searchTerm` returns* -
   * it does not have to be unique across the whole catalogue. Verify with the search
   * endpoint before changing either field: a product whose name is a prefix of a sibling's
   * (`Giỏ quai lục bình` vs `Giỏ quai lục bình cao`) resolves to two links and fails on
   * Playwright strict mode.
   */
  name: string
  /** the id in the detail URL, `/products/{id}` */
  id: string
}

/**
 * The product every create-order spec buys.
 *
 * Has two variants (`children`), so `ProductPage.selectFirstVariant` selects rather than
 * falling back to the product heading - and CO-006 can take two lines from this one product.
 * `Coral Pink` returns five products; this name is a substring of none of them.
 */
export const PRIMARY_PRODUCT: ProductFixture = {
  searchTerm: 'Coral Pink',
  name: 'Bó Coral Pink_2026',
  id: 'a10efc5a-ad03-4102-9e1e-5807e3f7a38c'
}

/**
 * A second product, used by CO-006 for a cart line from a different product.
 *
 * Chosen deliberately: **no variants**, so it exercises the parent-product id path that
 * `PRIMARY_PRODUCT`'s variant lines do not; healthy stock; and `TANA` returns exactly one
 * matching link.
 *
 * ⚠ **It must share a category with `PRIMARY_PRODUCT`.** `/products` renders one section per
 * category, each with its own searchbox bound to a `` `${categoryId}_q` `` param
 * (`features/products/section-search-params.ts`). `ProductPage.search` fills the *first*
 * section's box, so it only ever searches within that one category. A product in a different
 * category - or in none - is unreachable through that helper no matter what is typed.
 *
 * The previous pick here (`Giỏ mây đan mắt cáo Sunny`) had **zero categories**, so it
 * belonged to no section and never rendered on `/products` at all. It passed API-001 because
 * that canary checks existence and stock over the API and never opens the page. Verified
 * before replacing: `TANA` is visible via the first searchbox and resolves to exactly one link.
 */
export const SECONDARY_PRODUCT: ProductFixture = {
  searchTerm: 'TANA',
  name: 'TANA bó kiểu_2026',
  id: '421ebc9c-39a7-4e84-afd8-f416a8a33c46'
}

/**
 * Required on every order the suite creates, so staff never process one (Rule 3).
 * Was duplicated in eight specs.
 */
export const ORDER_NOTE = 'DEV TEST - Không xử lý đơn hàng này.'
