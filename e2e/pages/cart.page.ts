import { expect, type Page } from '@playwright/test'

export class CartPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/cart')
  }

  // check if the cart has that item
  line(itemLabel: string) {
    return this.page.getByTestId('cart-line').filter({ hasText: itemLabel })
  }

  // get item quantity
  quantityOf(itemLabel: string) {
    return this.line(itemLabel).getByTestId('cart-line-quantity')
  }

  // increase quantity by one
  async increase(itemLabel: string) {
    const increaseBtn = this.line(itemLabel).getByRole('button', { name: 'Tăng số lượng' })
    await expect(increaseBtn).toBeEnabled()

    await increaseBtn.click()
  }

  // tick a single line
  async select(itemLabel: string) {
    const checkbox = this.line(itemLabel).getByRole('checkbox', { name: 'Chọn sản phẩm này' })
    await expect(checkbox).toBeEnabled()

    await checkbox.check()
  }

  // tick every selectable line
  async selectAll() {
    const checkbox = this.page.getByRole('checkbox', { name: 'Chọn tất cả' })
    await expect(checkbox).toBeEnabled()

    await checkbox.check()
  }

  // nothing is selected by default, so pick the lines first
  async goToCheckout() {
    await this.selectAll()

    const checkoutBtn = this.page.getByRole('button', { name: 'Thanh toán', exact: true })
    await expect(checkoutBtn).toBeEnabled()

    await checkoutBtn.click()
    await expect(this.page).toHaveURL('/checkout')
  }
}
