import type { AhamoveResult } from '@/features/orders/ahamove.type'
import type { PaymentGateway, PaymentMethod } from '@/features/orders/types'
import { expect, type Locator, type Page } from '@playwright/test'
import { parseVnd } from '../utils/money'
import { ESTIMATE_PATH, isPostTo } from '../utils/requests'

/** What leaving step 1 produced: the quote request, and the services it came back with. */
export interface ShippingQuote {
  /** the body sent to `POST /api/v1/ahamove/estimate` - the address and delivery fields it was quoted for */
  payload: Record<string, unknown>
  /** every service Ahamove offered */
  services: AhamoveResult[]
  /** the one checkout preselects: `sortedAhamove[0]`, cheapest by `total_fee` (checkout-client.tsx) */
  cheapest: AhamoveResult
}

export interface ManualAddress {
  phoneNumber: string
  // typed into the address autocomplete
  addressQuery: string
  // the city/ward the first suggestion is expected to resolve to
  city: string
  ward: string
}

export interface BusinessInvoice {
  taxCode: string
  email: string
  phoneNumber: string
}

export interface PersonalInvoice {
  identityNumber: string
  fullName: string
  email: string
  phoneNumber: string
  address: string
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
  readonly personalTab: Locator
  readonly businessTab: Locator
  readonly taxCode: Locator
  readonly taxLookupPanel: Locator
  readonly identityNumber: Locator
  readonly receiptFullName: Locator
  readonly receiptEmail: Locator
  readonly receiptPhoneNumber: Locator
  readonly receiptAddress: Locator

  readonly submitOrder: Locator
  readonly validationToast: Locator
  readonly createOrderErrorToast: Locator

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

    this.personalTab = page.getByRole('tab', { name: 'Cá nhân' })
    this.businessTab = page.getByRole('tab', { name: 'Doanh nghiệp' })

    // every invoice input carries its react-hook-form field name as its id, and
    // 'Mã số thuế' doubles as a label inside the lookup panel - so match by id
    this.taxCode = page.locator('#taxCode')
    // the panel is the input's next sibling inside the Field, and only exists
    // once a tax code has been typed
    this.taxLookupPanel = this.taxCode.locator('xpath=following-sibling::div[1]')
    this.identityNumber = page.locator('#identityNumber')
    this.receiptFullName = page.locator('#receiptFullName')
    this.receiptEmail = page.locator('#receiptEmail')
    this.receiptPhoneNumber = page.locator('#receiptPhoneNumber')
    this.receiptAddress = page.locator('#receiptAddress')

    this.submitOrder = page.getByRole('button', { name: 'Thanh toán đơn hàng' })
    // sonner gives its toasts no accessible name, so match the rendered copy
    this.validationToast = page
      .locator('[data-sonner-toast]')
      .filter({ hasText: 'Vui lòng kiểm tra lại các trường thông tin.' })
    // the catch branch of handleConfirmOrder - a create-order call that did not succeed
    this.createOrderErrorToast = page.locator('[data-sonner-toast]').filter({ hasText: 'Không thể tạo đơn hàng.' })

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

  // The calendar is limited to today...today+7 and collapses "today" to
  // orderTime 0, so only a future date produces a non-zero orderTime - a slot
  // picked on its own schedules the order just as much (orderTime 0 + tagIds).
  // Days are addressed by react-day-picker's own `data-day` on the gridcell,
  // which is the ISO date - the button's `data-day` comes from
  // toLocaleDateString() and therefore depends on the browser's locale.
  async pickDeliveryDate(date: Date) {
    await this.deliveryDate.click()

    // the popover opens on the current month, and a date up to 7 days out can
    // fall into the next one
    if (date.getMonth() !== new Date().getMonth()) {
      await this.page.getByRole('button', { name: 'Go to the Next Month' }).click()
    }

    // built from local parts: toISOString() would shift the day in UTC+7
    const isoDate = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0')
    ].join('-')

    await this.page.locator(`td[data-day="${isoDate}"] button`).click()

