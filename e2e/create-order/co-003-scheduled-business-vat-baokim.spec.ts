import { formatDate } from '@/lib/date/format'
import { expect } from '@playwright/test'
import type { UiTotals } from '../api/orders.api'
import {
  expectOutsideFreeShipRadius,
  expectServerTotalsMatchUi,
  getFirstDeliverySlot,
  getFreeShipKm,
  getOrder
} from '../api/orders.api'
import { PAID_SHIP_ADDRESS } from '../fixtures/address'
import { BUSINESS_INVOICE, TAX_BUSINESS_NAME } from '../fixtures/invoice'
import { orderTest } from '../fixtures/order'
import { ORDER_NOTE, PRIMARY_PRODUCT } from '../fixtures/products'
import { CartPage } from '../pages/cart.page'
import { CheckoutPage, type ShippingQuote } from '../pages/checkout.page'
import { OrderPage } from '../pages/order.page'
import { ProductPage } from '../pages/product.page'
import { orderTimeOf, scheduledDeliveryDate } from '../utils/delivery'
import { announcePaymentWait, PAID_ORDER_TEST_TIMEOUT_MS, PAYMENT_TIMEOUT_MS, WAIT_FOR_PAYMENT } from '../utils/payment'
import {
  countPostsTo,
  countRequests,
  CREATE_ORDER_PATH,
  ESTIMATE_PATH,
  waitForCreateOrderRequest
} from '../utils/requests'

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
 *   CO-005's case, not this one;
 * - a Business invoice carries exactly taxCode + receiptEmail +
 *   receiptPhoneNumber, and must not carry the Personal-only fields;
 * - the quote is at or beyond ahamove.free_ship, so the shipping fee is charged
 *   in full - this is the paid-shipping counterpart to CO-001's waiver.
 *
 * This is also the **only** spec that lets the VietQR tax lookup run for real,
 * because the lookup panel is its subject. Everywhere else a tax code is typed
 * the panel is incidental - see COVERAGE-PLAN-v2.md §1.
 *
 * Payment is not completed unless E2E_WAIT_FOR_PAYMENT=1. With the flag on, the
 * test parks on the order detail page until the webhook lands. Unlike CO-001 and
 * CO-002 there is no Ahamove booking to wait for: a scheduled order is
 * dispatched on its delivery date, not on payment.
 */

const QUANTITY = 1

// the whole point of this case: the address has to sit outside the free-ship radius
orderTest.use({ addressSpec: PAID_SHIP_ADDRESS })

