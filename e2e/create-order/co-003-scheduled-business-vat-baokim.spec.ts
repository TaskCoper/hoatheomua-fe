import type { AhamoveResult } from '@/features/orders/ahamove.type'
import { formatDate } from '@/lib/date/format'
import { expect } from '@playwright/test'
import { getAddressCount, getFreeShipKm, getOrder, getOrderTags } from '../api/orders.api'
import { PAID_SHIP_ADDRESS } from '../fixtures/address'
import { orderTest } from '../fixtures/order'
import { CartPage } from '../pages/cart.page'
import { CheckoutPage } from '../pages/checkout.page'
import { OrderPage } from '../pages/order.page'
import { ProductPage } from '../pages/product.page'
import { announcePaymentWait, PAID_ORDER_TEST_TIMEOUT_MS, PAYMENT_TIMEOUT_MS, WAIT_FOR_PAYMENT } from '../utils/payment'
import { dismissPromoPopup } from '../utils/promo-popup'

/**
 * CO-003 - saved address outside the free-ship radius, scheduled delivery,
 * Business VAT invoice, paid shipping, BaoKim.
 *
 * Three independent rules meet on this one order, and a regression in any of
 * them either loses money or breaks the customer's accounting:
 *
 * - the delivery date is encoded as unix *seconds*, and "today" collapses to 0,
 *   so a future date is the only thing that proves the encoding at all - note
 *   that a slot alone also schedules an order (orderTime 0 + tagIds), which is
 *   CO-013's case, not this one;
 * - a Business invoice carries exactly taxCode + receiptEmail +
 *   receiptPhoneNumber, and must not carry the Personal-only fields;
 * - the quote is at or beyond ahamove.free_ship, so the shipping fee is charged
 *   in full - this is the paid-shipping counterpart to CO-001's waiver.
 *
 * Payment is not completed unless E2E_WAIT_FOR_PAYMENT=1. With the flag on, the
 * test parks on the order detail page until the webhook lands. Unlike CO-001 and
 * CO-002 there is no Ahamove booking to wait for: a scheduled order is
 * dispatched on its delivery date, not on payment.
 */

const SEARCH_TERM = 'Coral Pink'
const PRODUCT_NAME = 'Bó Coral Pink_2026'
const PRODUCT_ID = 'a10efc5a-ad03-4102-9e1e-5807e3f7a38c'
const NOTE = 'DEV TEST - Không xử lý đơn hàng này.'
const QUANTITY = 1

// a real, lookup-resolvable tax code - the info panel only renders when
// api.vietqr.io resolves it
const TAX_CODE = '0101248141'
const TAX_BUSINESS_NAME = 'FPT'
const INVOICE_EMAIL = 'dev.test@hoatheomua.invalid'
const INVOICE_PHONE = '0909111111'

// the whole point of this case: the address has to sit outside the free-ship radius
orderTest.use({ addressSpec: PAID_SHIP_ADDRESS })

