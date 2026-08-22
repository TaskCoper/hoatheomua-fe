import { getSectionBaseCategoryIds } from '@/features/products/section-defaults'
import { expect } from '@playwright/test'
import { getProduct, getProductsPageSections, purchasableUnits, variantsOf } from '../api/products.api'
import { test } from '../fixtures/auth'
import { PRIMARY_PRODUCT, SECONDARY_PRODUCT, type ProductFixture } from '../fixtures/products'

/**
 * API-001 - the catalogue fixtures exist, can be bought, and can be found.
 *
 * Every create-order spec opens a fixture product and adds it to the cart. When one is
 * renamed, sells out or drops off the products page, those specs fail at
 * `ProductPage.open` as a timeout, which reads as "checkout is broken" and costs an
 * afternoon before anyone suspects the catalogue.
 *
 * This exists purely to fail *differently*: API calls only, no browser journey, named for
 * the fixture rather than for a checkout step. Its whole value is the clarity of its
 * failure, so it must stay small. If it ever grows into a second checkout flow, delete it.
 *
 * Deliberately not covered: pricing, the cart, or anything the product detail page renders.
 * Those belong to the specs this protects.
 */

const FIXTURES: { label: string; fixture: ProductFixture }[] = [
  { label: 'PRIMARY_PRODUCT', fixture: PRIMARY_PRODUCT },
  { label: 'SECONDARY_PRODUCT', fixture: SECONDARY_PRODUCT }
]

test('API-001 - Sản phẩm fixture còn bán được và tìm thấy trên trang sản phẩm', async ({ authedPage: page }) => {
  /*
   * Which categories the *first* products-page section draws from.
   *
   * `ProductPage.search` types into the first section's searchbox - each section namespaces
   * its filters by category id (`buildSectionUrlKeys`), so a search there only ever looks
   * inside that one section. `getSectionBaseCategoryIds` is imported from the app rather
   * than reimplemented, so this cannot drift from what the page actually queries: filterable,
   * currently time-active children if the section has any, otherwise the section itself.
   */
  const sections = await getProductsPageSections(page)
  expect(sections.length, 'the products page renders no category sections at all').toBeGreaterThan(0)

  const firstSectionCategoryIds = getSectionBaseCategoryIds(sections[0])

  for (const { label, fixture } of FIXTURES) {
    await test.step(`${label} - ${fixture.name}`, async () => {
      // `unwrap` asserts the response is ok and reports `GET <url> -> <status>` when it is
      // not, which is the diagnostic this spec exists to produce
      const product = await getProduct(page, fixture.id)

      expect(product.id, `${label}: the catalogue returned a different product than the id asked for`).toBe(fixture.id)

      expect(
        product.productName,
        `${label} was renamed in the catalogue - update its name in e2e/fixtures/products.ts, then check its ` +
          `searchTerm still returns it unambiguously`
      ).toBe(fixture.name)

      // the purchase box gates on stock alone, so this is the rule that decides whether a
      // spec can get as far as the cart
      const purchasable = purchasableUnits(product)

      expect(
        purchasable.length,
        `${label} has no purchasable unit - specs using it will fail at the cart. ` +
          `Variants: ${variantsOf(product).length}, availableForSale: ${product.availableForSale}`
      ).toBeGreaterThan(0)

      /*
       * Reachability. Added after CO-006 found a fixture that existed, had stock, and was
       * still unusable: it carried **zero categories**, so it belonged to no section and
       * never rendered on /products at all. Existence and stock cannot detect that.
       */
      const productCategoryIds = (product.categories ?? []).map((category) => category.categoryId)
      const shared = productCategoryIds.filter((id) => firstSectionCategoryIds.includes(id))

      expect(
        shared,
        `${label} is in no category the first products-page section draws from, so ProductPage.search ` +
          `cannot find it however it is spelled. Product categories: ` +
          `[${(product.categories ?? []).map((c) => c.name).join(', ') || 'NONE'}]. First section ` +
          `"${sections[0].name}" draws from: [${firstSectionCategoryIds.join(', ')}].`
      ).not.toHaveLength(0)
    })
  }
})
