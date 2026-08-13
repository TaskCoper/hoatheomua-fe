import { expect, type Locator, type Page } from '@playwright/test'
import { parseVnd } from '../utils/money'

export class OrderPage {
  readonly statusBadge: Locator
  readonly total: Locator
  readonly payNow: Locator
  readonly cancelOrder: Locator
  readonly mapLink: Locator
  readonly trackAhamove: Locator

  constructor(private readonly page: Page) {
    // status badge lives in the breadcrumb nav, not the order card itself
    this.statusBadge = page.locator('nav[aria-label="Đơn hàng của tôi"] [data-slot="badge"]')

    // the amount is formatted with a non-breaking space, so assert the currency
    // rather than an exact string
    this.total = this.row('Tổng cộng')

    // the pay CTA is a <button> inside the gateway <a>, so match the button
    this.payNow = page.getByRole('button', { name: 'Thanh toán ngay' })
    // exact: the confirm dialog's "Có, hủy đơn hàng" would match by substring
    this.cancelOrder = page.getByRole('button', { name: 'Hủy đơn hàng', exact: true })
    this.mapLink = page.getByRole('link', { name: 'Xem trên bản đồ' })
    // only rendered once the backend has booked the ride, i.e. after payment
    this.trackAhamove = page.getByRole('link', { name: 'Theo dõi Ahamove' })
  }

  // summary rows render as <div><dt>label</dt><dd>value</dd></div>
  row(label: string) {
    return this.page.locator(`div:has(> dt:text-is("${label}")) > dd`)
  }

  field(label: string) {
    return this.page.locator(`div:has(> p:text-is("${label}")) > :nth-child(2)`)
  }

  async amount(label: string) {
    const row = this.row(label)
    await expect(row).toBeVisible()

    return parseVnd(await row.innerText())
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
