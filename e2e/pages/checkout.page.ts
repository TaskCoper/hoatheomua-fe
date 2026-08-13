import type { PaymentGateway, PaymentMethod } from '@/features/orders/types'
import { expect, type Locator, type Page } from '@playwright/test'
import { parseVnd } from '../utils/money'

export interface ManualAddress {
  phoneNumber: string
  // typed into the address autocomplete
  addressQuery: string
  // the city/ward the first suggestion is expected to resolve to
  city: string
  ward: string
}

export class CheckoutPage {
  readonly addressPicker: Locator
  readonly noteInput: Locator

  // step 1 - manual address entry
  readonly manualAddressToggle: Locator
  readonly savedAddressToggle: Locator
  readonly phoneReceiver: Locator
  readonly city: Locator
  readonly ward: Locator
  readonly addressLine: Locator

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

    // both toggles are link-variant buttons in the section header; the second
    // one collides by name with the picker above, hence the explicit role
    this.manualAddressToggle = page.getByRole('button', { name: 'Nhập địa chỉ mới' })
    this.savedAddressToggle = page.getByRole('button', { name: 'Chọn địa chỉ đã lưu' })

    this.phoneReceiver = page.getByLabel('Số điện thoại người nhận')
    this.city = page.getByRole('combobox', { name: 'Tỉnh / Thành phố' })
    this.ward = page.getByRole('combobox', { name: 'Phường / Xã' })
    // 'Địa chỉ nhận hoá đơn' is on the same page once invoicing is on
    this.addressLine = page.getByLabel('Địa chỉ', { exact: true })

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

  async switchToManualAddress() {
    await expect(this.manualAddressToggle).toBeVisible()

    await this.manualAddressToggle.click()

    // the toggle flips its own label, so this is also proof the switch landed
    await expect(this.savedAddressToggle).toBeVisible()
  }

  // handleManualToggle -> clearAddress blanks every address field, so whatever
  // the picker had auto-selected must be gone
  async expectManualFieldsEmpty() {
    await expect(this.phoneReceiver).toHaveValue('')
    await expect(this.addressLine).toHaveValue('')
    // an unset LocationCombobox renders its placeholder rather than a name
    await expect(this.city).toHaveText('Chọn tỉnh / thành')
    await expect(this.ward).toHaveText('Chọn phường / xã')
  }

  // modelled on ProfilePage.createAddress - picking a suggestion is what fills
  // the city and ward selectors, they are never typed into directly
  async fillManualAddress({ phoneNumber, addressQuery, city, ward }: ManualAddress) {
    await this.phoneReceiver.fill(phoneNumber)

    // load-bearing: the suggestion's ward/city are matched against the city list
    // (matchShippingLocation), and are dropped silently if it has not landed yet
    await expect(this.city).toBeEnabled()

    await this.addressLine.fill(addressQuery)
    await this.page.getByRole('option').first().click()

    // the ward resolves asynchronously once the city's ward list reloads, so
    // wait on the rendered text rather than on a timeout
    await expect(this.city).toHaveText(city)
    await expect(this.ward).toHaveText(ward)
  }

  // read back what the form actually holds - the suggestion that gets applied is
  // rarely character-for-character what was typed
  async readManualAddress() {
    return {
      addressLine: await this.addressLine.inputValue(),
      city: (await this.city.innerText()).trim(),
      ward: (await this.ward.innerText()).trim()
    }
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