    // the clear affordance renders only while orderTime > 0
    await expect(this.deliveryDateClear).toBeVisible()
  }

  async selectDeliverySlot(label: string) {
    await expect(this.deliverySlot).toBeEnabled()

    await this.deliverySlot.click()
    await this.page.getByRole('option', { name: label, exact: true }).click()

    await expect(this.deliverySlot).toHaveText(label)
  }

  // the switch defaults the form to the Personal tab
  async enableInvoice() {
    await this.invoiceSwitch.click()

    await expect(this.invoiceSwitch).toBeChecked()
    await expect(this.personalTab).toHaveAttribute('data-state', 'active')
  }

  // the Personal tab is where the switch already lands, so this never clicks it -
  // an assertion instead, so a changed default surfaces here rather than as a
  // validation error at submit
  async fillPersonalInvoice({ identityNumber, fullName, email, phoneNumber, address }: PersonalInvoice) {
    await expect(this.personalTab).toHaveAttribute('data-state', 'active')

    await this.identityNumber.fill(identityNumber)
    await this.receiptFullName.fill(fullName)
    await this.receiptEmail.fill(email)
    await this.receiptPhoneNumber.fill(phoneNumber)
    // by id: 'Địa chỉ nhận hoá đơn' and the manual address line both answer to
    // getByLabel('Địa chỉ')
    await this.receiptAddress.fill(address)
  }

  async fillBusinessInvoice({ taxCode, email, phoneNumber }: BusinessInvoice) {
    await this.businessTab.click()
    await expect(this.businessTab).toHaveAttribute('data-state', 'active')

    await this.taxCode.fill(taxCode)
    await this.receiptEmail.fill(email)
    await this.receiptPhoneNumber.fill(phoneNumber)
  }

  gateway(value: PaymentGateway) {
    return this.page.locator(`#gateway-${value}`)
  }

  // handleGatewayChange rewrites the payment method as a side effect, so the
  // method list is only settled once the radio reports itself checked
  async selectGateway(value: PaymentGateway) {
    await this.gateway(value).click()

    await expect(this.gateway(value)).toBeChecked()
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

  // no date was picked and no slot was chosen, so the order is delivered as soon as it is
  // paid. The clear affordance only renders once the date moves off today, which makes its
  // absence the cheapest proof that orderTime is still 0.
  async expectImmediateDelivery() {
    await expect(this.deliveryDateClear).toHaveCount(0)
    await expect(this.deliverySlot).toHaveText('Không chọn')
  }

  // step 1 -> step 2
  async goToPayment() {
    // disabled while addresses, shipping locations and the estimate are loading
    const nextStepBtn = this.page.getByRole('button', { name: 'Tiếp tục đến thanh toán' })
    await expect(nextStepBtn).toBeEnabled()

    await nextStepBtn.click()

    /*
     * Step 2 only renders once the Ahamove quote comes back, and that is a live round trip
     * through our backend to a third party - the button sits in its `Loading` state until it
     * lands. The 5s default expect timeout was not enough for it and CO-008 failed on this
     * line in two runs out of two, on alternating variants, with the page still on step 1.
     *
     * The assertion is unchanged; only its patience is. `placeOrder` already waits 30s on the
     * same class of round trip, so a quote that never arrives still fails loudly and quickly
     * enough to be useful.
     */
    await expect(this.page.getByRole('heading', { name: 'Phương thức giao hàng' })).toBeVisible({ timeout: 30_000 })
  }

  /**
   * Leave step 1 and capture the Ahamove quote that firing does.
   *
   * The quote is the pivot of every pricing assertion in the suite - the fee, the distance
   * the free-ship waiver is decided from, and the coordinates the order is placed against all
   * come out of this one exchange. Both the request and the response have to be armed before
   * the click, which is the part that was hand-rolled identically in ten specs.
   *
   * The empty-result check is an intrinsic postcondition rather than a scenario assertion:
   * with no service, nothing is preselected, the submit button never enables, and every
   * later failure in the calling spec reads as a timeout on an unrelated control.
   */
  async goToPaymentCapturingQuote(): Promise<ShippingQuote> {
    const [request, response] = await Promise.all([
      this.page.waitForRequest(isPostTo(ESTIMATE_PATH)),
      this.page.waitForResponse((res) => isPostTo(ESTIMATE_PATH)(res.request())),
      this.goToPayment()
    ])

    const { ahamoveResult } = (await response.json()).value as { ahamoveResult: AhamoveResult[] }

    expect(ahamoveResult.length, 'Ahamove returned no services - the submit button never enables').toBeGreaterThan(0)

    return {
      payload: request.postDataJSON(),
      services: ahamoveResult,
      cheapest: [...ahamoveResult].sort((a, b) => (a.data?.total_fee ?? 0) - (b.data?.total_fee ?? 0))[0]
    }
  }

  /**
   * The state step 2 opens in, before the customer touches anything: BaoKim paying by VA,
   * the cheapest quoted service, and no invoice.
   *
   * A precondition rather than a contract of its own - the gateway/method coupling itself is
   * CO-013's subject. It is asserted here so that a spec which goes on to check a BaoKim
   * order really did place one, instead of silently ordering through a gateway it never chose.
   */
  async expectDefaultPaymentSelections(serviceId: string) {
    await expect(this.gateway('BaoKim')).toBeChecked()

    // BaoKim allows VA only, so VNPay QR is not even rendered
    await expect(this.paymentMethodRadio('1')).toBeChecked()
    await expect(this.paymentMethodRadio('6')).toHaveCount(0)

    await expect(this.shippingService(serviceId)).toBeChecked()
    await expect(this.invoiceSwitch).not.toBeChecked()
  }

  /*
   * The inline error react-hook-form renders for a field.
   *
   * Anchored to the input's enclosing `Field` rather than to sibling position: `FieldError`
   * is wrapped in a spacer `<div className='min-h-4'>` on some fields and rendered directly
   * on others, so it is a descendant of the Field but not reliably a sibling of the input.
   *
   * A schema issue with a correct `path` still fails the customer if this never mounts,
   * which is the half UT-003 cannot see.
   */
  fieldError(inputId: string) {
    return this.page
      .locator(`#${inputId}`)
      .locator('xpath=ancestor::*[@data-slot="field"][1]')
      .locator('[data-slot="field-error"]')
  }

  async placeOrder() {
    // stays disabled until the shipping estimate resolves a service
    await expect(this.submitOrder).toBeEnabled()

    await this.submitOrder.click()

    // a created order pushes to /orders/{mrc_order_id}
    await expect(this.page).toHaveURL(/\/orders\/[^/]+$/, { timeout: 30_000 })
  }
}
