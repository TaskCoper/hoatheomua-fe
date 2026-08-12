import { expect, type Locator, type Page } from '@playwright/test'

export class OrderPage {
  readonly statusBadge: Locator
  readonly total: Locator

  constructor(private readonly page: Page) {
    // status badge lives in the order-history nav, not the order card itself
    this.statusBadge = page.locator('nav[aria-label="Đơn hàng của tôi"] [data-slot="badge"]')

    // the amount is formatted with a non-breaking space, so assert the currency
    // rather than an exact string
    this.total = page.locator('div:has(> dt:text-is("Tổng cộng")) > dd')
  }

  // current order detail URL, e.g. after a redirect from checkout
  get url() {
    return this.page.url()
  }

  // the mrc_order_id the order was created under
  get id() {
    return new URL(this.page.url()).pathname.split('/').pop() ?? ''
  }

  // cards are <section>s titled by an <h2>, but so is the page wrapper - take
  // the closest ancestor rather than filtering every section on the page
  section(heading: string) {
    return this.page.getByRole('heading', { name: heading, exact: true }).locator('xpath=ancestor::section[1]')
  }

  // no reload: the page polls its own status every 5s and refetches the order
  // as soon as the backend reports it paid
  async waitForPaid(timeout: number) {
    await expect(this.statusBadge).toHaveText('Đã thanh toán', { timeout })
  }
}
