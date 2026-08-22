import { expect, type Page } from '@playwright/test'
import type { ProductFixture } from '../fixtures/products'
import { dismissPromoPopup } from '../utils/promo-popup'

export class ProductPage {
  constructor(private readonly page: Page) {}

  // choose first input and search it
  async search(term: string) {
    await this.page.goto('/products')

    // take the first search input on the page
    await this.page.getByRole('searchbox').first().fill(term)

    // nuqs mirrors the filter into the query string, with spaces as '+'
    const encoded = encodeURIComponent(term).replace(/%20/g, '\\+')
    await expect(this.page).toHaveURL(new RegExp(`_q=${encoded}`))

    // Landing on /products is what triggers the promotion dialog, and it covers the results.
    // Every caller used to do this on the next line; it lives here so none of them has to
    // remember. The auth fixture also arms a locator handler for the same dialog - by this
    // point that has usually already fired, which is why this call is normally a no-op.
    await dismissPromoPopup(this.page)
  }

  // go to product page
  async open(name: string, id: string) {
    const link = this.page.getByRole('link', { name })
    await expect(link).toBeVisible()

    await link.click()
    await expect(this.page).toHaveURL(`/products/${id}`)
  }

  // choose first variant, if no variants then return the label of the product else the variant label
  async selectFirstVariant(): Promise<string> {
    const purchaseBox = this.page.getByTestId('purchase-box')
    await expect(purchaseBox).toBeVisible()

    // a product with no variants is bought as itself, and the cart labels the line with the
    // product name - so that heading is the label the caller needs
    if ((await purchaseBox.locator('button[aria-pressed]').count()) === 0) {
      const name = (await this.page.getByRole('heading', { level: 1 }).textContent())?.trim() ?? ''
      expect(name).not.toBe('')

      return name
    }

    return this.selectVariantAt(0)
  }

  /**
   * Select one variant by position and return its label.
   *
   * `selectFirstVariant` covers every existing spec, which buys a single line. CO-006 needs
   * two lines from the *same* product, which no existing method can express.
   *
   * The label is the child's `productName` (`variantLabel` in product-purchase-box.tsx
   * prefers it over size/colour), which is also what the cart renders per line - so the
   * value returned here is directly usable with `CartPage.line`.
   */
  async selectVariantAt(index: number): Promise<string> {
    const purchaseBox = this.page.getByTestId('purchase-box')
    await expect(purchaseBox).toBeVisible()

    const variants = purchaseBox.locator('button[aria-pressed]')
    const count = await variants.count()

    // fail on the missing variant rather than on a confusing timeout further down
    expect(count, `the product renders ${count} variants, so index ${index} does not exist`).toBeGreaterThan(index)

    const variantBtn = variants.nth(index)
    const label = (await variantBtn.textContent())?.trim() ?? ''
    expect(label, `variant ${index} rendered an empty label`).not.toBe('')

    await variantBtn.click()
    await expect(variantBtn).toHaveAttribute('aria-pressed', 'true')

    return label
  }

  /*
   * Exposed as locators, not just used inside the methods below, so a spec can assert on
   * their enabled state. The pair is meaningful together: add-to-cart is gated only by
   * `isPurchaseDisabled`, while buy-now additionally requires a resolved account phone
   * number - so add-to-cart enabled + buy-now disabled isolates the phone gate exactly.
   */
  get addToCartButton() {
    return this.page.getByRole('button', { name: 'Thêm vào giỏ' })
  }

  get buyNowButton() {
    return this.page.getByRole('button', { name: 'Mua ngay' })
  }

  // press add to cart button
  async addToCart() {
    await expect(this.addToCartButton).toBeEnabled()

    await this.addToCartButton.click()
  }

  /**
   * Buy the selected unit directly, bypassing the cart. Writes a `buy-now` checkout intent
   * and pushes to `/checkout` (`handleBuyNow` in product-purchase-box.tsx).
   */
  async buyNow() {
    await expect(this.buyNowButton).toBeEnabled()

    await this.buyNowButton.click()
    await expect(this.page).toHaveURL('/checkout')
  }

  /**
   * Put one unit of a fixture product in the cart, and return the label the cart line will
   * carry - the variant's name, or the product's own when it has no variants.
   *
   * The four calls this replaces opened every create-order spec identically. They are
   * mechanical setup rather than part of any case's subject: the specs that *are* about the
   * catalogue (CO-006, CO-007) still drive `search`/`open`/`selectVariantAt` by hand, because
   * which variant they pick is the point.
   */
  async addFixtureToCart(fixture: ProductFixture): Promise<string> {
    await this.search(fixture.searchTerm)
    await this.open(fixture.name, fixture.id)

    // the order and the cart both list the variant, not its parent product
    const lineLabel = await this.selectFirstVariant()

    await this.addToCart()

    return lineLabel
  }
}
