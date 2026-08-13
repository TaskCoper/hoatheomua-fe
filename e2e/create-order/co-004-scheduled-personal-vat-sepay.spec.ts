import type { AhamoveResult } from '@/features/orders/ahamove.type'
import type { OrderDetail } from '@/features/orders/types'
import { formatDate } from '@/lib/date/format'
import { expect } from '@playwright/test'
import { getAddressIds, getFreeShipKm, getOrder, getOrderTags } from '../api/orders.api'
import { FREE_SHIP_ADDRESS, PAID_SHIP_ADDRESS } from '../fixtures/address'
import { orderTest } from '../fixtures/order'
import { CartPage } from '../pages/cart.page'
import { CheckoutPage } from '../pages/checkout.page'
import { OrderPage } from '../pages/order.page'
import { ProductPage } from '../pages/product.page'
import { dismissPromoPopup } from '../utils/promo-popup'

/**
 * CO-004 - manually typed address outside the free-ship radius, scheduled
 * delivery, Personal VAT invoice, paid shipping, SePay.
 *
 * This is the creation half of the SePay lifecycle - the webhook half is CO-009.
 * Three rules meet here and nothing else covers any of them:
 *
 * - the gateway and the payment method are coupled: GatewayPaymentMethods binds
 *   SePay to method 6 and handleGatewayChange rewrites the selection on switch,
 *   so VA must disappear the moment SePay is picked;
 * - a Personal invoice carries five fields - identityNumber, receiptFullName,
 *   receiptAddress, receiptEmail, receiptPhoneNumber - and no tax code, which is
 *   the mirror image of CO-003's Business invoice;
 * - a SePay order is paid from the order detail page and nowhere else, so the QR
 *   panel is the customer's only route to paying it at all.
 *
 * The order is deliberately left unpaid. Completing a SePay payment and checking
 * what the webhook wrote is CO-009's job, and duplicating it here would make this
 * case block on a human. The fixture cancels the order on teardown - unless
 * E2E_WAIT_FOR_PAYMENT=1, which leaves every order in the run open, this one
 * included.
 */

const SEARCH_TERM = 'Coral Pink'
const PRODUCT_NAME = 'Bó Coral Pink_2026'
const PRODUCT_ID = 'a10efc5a-ad03-4102-9e1e-5807e3f7a38c'
const NOTE = 'DEV TEST - Không xử lý đơn hàng này.'
const QUANTITY = 1
const RECEIVER_PHONE = '0909111111'

// CCCD length, and inside the schema's 20-char cap
const IDENTITY_NUMBER = '079201234567'
const INVOICE_FULL_NAME = 'E2E Personal Invoice'
const INVOICE_EMAIL = 'dev.test@hoatheomua.invalid'
// deliberately not RECEIVER_PHONE: the invoice fields and the delivery fields
// must not cross-wire
const INVOICE_PHONE = '0912222222'
const INVOICE_ADDRESS = 'DEV TEST - 123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh'

// the saved address only exists so the 'Nhập địa chỉ mới' toggle renders, and it
// is the in-radius one - the typed address is the paid-ship one, so a silent
// fallback to the saved default would waive the shipping fee and fail loudly
orderTest.use({ addressSpec: FREE_SHIP_ADDRESS })

