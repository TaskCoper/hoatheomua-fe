import { expect, type Locator, type Page } from '@playwright/test'
import { parseVnd } from '../utils/money'

const rowSelector = (label: string) => `div:has(> dt:text-is("${label}")) > dd`

export class OrderPage {
  readonly statusBadge: Locator
  readonly total: Locator
  readonly payNow: Locator
  readonly cancelOrder: Locator
  readonly cancelConfirm: Locator
  readonly cancelKeep: Locator
  readonly cancelledBanner: Locator
  readonly cancelledToast: Locator
  readonly mapLink: Locator
  readonly trackAhamove: Locator
  readonly sepayQrImage: Locator

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
    this.cancelConfirm = page.getByRole('button', { name: 'Có, hủy đơn hàng' })
    this.cancelKeep = page.getByRole('button', { name: 'Giữ đơn hàng' })
    // only rendered once the order is Cancelled - the sidebar CTAs disappear at
    // the same time, so this is the positive signal that the status really moved
    this.cancelledBanner = page.getByText('Đơn hàng đã được hủy')
    /*
     * Scoped to the sonner container, not `getByText`.
     *
     * Cancelling pushes to /orders, and every previously cancelled order on that list renders
     * a card carrying this same string - so a bare `getByText('Đã hủy đơn hàng')` matches the
     * toast *and* one card per historical cancellation. It passed only while the shared
     * account happened to have none, and went red under strict mode as soon as the suite had
     * cancelled a few. Sonner gives its toasts no accessible name, so match the container.
     */
    this.cancelledToast = page.locator('[data-sonner-toast]').filter({ hasText: 'Đã hủy đơn hàng' })
    this.mapLink = page.getByRole('link', { name: 'Xem trên bản đồ' })
    // only rendered once the backend has booked the ride, i.e. after payment
    this.trackAhamove = page.getByRole('link', { name: 'Theo dõi Ahamove' })
    // a raw <img> pointed straight at sepayUrl - the QR is drawn by the gateway,
    // never by us
    this.sepayQrImage = page.getByAltText('Mã QR thanh toán')
  }

  // summary rows render as <div><dt>label</dt><dd>value</dd></div>
  row(label: string) {
    return this.page.locator(rowSelector(label))
  }

  // the same row shape, scoped to a single card - labels like 'Mã số thuế' are
  // only unique within their own section
  rowIn(section: Locator, label: string) {
    return section.locator(rowSelector(label))
  }

  field(label: string) {
    return this.page.locator(`div:has(> p:text-is("${label}")) > :nth-child(2)`)
  }

  async amount(label: string) {
    return this.readAmount(this.row(label))
  }

  // the same read, scoped to a card - 'Số tiền' means one thing in the QR panel
  // and another in the transfer card
  async amountIn(section: Locator, label: string) {
    return this.readAmount(this.rowIn(section, label))
  }

  private async readAmount(row: Locator) {
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

  // the pin dropped at checkout rather than a text search - see buildMapHref. A link that
  // fell back to searching the address string would still look right on screen.
  async expectMapPinDropped() {
    await expect(this.mapLink).toHaveAttribute('href', /maps\/search\/\?api=1&query=-?\d/)
  }

  // nothing has been paid yet, so the log stops at "created": a paid entry here would mean
  // the order was credited without a payment
  async expectUnpaidTimeline() {
    await expect(this.field('Tạo đơn hàng')).not.toBeEmpty()
    await expect(this.section('Nhật ký đơn hàng')).not.toContainText('Xác nhận thanh toán')
  }

  // no reload: the page polls its own status every 5s and refetches the order
  // as soon as the backend reports it paid
  async waitForPaid(timeout: number) {
    await expect(this.statusBadge).toHaveText('Đã thanh toán', { timeout })
  }

  // the transfer card only exists once the webhook has written a transaction, so this is the
  // customer-visible receipt for a payment that really landed
  async expectTransferCard() {
    const transfer = this.section('Thông tin chuyển khoản')

    await expect(transfer).toBeVisible()
    await expect(transfer).toContainText('Ngân hàng')
    await expect(transfer).toContainText('Nội dung')
    await expect(transfer).toContainText('Thanh toán lúc')
  }

  // a paid order can no longer be paid or cancelled. A UI courtesy rather than the real
  // guard - the server's is that cancel matches on Pending only - but a customer shown a
  // live pay button on a paid order will use it.
  async expectPaymentActionsGone() {
    await expect(this.payNow).toBeHidden()
    await expect(this.cancelOrder).toBeHidden()
    await expect(this.section('Thanh toán đơn hàng')).toHaveCount(0)
  }

  /**
   * The cancel CTA opens a confirm dialog; nothing is sent until it is
   * confirmed. Waiting on the PATCH rather than on the badge keeps the caller's
   * assertions honest - the badge is driven by a refetch that lands some time
   * after the mutation, and a bare `toHaveText` races it.
   */
  async cancel() {
    await this.cancelOrder.click()
    await expect(this.cancelConfirm).toBeVisible()

    const [response] = await Promise.all([
      this.page.waitForResponse(
        (res) => res.request().method() === 'PATCH' && new URL(res.url()).pathname.endsWith('/cancel')
      ),
      this.cancelConfirm.click()
    ])

    // a network Response, not an APIResponse, so `toBeOK` does not apply here
    expect(response.ok(), `cancel -> ${response.status()}`).toBeTruthy()

    // the dialog closes on success, and the card behind it re-renders from the
    // refetch that follows
    await expect(this.cancelConfirm).toBeHidden()
  }
}