orderTest(
  'CO-003 saved address, scheduled delivery, business VAT, paid ship, BaoKim',
  async ({ authedPage: page, savedAddress, createdOrders }) => {
    orderTest.slow()

    // the manual payment window has to fit inside the test timeout
    if (WAIT_FOR_PAYMENT) orderTest.setTimeout(PAID_ORDER_TEST_TIMEOUT_MS)

    const products = new ProductPage(page)
    const cart = new CartPage(page)
    const checkout = new CheckoutPage(page)
    const order = new OrderPage(page)

    // a single submit must produce exactly one order and one quote, so count the
    // calls for the whole test rather than just around the click
    let createOrderCount = 0
    let estimateCount = 0
    // the tax lookup is a third-party call fired from the browser, 500ms after
    // the last keystroke
    let taxLookupCount = 0

    page.on('request', (request) => {
      const { host, pathname } = new URL(request.url())

      if (host === 'api.vietqr.io' && pathname.startsWith('/v2/business/')) taxLookupCount++

      if (request.method() !== 'POST') return
      if (pathname === '/api/v1/orders') createOrderCount++
      if (pathname === '/api/v1/ahamove/estimate') estimateCount++
    })

    const freeShipKm = await getFreeShipKm(page)
    // the fixture address is already saved by this point
    const addressCountBefore = await getAddressCount(page)

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

    // Step 4 - pick the fixture address, schedule the delivery, write a note
    await orderTest.step('choose the saved address and schedule the delivery', async () => {
      await checkout.pickSavedAddress(savedAddress.receiverName)

      // the picker, the request body and the order detail's recipient card all
      // have to agree on this address - step 10 and step 11 check the other two
      await expect(checkout.addressPicker).toContainText(savedAddress.receiverName)
      await expect(checkout.addressPicker).toContainText(savedAddress.phoneNumber)
      await expect(checkout.addressPicker).toContainText(savedAddress.addressLineText)

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

    // Step 5 - leaving step 1 fires the Ahamove quote the whole case hangs on
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

    // Step 6 - the defaults step 2 lands on
    await orderTest.step('check the payment step defaults', async () => {
      await expect(checkout.gateway('BaoKim')).toBeChecked()

      // BaoKim allows VA only, so VNPay QR is not even rendered
      await expect(checkout.paymentMethodRadio('1')).toBeChecked()
      await expect(checkout.paymentMethodRadio('6')).toHaveCount(0)

      await expect(checkout.shippingService(cheapestService.service_id)).toBeChecked()
      await expect(checkout.invoiceSwitch).not.toBeChecked()
    })

    // Step 7 - the Business invoice, and the fields it must not ask for
    await orderTest.step('fill the business invoice', async () => {
      await checkout.enableInvoice()

      // the switch defaults to Cá nhân, which is the tab that owns CCCD/CMND
      await expect(checkout.identityNumber).toBeVisible()

      await checkout.fillBusinessInvoice({
        taxCode: TAX_CODE,
        email: INVOICE_EMAIL,
        phoneNumber: INVOICE_PHONE
      })

      // Doanh nghiệp asks for the tax code and nothing personal
      await expect(checkout.taxCode).toHaveValue(TAX_CODE)
      await expect(checkout.identityNumber).toHaveCount(0)
      await expect(checkout.receiptFullName).toHaveCount(0)
      await expect(checkout.receiptAddress).toHaveCount(0)
    })

    await orderTest.step('check the tax-code lookup panel', async () => {
      // fired 500ms after the last keystroke, so wait on the resolved panel
      // rather than on the request
      await expect(checkout.taxLookupPanel).toContainText(TAX_BUSINESS_NAME)
      await expect(checkout.taxLookupPanel).toContainText(TAX_CODE)
      await expect(checkout.taxLookupPanel).not.toContainText('Không tìm thấy')
      await expect(checkout.taxLookupPanel).not.toContainText('Đang tra cứu')

      expect(taxLookupCount, 'typing a tax code must trigger the VietQR lookup').toBeGreaterThan(0)
    })

    // Step 8 - the sidebar charges for shipping and adds VAT on top
    let productsSubtotal = 0
    let expectedVat = 0

    await orderTest.step('check the VAT and the charged shipping in the sidebar', async () => {
      const rawShippingFee = cheapestService.data.total_fee

      productsSubtotal = await checkout.sidebarAmount('Tạm tính')
      expectedVat = Math.round(productsSubtotal * 0.08)

      expect(await checkout.sidebarAmount('VAT 8%')).toBe(expectedVat)
      expect(await checkout.sidebarAmount('Phí vận chuyển')).toBe(rawShippingFee)

      // the discount row is the only visible proof the free-ship branch fired,
      // so its absence is the assertion that the fee is really being charged
      await expect(checkout.sidebarRow('Giảm giá (bán kính miễn phí ship)')).toHaveCount(0)

      expect(await checkout.sidebarTotalAmount()).toBe(productsSubtotal + expectedVat + rawShippingFee)
    })

    // Step 9 - submit. The request body has to be captured before the click.
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

    // Step 10 - the payload is the only place the address and the gateway exist
    await orderTest.step('check the create-order request body', async () => {
      expect(checkoutPayload).toMatchObject({
        gateway: 'BaoKim',
        // orderService.createOrder coerces the form's '1' to a number
        paymentMethod: 1,
        // charged in full, unlike CO-001
        shippingFee: cheapestService.data.total_fee,
        orderTime: expectedOrderTime,
        tagIds: [deliverySlot.value],
        remarks: NOTE,
        phoneReceiver: savedAddress.phoneNumber,
        isExportInvoice: true,
        invoiceType: 'Business',
        taxCode: TAX_CODE,
        receiptEmail: INVOICE_EMAIL,
        receiptPhoneNumber: INVOICE_PHONE,
        // buildCheckoutPayload only forwards non-blank strings, and the Business
        // tab never renders these
        identityNumber: null,
        receiptFullName: null,
        receiptAddress: null
      })

      const address = checkoutPayload.address as string
      expect(address).toContain(savedAddress.addressLineText)
      expect(address).toContain(savedAddress.ward)
      expect(address).toContain(savedAddress.city)
      expect(checkoutPayload.shortAddress).toBe(address)

      // the address that was quoted must be the address that was ordered
      expect(checkoutPayload.latitude).toBe(estimatePayload.latitude)
      expect(checkoutPayload.longitude).toBe(estimatePayload.longitude)
      expect(checkoutPayload.address).toBe(estimatePayload.address)
      expect(checkoutPayload.latitude).not.toBe(0)
      expect(checkoutPayload.longitude).not.toBe(0)
    })

    // Step 11 - what the customer sees on the order they just created
    await orderTest.step('check the created order in the UI', async () => {
      await expect(order.statusBadge).toHaveText('Chờ xác nhận')

      await expect(order.section('Sản phẩm')).toContainText(variantLabel)
      await expect(order.section('Ghi chú của khách')).toContainText(NOTE)

      // the summary card repeats the sidebar the order was placed from: VAT on
      // top, and shipping that was never waived
      expect(await order.amount('Tạm tính')).toBe(productsSubtotal)
      expect(await order.amount('Phí vận chuyển')).toBe(cheapestService.data.total_fee)
      expect(await order.amount('VAT 8%')).toBeGreaterThan(0)
      await expect(order.row('Phương thức thanh toán')).toHaveText('VA')

      // the recipient card is where the shipping address surfaces in the UI
      const recipient = order.section('Thông tin nhận hàng')
      await expect(recipient).toContainText(savedAddress.phoneNumber)
      await expect(recipient).toContainText(savedAddress.addressLineText)
      await expect(order.field('Địa chỉ')).toContainText(savedAddress.ward)
      // the pin dropped at checkout, not a text search - see buildMapHref
      await expect(order.mapLink).toHaveAttribute('href', /maps\/search\/\?api=1&query=-?\d/)

      // the invoice card is the customer-visible half of the accounting data
      const invoice = order.section('Thông tin hoá đơn')
      await expect(order.rowIn(invoice, 'Loại hoá đơn')).toHaveText('Doanh nghiệp')
      await expect(order.rowIn(invoice, 'Mã số thuế')).toHaveText(TAX_CODE)
      await expect(invoice).toContainText(INVOICE_EMAIL)
      await expect(invoice).toContainText(INVOICE_PHONE)

      // nothing personal may reach a company invoice
      await expect(order.rowIn(invoice, 'CCCD/CMND')).toHaveCount(0)
      await expect(order.field('Họ và tên người nhận hoá đơn')).toHaveCount(0)
      await expect(order.field('Địa chỉ nhận hoá đơn')).toHaveCount(0)

      // nothing has been paid yet, so the timeline stops at "created" - and the
      // delivery entry reads as the scheduled day, not as immediate
      const timeline = order.section('Nhật ký đơn hàng')
      await expect(order.field('Tạo đơn hàng')).not.toBeEmpty()
      await expect(timeline).not.toContainText('Xác nhận thanh toán')

      const deliveryEntry = order.field('Ngày giao dự kiến')
      await expect(deliveryEntry).toContainText(formatDate(deliveryDate, 'dateMedium', { locale: 'vi-VN' }))
      await expect(deliveryEntry).toContainText(deliverySlot.label)
      await expect(deliveryEntry).not.toContainText('Ngay sau khi thanh toán')

      // BaoKim hands back a redirect URL, so the SePay QR card must not render
      await expect(order.section('Thanh toán đơn hàng')).toHaveCount(0)
      await expect(order.payNow).toBeVisible()
      await expect(order.cancelOrder).toBeVisible()
    })

    // Step 12 - the strongest verification available: read the order back
    await orderTest.step('check the created order over the API', async () => {
      const detail = await getOrder(page, order.id)

      expect(detail).toMatchObject({
        status: 'Pending',
        orderTime: expectedOrderTime,
        // the schema caps tagIds at one entry
        tagsId: [deliverySlot.value],
        shippingFee: cheapestService.data.total_fee,
        isExportInvoice: true,
        invoiceType: 'Business',
        taxCode: TAX_CODE,
        receiptEmail: INVOICE_EMAIL,
        receiptPhoneNumber: INVOICE_PHONE,
        identityNumber: null,
        receiptFullName: null,
        receiptAddress: null,
        transaction: null,
        // the recipient card renders these straight from the detail response
        phoneReceiver: savedAddress.phoneNumber
      })

      expect(detail.address).toBe(checkoutPayload.address)

      // seconds, in the future - a milliseconds regression lands ~55000 years out
      expect(detail.orderTime).toBeGreaterThan(Math.floor(Date.now() / 1000))

      // the server prices VAT itself; the client never sends an amount
      expect(detail.vatFee).toBeGreaterThan(0)
      expect(detail.totalFee).toBe(detail.productFee + detail.shippingFee + detail.vatFee)
      // the backend prices the line itself, so this also checks the client preview
      expect(detail.productFee).toBe(productsSubtotal)

      // the server formula is not pinned anywhere, so report a drift from the
      // 8% the sidebar previewed rather than failing on it
      if (detail.vatFee !== expectedVat) {
        console.log(
          `\n  Note: the client previewed VAT ${expectedVat} (8% of ${productsSubtotal}) ` +
            `but the server charged ${detail.vatFee} on order ${order.id}\n`
        )
      }

      expect(Number(detail.paymentMethod)).toBe(1)
      expect(detail.remark).toContain(NOTE)

      expect(detail.details).toHaveLength(1)
      expect(detail.details[0].number).toBe(QUANTITY)
    })

    await orderTest.step('check nothing was created twice', async () => {
      expect(createOrderCount, 'a single submit must create a single order').toBe(1)
      expect(estimateCount, 'leaving step 1 must quote exactly once').toBe(1)

      // checkout never saves the address it was given
      expect(await getAddressCount(page)).toBe(addressCountBefore)
    })

    // Step 13 - hold here, pay the order by hand, then check what the webhook
    // turned it into. Opt-in, because it blocks on a human, and the fixture
    // leaves the order uncancelled while the flag is on.
    if (WAIT_FOR_PAYMENT) {
      await orderTest.step('wait for the payment, then check the paid order', async () => {
        announcePaymentWait(order)

        await order.waitForPaid(PAYMENT_TIMEOUT_MS)

        // the transfer card only exists once the webhook has written a transaction
        const transfer = order.section('Thông tin chuyển khoản')
        await expect(transfer).toBeVisible()
        await expect(transfer).toContainText('Ngân hàng')
        await expect(transfer).toContainText('Nội dung')
        await expect(transfer).toContainText('Thanh toán lúc')

        // the same transaction unlocks the paid timeline entry, and the schedule
        // has to survive the payment
        const timeline = order.section('Nhật ký đơn hàng')
        await expect(timeline).toContainText('Xác nhận thanh toán')
        await expect(order.field('Ngày giao dự kiến')).toContainText(
          formatDate(deliveryDate, 'dateMedium', { locale: 'vi-VN' })
        )

        // a paid order can no longer be paid or cancelled
        await expect(order.payNow).toBeHidden()
        await expect(order.cancelOrder).toBeHidden()
        await expect(order.section('Thanh toán đơn hàng')).toHaveCount(0)

        // the payment only counts once the backend says so, and the customer has
        // to have paid for the shipping and the VAT as well as the flowers
        const paid = await getOrder(page, order.id)

        expect(paid.status).toBe('Paid')
        expect(paid.shippingFee).toBe(cheapestService.data.total_fee)
        expect(paid.vatFee).toBeGreaterThan(0)
        expect(paid.totalFee).toBe(paid.productFee + paid.shippingFee + paid.vatFee)
        expect(paid.transaction).not.toBeNull()
        expect(paid.transaction?.transferAmount).toBe(paid.totalFee)

        // unlike CO-001 and CO-002: a scheduled order is booked on its delivery
        // date, so paying it must not hand the ride to Ahamove yet
        expect(paid.ahahaMoveOrderId).toBeFalsy()
        expect(paid.ahahaMoveTrackingUrl).toBeFalsy()

        await page.reload()
        await expect(order.section('Theo dõi đơn hàng')).toHaveCount(0)
      })
    }
  }
)
