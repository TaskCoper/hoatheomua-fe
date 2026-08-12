import { expect, type Locator, type Page } from '@playwright/test'

/** The three-step checkout. Every step lives on /checkout - the URL never changes. */
export class CheckoutPage {
  readonly addressPicker: Locator
  readonly noteInput: Locator

  constructor(private readonly page: Page) {
    // the manual-address toggle carries the same text, hence the explicit role
    this.addressPicker = page.getByRole('combobox', { name: 'Chọn địa chỉ đã lưu' })
    this.noteInput = page.getByRole('textbox', { name: 'Ghi chú' })
  }

  async pickSavedAddress(receiverName: string) {
    await expect(this.addressPicker).toBeVisible()

    await this.addressPicker.click()
    await this.page.getByRole('option').filter({ hasText: receiverName }).click()
  }

  async setNote(note: string) {
    await this.noteInput.fill(note)
  }

  /** Step 1 -> 2. Runs the shipping estimate. */
  async goToPayment() {
    // disabled while addresses, shipping locations and the estimate are loading
    const nextStepBtn = this.page.getByRole('button', { name: 'Tiếp tục đến thanh toán' })
    await expect(nextStepBtn).toBeEnabled()

    await nextStepBtn.click()

    // gateway, payment method and the cheapest shipping service are pre-selected
    await expect(this.page.getByRole('heading', { name: 'Phương thức giao hàng' })).toBeVisible()
  }

  /** Step 2. Creates the order and follows the redirect to its detail page. */
  async placeOrder() {
    // stays disabled until the shipping estimate resolves a service
    const createOrderBtn = this.page.getByRole('button', { name: 'Thanh toán đơn hàng' })
    await expect(createOrderBtn).toBeEnabled()

    await createOrderBtn.click()

    // a created order pushes to /orders/{mrc_order_id}
    await expect(this.page).toHaveURL(/\/orders\/[^/]+$/, { timeout: 30_000 })
  }
}
