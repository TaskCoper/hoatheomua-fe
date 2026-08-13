import type { PaymentGateway, PaymentMethod } from '@/features/orders/types'
import { expect, type Locator, type Page } from '@playwright/test'
import { parseVnd } from '../utils/money'

export class CheckoutPage {
  readonly addressPicker: Locator
  readonly noteInput: Locator

  // step 1 - delivery options
  readonly deliveryDate: Locator
  readonly deliveryDateClear: Locator
  readonly deliverySlot: Locator

  // step 2 - invoice
  readonly invoiceSwitch: Locator

  readonly sidebar: Locator
  readonly sidebarTotal: Locator

  constructor(private readonly page: Page) {
    // the manual-address toggle carries the same text, hence the explicit role
    this.addressPicker = page.getByRole('combobox', { name: 'Chọn địa chỉ đã lưu' })
    this.noteInput = page.getByRole('textbox', { name: 'Ghi chú' })

    // labelled 'Ngày giao hàng (tuỳ chọn)', so match by id rather than by name
    this.deliveryDate = page.locator('#orderTime')
    // the clear affordance only renders once a date other than today is picked,
    // which makes its absence the cheapest proof that orderTime is still 0
    this.deliveryDateClear = this.deliveryDate.getByRole('button', { name: 'Xoá' })
    this.deliverySlot = page.locator('#tagIds')

    this.invoiceSwitch = page.getByRole('switch', { name: 'Xuất hoá đơn' })

    // the layout has other asides, so pin this one to the price block
    this.sidebar = page.locator('aside').filter({ hasText: 'Chi tiết giá' })
    // unlike the other rows, the total is a pair of spans rather than dt/dd
    this.sidebarTotal = this.sidebar.locator('div:has(> span:text-is("Tổng cộng")) > span').last()
  }

  async pickSavedAddress(receiverName: string) {
    await expect(this.addressPicker).toBeVisible()

    await this.addressPicker.click()
    await this.page.getByRole('option').filter({ hasText: receiverName }).click()
  }

  async setNote(note: string) {
    await this.noteInput.fill(note)
  }

  gateway(value: PaymentGateway) {
    return this.page.locator(`#gateway-${value}`)
  }

  // only the gateway's allowed method is rendered: BaoKim -> 1, Sepay -> 6
  paymentMethodRadio(value: PaymentMethod) {
    return this.page.locator(`#payment-${value}`)
  }

  // ids come straight from Ahamove, e.g. #ship-SGN-BIKE
  shippingService(serviceId: string) {
    return this.page.locator(`#ship-${serviceId}`)
  }

  // price rows render as <div><dt>label</dt><dd>value</dd></div>
  sidebarRow(label: string) {
    return this.sidebar.locator(`div:has(> dt:text-is("${label}")) > dd`)
  }

  async sidebarAmount(label: string) {
    const row = this.sidebarRow(label)
    await expect(row).toBeVisible()

    return parseVnd(await row.innerText())
  }

  async sidebarTotalAmount() {
    await expect(this.sidebarTotal).toBeVisible()

    return parseVnd(await this.sidebarTotal.innerText())
  }

  // step 1 -> step 2
  async goToPayment() {
    // disabled while addresses, shipping locations and the estimate are loading
    const nextStepBtn = this.page.getByRole('button', { name: 'Tiếp tục đến thanh toán' })
    await expect(nextStepBtn).toBeEnabled()

    await nextStepBtn.click()

    // gateway, payment method and the cheapest shipping service are pre-selected
    await expect(this.page.getByRole('heading', { name: 'Phương thức giao hàng' })).toBeVisible()
  }

  async placeOrder() {
    // stays disabled until the shipping estimate resolves a service
    const createOrderBtn = this.page.getByRole('button', { name: 'Thanh toán đơn hàng' })
    await expect(createOrderBtn).toBeEnabled()

    await createOrderBtn.click()

    // a created order pushes to /orders/{mrc_order_id}
    await expect(this.page).toHaveURL(/\/orders\/[^/]+$/, { timeout: 30_000 })
  }
}
