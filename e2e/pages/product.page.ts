import { expect, type Page } from '@playwright/test'

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

    const variantBtn = purchaseBox.locator('button[aria-pressed]').first()

    if ((await variantBtn.count()) === 0) {
      const name = (await this.page.getByRole('heading', { level: 1 }).textContent())?.trim() ?? ''
      expect(name).not.toBe('')

      return name
    }

    const label = (await variantBtn.textContent())?.trim() ?? ''
    expect(label).not.toBe('')

    await variantBtn.click()
    await expect(variantBtn).toHaveAttribute('aria-pressed', 'true')

    return label
  }

  // press add to cart button
  async addToCart() {
    const addToCartBtn = this.page.getByRole('button', { name: 'Thêm vào giỏ' })
    await expect(addToCartBtn).toBeEnabled()

    await addToCartBtn.click()
  }
}