orderTest(
  'CO-003 - Đặt hàng hẹn ngày giao kèm hoá đơn VAT công ty',
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
    const createOrders = countPostsTo(page, CREATE_ORDER_PATH)
    const estimates = countPostsTo(page, ESTIMATE_PATH)
    // the tax lookup is a third-party call fired from the browser, 500ms after
    // the last keystroke
    const taxLookups = countRequests(page, (request) => {
      const { host, pathname } = new URL(request.url())

      return host === 'api.vietqr.io' && pathname.startsWith('/v2/business/')
    })

    const freeShipKm = await getFreeShipKm(page)
    const deliverySlot = await getFirstDeliverySlot(page)

    const deliveryDate = scheduledDeliveryDate()
    const expectedOrderTime = orderTimeOf(deliveryDate)

    // Step 1 - see addressTest at e2e/fixtures/address.ts

    // Step 2 - go to products page, filter, click to view detail and add to cart
    let variantLabel = ''

    await orderTest.step('filter products and add to cart', async () => {
      variantLabel = await products.addFixtureToCart(PRIMARY_PRODUCT)
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

      await checkout.setNote(ORDER_NOTE)
    })

    // Step 5 - leaving step 1 fires the Ahamove quote the whole case hangs on
    let quote: ShippingQuote

    await orderTest.step('continue to payment and capture the quote', async () => {
      quote = await checkout.goToPaymentCapturingQuote()

      // the first wire proof of the encoding: seconds, and not 0
      expect(quote.payload.orderTime).toBe(expectedOrderTime)
      expect(quote.payload.tagIds).toEqual([deliverySlot.value])

      expectOutsideFreeShipRadius(quote.cheapest.data.distance, freeShipKm, PAID_SHIP_ADDRESS)

      expect(quote.cheapest.data.total_fee, 'a charged delivery cannot be free').toBeGreaterThan(0)
    })

    // Step 6 - the defaults step 2 lands on
    await orderTest.step('check the payment step defaults', async () => {
      await checkout.expectDefaultPaymentSelections(quote.cheapest.service_id)
    })

    // Step 7 - the Business invoice, and the fields it must not ask for
    await orderTest.step('fill the business invoice', async () => {
      await checkout.enableInvoice()

      // the switch defaults to Cá nhân, which is the tab that owns CCCD/CMND
      await expect(checkout.identityNumber).toBeVisible()

      await checkout.fillBusinessInvoice(BUSINESS_INVOICE)

      // Doanh nghiệp asks for the tax code and nothing personal
      await expect(checkout.taxCode).toHaveValue(BUSINESS_INVOICE.taxCode)
      await expect(checkout.identityNumber).toHaveCount(0)
      await expect(checkout.receiptFullName).toHaveCount(0)
      await expect(checkout.receiptAddress).toHaveCount(0)
    })

    await orderTest.step('check the tax-code lookup panel', async () => {
      // fired 500ms after the last keystroke, so wait on the resolved panel
      // rather than on the request
      await expect(checkout.taxLookupPanel).toContainText(TAX_BUSINESS_NAME)
      await expect(checkout.taxLookupPanel).toContainText(BUSINESS_INVOICE.taxCode)
      await expect(checkout.taxLookupPanel).not.toContainText('Không tìm thấy')
      await expect(checkout.taxLookupPanel).not.toContainText('Đang tra cứu')

      expect(taxLookups.count, 'typing a tax code must trigger the VietQR lookup').toBeGreaterThan(0)
    })

    // Step 8 - the sidebar charges for shipping and adds VAT on top
    let productsSubtotal = 0
    let expectedVat = 0
    let uiTotals: UiTotals

    await orderTest.step('check the VAT and the charged shipping in the sidebar', async () => {
      const rawShippingFee = quote.cheapest.data.total_fee

      productsSubtotal = await checkout.sidebarAmount('Tạm tính')
      expectedVat = Math.round(productsSubtotal * 0.08)

      expect(await checkout.sidebarAmount('VAT 8%')).toBe(expectedVat)
      expect(await checkout.sidebarAmount('Phí vận chuyển')).toBe(rawShippingFee)

      // the discount row is the only visible proof the free-ship branch fired,
      // so its absence is the assertion that the fee is really being charged
      await expect(checkout.sidebarRow('Giảm giá (bán kính miễn phí ship)')).toHaveCount(0)

      expect(await checkout.sidebarTotalAmount()).toBe(productsSubtotal + expectedVat + rawShippingFee)

      // the only case in the suite where all three parts are non-zero, so it is
      // the strongest check that the server agrees with the sidebar. The client
      // rounds its VAT preview and the server does not, so a subtotal whose 8%
      // is fractional would surface right here
      uiTotals = {
        productsSubtotal,
        shippingFee: rawShippingFee,
        vatAmount: expectedVat,
        grandTotal: await checkout.sidebarTotalAmount()
      }
    })

    // Step 9 - submit. The request body has to be captured before the click.
    let checkoutPayload: Record<string, unknown>

    await orderTest.step('place the order', async () => {
      const createRequest = waitForCreateOrderRequest(page)

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
        // charged in full, unlike CO-001. The server's CreateOrderRequest has no
        // fee fields, so this one is sent and dropped - it pins what the client
        // believes, never what the customer is charged
        shippingFee: quote.cheapest.data.total_fee,
        orderTime: expectedOrderTime,
        tagIds: [deliverySlot.value],
        remarks: ORDER_NOTE,
        phoneReceiver: savedAddress.phoneNumber,
        isExportInvoice: true,
        invoiceType: 'Business',
        taxCode: BUSINESS_INVOICE.taxCode,
        receiptEmail: BUSINESS_INVOICE.email,
        receiptPhoneNumber: BUSINESS_INVOICE.phoneNumber,
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
      expect(checkoutPayload.latitude).toBe(quote.payload.latitude)
      expect(checkoutPayload.longitude).toBe(quote.payload.longitude)
      expect(checkoutPayload.address).toBe(quote.payload.address)
      expect(checkoutPayload.latitude).not.toBe(0)
      expect(checkoutPayload.longitude).not.toBe(0)
    })

    // Step 11 - what the customer sees on the order they just created
    await orderTest.step('check the created order in the UI', async () => {
      await expect(order.statusBadge).toHaveText('Chờ xác nhận')

      await expect(order.section('Sản phẩm')).toContainText(variantLabel)
      await expect(order.section('Ghi chú của khách')).toContainText(ORDER_NOTE)

      // the summary card repeats the sidebar the order was placed from: VAT on
      // top, and shipping that was never waived
      expect(await order.amount('Tạm tính')).toBe(productsSubtotal)
      expect(await order.amount('Phí vận chuyển')).toBe(quote.cheapest.data.total_fee)
      expect(await order.amount('VAT 8%')).toBeGreaterThan(0)
      await expect(order.row('Phương thức thanh toán')).toHaveText('VA')

      // the recipient card is where the shipping address surfaces in the UI
      const recipient = order.section('Thông tin nhận hàng')
      await expect(recipient).toContainText(savedAddress.phoneNumber)
      await expect(recipient).toContainText(savedAddress.addressLineText)
      await expect(order.field('Địa chỉ')).toContainText(savedAddress.ward)
      await order.expectMapPinDropped()

      // the invoice card is the customer-visible half of the accounting data
      const invoice = order.section('Thông tin hoá đơn')
      await expect(order.rowIn(invoice, 'Loại hoá đơn')).toHaveText('Doanh nghiệp')
      await expect(order.rowIn(invoice, 'Mã số thuế')).toHaveText(BUSINESS_INVOICE.taxCode)
      await expect(invoice).toContainText(BUSINESS_INVOICE.email)
      await expect(invoice).toContainText(BUSINESS_INVOICE.phoneNumber)

      // nothing personal may reach a company invoice
      await expect(order.rowIn(invoice, 'CCCD/CMND')).toHaveCount(0)
      await expect(order.field('Họ và tên người nhận hoá đơn')).toHaveCount(0)
      await expect(order.field('Địa chỉ nhận hoá đơn')).toHaveCount(0)

      // nothing has been paid yet, and the delivery entry reads as the scheduled
      // day rather than as immediate
      await order.expectUnpaidTimeline()

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
        shippingFee: quote.cheapest.data.total_fee,
        isExportInvoice: true,
        invoiceType: 'Business',
        taxCode: BUSINESS_INVOICE.taxCode,
        receiptEmail: BUSINESS_INVOICE.email,
        receiptPhoneNumber: BUSINESS_INVOICE.phoneNumber,
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

      // the server charges productFee * 0.08 with no rounding, while the sidebar
      // previews Math.round of the same thing. They agree for the whole-thousand
      // prices the catalogue uses, and a subtotal whose 8% is fractional is
      // exactly the case where the customer would be shown one total and charged
      // another - so say so before the assertion below fails on it
      if (detail.vatFee !== expectedVat) {
        console.log(
          `\n  VAT drift on order ${order.id}: the sidebar previewed ${expectedVat} ` +
            `(rounded 8% of ${productsSubtotal}) but the server charged ${detail.vatFee}.\n` +
            '  The client rounds and the server does not - see use-checkout-summary.ts.\n'
        )
      }

      // the backend prices every line itself and ignores the fees the client
      // sent, so this is the check that the sidebar the customer confirmed is
      // the amount they will actually be charged
      await expectServerTotalsMatchUi(page, order.id, uiTotals)

      expect(Number(detail.paymentMethod)).toBe(1)
      expect(detail.remark).toContain(ORDER_NOTE)

      expect(detail.details).toHaveLength(1)
      expect(detail.details[0].number).toBe(QUANTITY)
    })

    await orderTest.step('check nothing was created twice', async () => {
      expect(createOrders.count, 'a single submit must create a single order').toBe(1)
      expect(estimates.count, 'leaving step 1 must quote exactly once').toBe(1)
    })

    // Step 13 - hold here, pay the order by hand, then check what the webhook
    // turned it into. Opt-in, because it blocks on a human, and the fixture
    // leaves the order uncancelled while the flag is on.
    if (WAIT_FOR_PAYMENT) {
      await orderTest.step('wait for the payment, then check the paid order', async () => {
        announcePaymentWait(order)

        await order.waitForPaid(PAYMENT_TIMEOUT_MS)

        await order.expectTransferCard()

        // the same transaction unlocks the paid timeline entry, and the schedule
        // has to survive the payment
        await expect(order.section('Nhật ký đơn hàng')).toContainText('Xác nhận thanh toán')
        await expect(order.field('Ngày giao dự kiến')).toContainText(
          formatDate(deliveryDate, 'dateMedium', { locale: 'vi-VN' })
        )

        await order.expectPaymentActionsGone()

        // the payment only counts once the backend says so, and the customer has
        // to have paid for the shipping and the VAT as well as the flowers
        const paid = await getOrder(page, order.id)

        expect(paid.status).toBe('Paid')
        expect(paid.shippingFee).toBe(quote.cheapest.data.total_fee)
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