orderTest(
  'CO-004 manual address, scheduled delivery, personal VAT, paid ship, SePay',
  async ({ authedPage: page, savedAddress, createdOrders }) => {
    orderTest.slow()

    const products = new ProductPage(page)
    const cart = new CartPage(page)
    const checkout = new CheckoutPage(page)
    const order = new OrderPage(page)

    // a single submit must produce exactly one order and one quote, so count the
    // calls for the whole test rather than just around the click
    let createOrderCount = 0
    let estimateCount = 0
    // the fixture saved its address during setup, so this counter only ever sees
    // what checkout itself does - which must be nothing
    let createAddressCount = 0
    // the detail page polls this every 5s while the order is Pending
    let statusPollCount = 0

    page.on('request', (request) => {
      const { pathname } = new URL(request.url())

      if (request.method() === 'GET' && pathname.startsWith('/api/v1/orders/') && pathname.endsWith('/status')) {
        statusPollCount++
      }

      if (request.method() !== 'POST') return
      if (pathname === '/api/v1/orders') createOrderCount++
      if (pathname === '/api/v1/ahamove/estimate') estimateCount++
      if (pathname === '/api/v1/addresses') createAddressCount++
    })

    const freeShipKm = await getFreeShipKm(page)
    // the fixture address is already saved by this point
    const addressIdsBefore = await getAddressIds(page)

    const orderTags = await getOrderTags(page)
    expect(
      orderTags.options?.length ?? 0,
      'the order-tags config carries no delivery slots - the slot select renders disabled'
    ).toBeGreaterThan(0)
    const deliverySlot = orderTags.options[0]

    // strictly after today and inside the calendar's today+7 window
    const deliveryDate = new Date(new Date().setHours(0, 0, 0, 0))
    deliveryDate.setDate(deliveryDate.getDate() + 2)
    // exactly what the orderTime Controller does with the clicked day
    const expectedOrderTime = Math.floor(deliveryDate.getTime() / 1000)

    // Step 1 - see addressTest at e2e/fixtures/address.ts

    // Step 2 - go to products page, filter, click to view detail and add to cart
    let variantLabel = ''

    await orderTest.step('filter products and add to cart', async () => {
      await products.search(SEARCH_TERM)

      await dismissPromoPopup(page)

      await products.open(PRODUCT_NAME, PRODUCT_ID)

      // the order lists the variant, not its parent product
      variantLabel = await products.selectFirstVariant()

      await products.addToCart()
    })

    // Step 3 - the checkout redirects an empty intent straight back to /cart, so
    // arriving through the cart is the only way in
    await orderTest.step('go to checkout through the cart', async () => {
      await cart.goto()
      await expect(cart.line(variantLabel)).toBeVisible()
      await expect(cart.quantityOf(variantLabel)).toHaveText(String(QUANTITY))

      await cart.goToCheckout()
    })

    // Step 4 - the default has to be selected *before* the toggle, otherwise
    // there is nothing to prove got blanked
    await orderTest.step('switch to manual entry once a default is selected', async () => {
      await expect(checkout.addressPicker).toBeVisible()
      // the trigger falls back to its own placeholder while nothing is selected,
      // so losing that text is what proves the default effect has run
      await expect(checkout.addressPicker).not.toHaveText('Chọn địa chỉ đã lưu')

      await checkout.switchToManualAddress()

      // handleManualToggle -> clearAddress
      await checkout.expectManualFieldsEmpty()
    })

    // Step 5 - type the address the order is actually for, then schedule it
    let typedAddress = ''

    await orderTest.step('fill the manual address and schedule the delivery', async () => {
      await checkout.fillManualAddress({
        phoneNumber: RECEIVER_PHONE,
        addressQuery: PAID_SHIP_ADDRESS.addressQuery,
        city: PAID_SHIP_ADDRESS.city,
        ward: PAID_SHIP_ADDRESS.ward
      })

      // read back what the form holds - the applied suggestion is rarely
      // character-for-character what was typed
      const resolved = await checkout.readManualAddress()
      expect(resolved.addressLine).toContain(PAID_SHIP_ADDRESS.addressLineText)

      // buildEstimatePayload joins the three fields in exactly this order
      typedAddress = `${resolved.addressLine}, ${resolved.ward}, ${resolved.city}`

      // the sidebar, the request body and the order detail all have to agree on
      // this address - steps 10 and 11 check the other two
      await expect(checkout.sidebarRow('Địa chỉ giao hàng')).toHaveText(typedAddress)

      await checkout.pickDeliveryDate(deliveryDate)
      await checkout.selectDeliverySlot(deliverySlot.label)

      // the trigger and the sidebar both read the form back, so this pins that
      // the day that was clicked is the day that got stored
      const dateLabel = formatDate(deliveryDate, 'dateLong', { locale: 'vi-VN' })
      await expect(checkout.deliveryDate).toContainText(dateLabel)
      await expect(checkout.sidebarRow('Ngày giao hàng')).toHaveText(dateLabel)
      await expect(checkout.sidebarRow('Thời gian giao')).toHaveText(deliverySlot.label)

      await checkout.setNote(NOTE)
    })

    // Step 6 - leaving step 1 fires the Ahamove quote the whole case hangs on
    let cheapestService: AhamoveResult
    let estimatePayload: Record<string, unknown>

    await orderTest.step('continue to payment and capture the quote', async () => {
      const [estimateRequest, estimateResponse] = await Promise.all([
        page.waitForRequest(
          (request) => request.method() === 'POST' && new URL(request.url()).pathname === '/api/v1/ahamove/estimate'
        ),
        page.waitForResponse(
          (response) =>
            response.request().method() === 'POST' && new URL(response.url()).pathname === '/api/v1/ahamove/estimate'
        ),
        checkout.goToPayment()
      ])

      estimatePayload = estimateRequest.postDataJSON()

      // the quote has to be for the typed address, not the saved default
      expect(estimatePayload.address).toBe(typedAddress)
      // the first wire proof of the encoding: seconds, and not 0
      expect(estimatePayload.orderTime).toBe(expectedOrderTime)
      expect(estimatePayload.tagIds).toEqual([deliverySlot.value])

      const { ahamoveResult } = (await estimateResponse.json()).value as { ahamoveResult: AhamoveResult[] }
      expect(ahamoveResult.length, 'Ahamove returned no services - the submit button never enables').toBeGreaterThan(0)

      // checkout-client.tsx preselects sortedAhamove[0], cheapest by total_fee
      cheapestService = [...ahamoveResult].sort((a, b) => (a.data?.total_fee ?? 0) - (b.data?.total_fee ?? 0))[0]

      const distanceKm = cheapestService.data.distance
      expect(
        distanceKm,
        `PAID_SHIP_ADDRESS "${PAID_SHIP_ADDRESS.addressQuery}" was quoted at ${distanceKm}km but ` +
          `ahamove.free_ship is ${freeShipKm}km - this address is no longer outside the radius`
      ).toBeGreaterThanOrEqual(freeShipKm)

      expect(cheapestService.data.total_fee, 'a charged delivery cannot be free').toBeGreaterThan(0)
    })

    // Step 7 - the defaults step 2 lands on, and what switching gateway does to
    // them. This is the cheapest possible guard on the coupling rule: it fails
    // here rather than on a paymentMethod the backend quietly accepted.
    await orderTest.step('switch the gateway to SePay', async () => {
      await expect(checkout.gateway('BaoKim')).toBeChecked()
      await expect(checkout.paymentMethodRadio('1')).toBeChecked()

      await checkout.selectGateway('Sepay')

      // GatewayPaymentMethods.Sepay is [6], so VA is not rendered at all - and
      // handleGatewayChange has to have moved the selection off it
      await expect(checkout.paymentMethodRadio('6')).toBeChecked()
      await expect(checkout.paymentMethodRadio('1')).toHaveCount(0)

      await expect(checkout.shippingService(cheapestService.service_id)).toBeChecked()
      await expect(checkout.invoiceSwitch).not.toBeChecked()
    })

    // Step 8 - the Personal invoice, and the field it must not ask for
    await orderTest.step('fill the personal invoice', async () => {
      await checkout.enableInvoice()

      await checkout.fillPersonalInvoice({
        identityNumber: IDENTITY_NUMBER,
        fullName: INVOICE_FULL_NAME,
        email: INVOICE_EMAIL,
        phoneNumber: INVOICE_PHONE,
        address: INVOICE_ADDRESS
      })

      // Cá nhân asks for a CCCD and never for a tax code
      await expect(checkout.identityNumber).toHaveValue(IDENTITY_NUMBER)
      await expect(checkout.receiptFullName).toHaveValue(INVOICE_FULL_NAME)
      await expect(checkout.receiptAddress).toHaveValue(INVOICE_ADDRESS)
      await expect(checkout.taxCode).toHaveCount(0)
    })

    // Step 9 - shipping is charged in full, and a Personal invoice previews no VAT
    let productsSubtotal = 0

    await orderTest.step('check the charged shipping in the sidebar', async () => {
      const rawShippingFee = cheapestService.data.total_fee

      productsSubtotal = await checkout.sidebarAmount('Tạm tính')

      expect(await checkout.sidebarAmount('Phí vận chuyển')).toBe(rawShippingFee)

      // the discount row is the only visible proof the free-ship branch fired,
      // so its absence is the assertion that the fee is really being charged
      await expect(checkout.sidebarRow('Giảm giá (bán kính miễn phí ship)')).toHaveCount(0)

      // hasTaxCode gates the VAT row, and a Personal invoice has no tax code -
      // so unlike CO-003 the customer is shown no VAT at all
      await expect(checkout.sidebarRow('VAT 8%')).toHaveCount(0)

      expect(await checkout.sidebarTotalAmount()).toBe(productsSubtotal + rawShippingFee)
    })

    // Step 10 - submit. The request body has to be captured before the click.
    let checkoutPayload: Record<string, unknown>

    await orderTest.step('place the order', async () => {
      const createRequest = page.waitForRequest(
        (request) => request.method() === 'POST' && new URL(request.url()).pathname === '/api/v1/orders'
      )

      await checkout.placeOrder()

      // register cleanup before any assertion can throw
      createdOrders.push(order.id)

      checkoutPayload = (await createRequest).postDataJSON()
    })

    // Step 11 - the payload is the only place the gateway exists at all
    await orderTest.step('check the create-order request body', async () => {
      expect(checkoutPayload).toMatchObject({
        gateway: 'Sepay',
        // orderService.createOrder coerces the form's '6' to a number
        paymentMethod: 6,
        // charged in full, unlike CO-002
        shippingFee: cheapestService.data.total_fee,
        orderTime: expectedOrderTime,
        tagIds: [deliverySlot.value],
        remarks: NOTE,
        phoneReceiver: RECEIVER_PHONE,
        isExportInvoice: true,
        invoiceType: 'Personal',
        identityNumber: IDENTITY_NUMBER,
        receiptFullName: INVOICE_FULL_NAME,
        receiptAddress: INVOICE_ADDRESS,
        receiptEmail: INVOICE_EMAIL,
        receiptPhoneNumber: INVOICE_PHONE,
        // buildCheckoutPayload only forwards non-blank strings, and the Personal
        // tab never renders this one
        taxCode: null
      })

      // the typed address, exactly, rather than the saved default the picker had
      // auto-selected
      expect(checkoutPayload.address).toBe(typedAddress)
      expect(checkoutPayload.shortAddress).toBe(typedAddress)
      expect(checkoutPayload.address).not.toContain(savedAddress.addressLineText)

      // the address that was quoted must be the address that was ordered
      expect(checkoutPayload.latitude).toBe(estimatePayload.latitude)
      expect(checkoutPayload.longitude).toBe(estimatePayload.longitude)
      expect(checkoutPayload.latitude).not.toBe(0)
      expect(checkoutPayload.longitude).not.toBe(0)
    })

    // Step 12 - what the customer sees on the order they just created
    await orderTest.step('check the created order in the UI', async () => {
      await expect(order.statusBadge).toHaveText('Chờ xác nhận')

      await expect(order.section('Sản phẩm')).toContainText(variantLabel)
      await expect(order.section('Ghi chú của khách')).toContainText(NOTE)

      // the summary card repeats the sidebar the order was placed from: shipping
      // that was never waived, and the QR method rather than VA
      expect(await order.amount('Tạm tính')).toBe(productsSubtotal)
      expect(await order.amount('Phí vận chuyển')).toBe(cheapestService.data.total_fee)
      await expect(order.row('Phương thức thanh toán')).toHaveText('VNPay QR')

      // the recipient card is where the typed address surfaces in the UI
      const recipient = order.section('Thông tin nhận hàng')
      await expect(recipient).toContainText(RECEIVER_PHONE)
      await expect(recipient).toContainText(PAID_SHIP_ADDRESS.addressLineText)
      await expect(order.field('Địa chỉ')).toContainText(PAID_SHIP_ADDRESS.ward)
      // the pin the suggestion resolved to, not a text search - see buildMapHref
      await expect(order.mapLink).toHaveAttribute('href', /maps\/search\/\?api=1&query=-?\d/)

      // the invoice card is the customer-visible half of the accounting data
      const invoice = order.section('Thông tin hoá đơn')
      await expect(order.rowIn(invoice, 'Loại hoá đơn')).toHaveText('Cá nhân và HKD')
      await expect(order.rowIn(invoice, 'CCCD/CMND')).toHaveText(IDENTITY_NUMBER)
      await expect(order.field('Họ và tên người nhận hoá đơn')).toHaveText(INVOICE_FULL_NAME)
      await expect(order.field('Địa chỉ nhận hoá đơn')).toHaveText(INVOICE_ADDRESS)
      await expect(invoice).toContainText(INVOICE_EMAIL)
      await expect(invoice).toContainText(INVOICE_PHONE)

      // a tax code belongs to a company invoice, and this order has none
      await expect(order.rowIn(invoice, 'Mã số thuế')).toHaveCount(0)

      // nothing has been paid yet, so the timeline stops at "created" - and the
      // delivery entry reads as the scheduled day, not as immediate
      const timeline = order.section('Nhật ký đơn hàng')
      await expect(order.field('Tạo đơn hàng')).not.toBeEmpty()
      await expect(timeline).not.toContainText('Xác nhận thanh toán')

      const deliveryEntry = order.field('Ngày giao dự kiến')
      await expect(deliveryEntry).toContainText(formatDate(deliveryDate, 'dateMedium', { locale: 'vi-VN' }))
      await expect(deliveryEntry).toContainText(deliverySlot.label)
      await expect(deliveryEntry).not.toContainText('Ngay sau khi thanh toán')

      // a SePay order is paid from the QR panel, so the BaoKim redirect CTA must
      // not be offered - it only renders for a paymentUrl
      await expect(order.payNow).toHaveCount(0)
      await expect(order.cancelOrder).toBeVisible()
    })

    // Step 13 - the strongest verification available: read the order back
    let detail!: OrderDetail

    await orderTest.step('check the created order over the API', async () => {
      detail = await getOrder(page, order.id)

      expect(detail).toMatchObject({
        status: 'Pending',
        orderTime: expectedOrderTime,
        // the schema caps tagIds at one entry
        tagsId: [deliverySlot.value],
        shippingFee: cheapestService.data.total_fee,
        isExportInvoice: true,
        invoiceType: 'Personal',
        identityNumber: IDENTITY_NUMBER,
        receiptFullName: INVOICE_FULL_NAME,
        receiptAddress: INVOICE_ADDRESS,
        receiptEmail: INVOICE_EMAIL,
        receiptPhoneNumber: INVOICE_PHONE,
        taxCode: null,
        // no webhook has been sent, so nothing may have been recorded as paid
        transaction: null,
        // the recipient card renders these straight from the detail response
        phoneReceiver: RECEIVER_PHONE
      })

      expect(detail.address).toBe(typedAddress)

      // seconds, in the future - a milliseconds regression lands ~55000 years out
      expect(detail.orderTime).toBeGreaterThan(Math.floor(Date.now() / 1000))

      expect(Number(detail.paymentMethod)).toBe(6)
      expect(detail.remark).toContain(NOTE)

      expect(detail.details).toHaveLength(1)
      expect(detail.details[0].number).toBe(QUANTITY)

      expect(detail.totalFee).toBe(detail.productFee + detail.shippingFee + detail.vatFee)
      // the backend prices the line itself, so this also checks the client preview
      expect(detail.productFee).toBe(productsSubtotal)

      // the sidebar the customer confirmed showed no VAT row at all - hasTaxCode
      // gates it and a Personal invoice has no tax code - so the server charging
      // any VAT here would bill more than was ever displayed. Observed as 0; the
      // server-side formula is not pinned anywhere in this repository.
      expect(detail.vatFee, 'a Personal invoice was previewed without VAT, so none may be charged').toBe(0)
      expect(detail.totalFee).toBe(productsSubtotal + cheapestService.data.total_fee)
    })

    // Step 14 - the QR panel is the only way to pay a SePay order, and its
    // contents are parsed out of sepayUrl rather than served as fields
    await orderTest.step('check the SePay QR panel', async () => {
      expect(
        detail.sepayUrl,
        'a SePay order came back without a sepayUrl - the customer has no way to pay it'
      ).toBeTruthy()
      // showSepayQr suppresses the whole panel when a paymentUrl is present
      expect(detail.paymentUrl, 'a SePay order must not also carry a BaoKim payment URL').toBeFalsy()

      const sepayUrl = new URL(detail.sepayUrl as string)
      const qr = order.section('Thanh toán đơn hàng')

      await expect(qr).toBeVisible()
      await expect(order.sepayQrImage).toHaveAttribute('src', detail.sepayUrl as string)

      // this is the assertion the money rides on: the QR the customer scans has
      // to ask for exactly what the order costs
      expect(await order.amountIn(qr, 'Số tiền')).toBe(detail.totalFee)
      expect(Number(sepayUrl.searchParams.get('amount'))).toBe(detail.totalFee)

      // each of these rows renders only when its query param is present, so a
      // param the backend drops thins the panel out silently - which is why the
      // params are asserted first and the rows second
      const rows = [
        { label: 'Ngân hàng', value: sepayUrl.searchParams.get('bank')?.trim() },
        { label: 'Tài khoản', value: sepayUrl.searchParams.get('acc')?.trim() },
        { label: 'Chủ tài khoản', value: sepayUrl.searchParams.get('holder')?.trim() },
        { label: 'Nội dung', value: sepayUrl.searchParams.get('des')?.trim() }
      ]

      expect(
        rows.filter((row) => row.value).map((row) => row.label),
        'a QR that fails to scan leaves the customer nothing to type in by hand'
      ).toEqual(rows.map((row) => row.label))

      for (const { label, value } of rows) {
        await expect(order.rowIn(qr, label)).toHaveText(value as string)
      }

      // the transfer card is the paid-order twin of this panel
      await expect(order.section('Thông tin chuyển khoản')).toHaveCount(0)
      await expect(qr).toContainText('Đang chờ xác nhận thanh toán…')
    })

    await orderTest.step('check the order stays pending and unsaved', async () => {
      expect(createOrderCount, 'a single submit must create a single order').toBe(1)
      expect(estimateCount, 'leaving step 1 must quote exactly once').toBe(1)

      expect(createAddressCount, 'checkout must never persist the address it was given').toBe(0)
      // ids, not just the count: same set, same order, nothing swapped
      expect(await getAddressIds(page)).toEqual(addressIdsBefore)

      // useGetOrderStatus polls every 5s while the order is Pending - that poll
      // is what flips the page over when the webhook lands, so a regression that
      // silences it strands the customer on a stale page
      await expect
        .poll(() => statusPollCount, {
          timeout: 20_000,
          message: 'the detail page must poll GET /orders/{id}/status while the order is Pending'
        })
        .toBeGreaterThanOrEqual(2)

      // and with no webhook sent, every one of those polls has to have come back
      // Pending
      await expect(order.statusBadge).toHaveText('Chờ xác nhận')
      expect((await getOrder(page, order.id)).transaction).toBeNull()
    })
  }
)
