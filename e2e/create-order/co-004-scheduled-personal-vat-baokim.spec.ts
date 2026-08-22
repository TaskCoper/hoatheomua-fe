import type { OrderDetail } from '@/features/orders/types'
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
import { FREE_SHIP_ADDRESS, PAID_SHIP_ADDRESS, RECEIVER_PHONE } from '../fixtures/address'
import { PERSONAL_INVOICE } from '../fixtures/invoice'
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
  CREATE_ADDRESS_PATH,
  CREATE_ORDER_PATH,
  ESTIMATE_PATH,
  isOrderStatusPoll,
  waitForCreateOrderRequest
} from '../utils/requests'

/**
 * CO-004 - manually typed address outside the free-ship radius, scheduled
 * delivery, Personal VAT invoice, paid shipping, BaoKim.
 *
 * Two rules meet here and nothing else covers either of them:
 *
 * - a Personal invoice carries five fields - identityNumber, receiptFullName,
 *   receiptAddress, receiptEmail, receiptPhoneNumber - and no tax code, which is
 *   the mirror image of CO-003's Business invoice;
 * - a Personal invoice is the one case where "the customer asked for an invoice"
 *   and "the customer is charged VAT" come apart. The server keys VAT off the tax
 *   code, not off isExportInvoice, so this order carries an invoice and no VAT.
 *
 * This case was written against SePay. That webhook is currently broken, so it
 * was converted to BaoKim rather than deleted - the scenario above is covered
 * nowhere else. Two things moved out rather than being lost: the gateway/payment
 * method coupling is now CO-013, and the SePay QR panel lives only in the
 * CO-022..CO-025 spec documents, blocked until the webhook returns.
 *
 * Payment is not completed unless E2E_WAIT_FOR_PAYMENT=1. With the flag on, the
 * test parks on the order detail page until the webhook lands and then checks
 * the paid order - a scheduled order, so the Ahamove booking must NOT happen.
 */

const QUANTITY = 1

// the saved address only exists so the 'Nhập địa chỉ mới' toggle renders, and it
// is the in-radius one - the typed address is the paid-ship one, so a silent
// fallback to the saved default would waive the shipping fee and fail loudly
orderTest.use({ addressSpec: FREE_SHIP_ADDRESS })

orderTest(
  'CO-004 - Đặt hàng hẹn ngày giao kèm hoá đơn VAT cá nhân',
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
    // the fixture saved its address during setup, so this counter only ever sees
    // what checkout itself does - which must be nothing
    const createAddresses = countPostsTo(page, CREATE_ADDRESS_PATH)
    // the detail page polls this every 5s while the order is Pending
    const statusPolls = countRequests(page, isOrderStatusPoll)

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

      await checkout.setNote(ORDER_NOTE)
    })

    // Step 6 - leaving step 1 fires the Ahamove quote the whole case hangs on
    let quote: ShippingQuote

    await orderTest.step('continue to payment and capture the quote', async () => {
      quote = await checkout.goToPaymentCapturingQuote()

      // the quote has to be for the typed address, not the saved default
      expect(quote.payload.address).toBe(typedAddress)
      // the first wire proof of the encoding: seconds, and not 0
      expect(quote.payload.orderTime).toBe(expectedOrderTime)
      expect(quote.payload.tagIds).toEqual([deliverySlot.value])

      expectOutsideFreeShipRadius(quote.cheapest.data.distance, freeShipKm, PAID_SHIP_ADDRESS)

      expect(quote.cheapest.data.total_fee, 'a charged delivery cannot be free').toBeGreaterThan(0)
    })

    // Step 7 - the defaults step 2 lands on. The gateway is left untouched, the
    // way a BaoKim customer would leave it; the coupling between gateway and
    // payment method is CO-013's subject.
    //
    // Switching the gateway and switching back made this case's submit click get
    // swallowed 3/3, which is how the checkout submit race was found. It is not
    // gateway-specific - see README open risk #5 - but there is no reason to walk
    // into it here when CO-013 covers the coupling on its own.
    await orderTest.step('check the payment step defaults', async () => {
      await checkout.expectDefaultPaymentSelections(quote.cheapest.service_id)
    })

    // Step 8 - the Personal invoice, and the field it must not ask for
    await orderTest.step('fill the personal invoice', async () => {
      await checkout.enableInvoice()

      await checkout.fillPersonalInvoice(PERSONAL_INVOICE)

      // Cá nhân asks for a CCCD and never for a tax code
      await expect(checkout.identityNumber).toHaveValue(PERSONAL_INVOICE.identityNumber)
      await expect(checkout.receiptFullName).toHaveValue(PERSONAL_INVOICE.fullName)
      await expect(checkout.receiptAddress).toHaveValue(PERSONAL_INVOICE.address)
      await expect(checkout.taxCode).toHaveCount(0)
    })

    // Step 9 - shipping is charged in full, and a Personal invoice previews no VAT
    let productsSubtotal = 0
    let uiTotals: UiTotals

    await orderTest.step('check the charged shipping in the sidebar', async () => {
      const rawShippingFee = quote.cheapest.data.total_fee

      productsSubtotal = await checkout.sidebarAmount('Tạm tính')

      expect(await checkout.sidebarAmount('Phí vận chuyển')).toBe(rawShippingFee)

      // the discount row is the only visible proof the free-ship branch fired,
      // so its absence is the assertion that the fee is really being charged
      await expect(checkout.sidebarRow('Giảm giá (bán kính miễn phí ship)')).toHaveCount(0)

      // hasTaxCode gates the VAT row, and a Personal invoice has no tax code -
      // so unlike CO-003 the customer is shown no VAT at all
      await expect(checkout.sidebarRow('VAT 8%')).toHaveCount(0)

      expect(await checkout.sidebarTotalAmount()).toBe(productsSubtotal + rawShippingFee)

      // an invoice was requested and no VAT was previewed, so the server must not
      // charge any - this is the case where the two come apart
      uiTotals = {
        productsSubtotal,
        shippingFee: rawShippingFee,
        vatAmount: 0,
        grandTotal: await checkout.sidebarTotalAmount()
      }
    })

    // Step 10 - submit. The request body has to be captured before the click.
    let checkoutPayload: Record<string, unknown>

    await orderTest.step('place the order', async () => {
      const createRequest = waitForCreateOrderRequest(page)

      await checkout.placeOrder()

      // register cleanup before any assertion can throw
      createdOrders.push(order.id)

      checkoutPayload = (await createRequest).postDataJSON()
    })

    // Step 11 - the payload is the only place the gateway exists at all
    await orderTest.step('check the create-order request body', async () => {
      expect(checkoutPayload).toMatchObject({
        gateway: 'BaoKim',
        // orderService.createOrder coerces the form's '1' to a number
        paymentMethod: 1,
        // charged in full, unlike CO-002. The server's CreateOrderRequest has no
        // fee fields, so this one is sent and dropped - it pins what the client
        // believes, never what the customer is charged
        shippingFee: quote.cheapest.data.total_fee,
        orderTime: expectedOrderTime,
        tagIds: [deliverySlot.value],
        remarks: ORDER_NOTE,
        phoneReceiver: RECEIVER_PHONE,
        isExportInvoice: true,
        invoiceType: 'Personal',
        identityNumber: PERSONAL_INVOICE.identityNumber,
        receiptFullName: PERSONAL_INVOICE.fullName,
        receiptAddress: PERSONAL_INVOICE.address,
        receiptEmail: PERSONAL_INVOICE.email,
        receiptPhoneNumber: PERSONAL_INVOICE.phoneNumber,
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
      expect(checkoutPayload.latitude).toBe(quote.payload.latitude)
      expect(checkoutPayload.longitude).toBe(quote.payload.longitude)
      expect(checkoutPayload.latitude).not.toBe(0)
      expect(checkoutPayload.longitude).not.toBe(0)
    })

    // Step 12 - what the customer sees on the order they just created
    await orderTest.step('check the created order in the UI', async () => {
      await expect(order.statusBadge).toHaveText('Chờ xác nhận')

      await expect(order.section('Sản phẩm')).toContainText(variantLabel)
      await expect(order.section('Ghi chú của khách')).toContainText(ORDER_NOTE)

      // the summary card repeats the sidebar the order was placed from: shipping
      // that was never waived, and no VAT row
      expect(await order.amount('Tạm tính')).toBe(productsSubtotal)
      expect(await order.amount('Phí vận chuyển')).toBe(quote.cheapest.data.total_fee)
      await expect(order.row('VAT 8%')).toHaveCount(0)
      await expect(order.row('Phương thức thanh toán')).toHaveText('VA')

      // the recipient card is where the typed address surfaces in the UI
      const recipient = order.section('Thông tin nhận hàng')
      await expect(recipient).toContainText(RECEIVER_PHONE)
      await expect(recipient).toContainText(PAID_SHIP_ADDRESS.addressLineText)
      await expect(order.field('Địa chỉ')).toContainText(PAID_SHIP_ADDRESS.ward)
      await order.expectMapPinDropped()

      // the invoice card is the customer-visible half of the accounting data
      const invoice = order.section('Thông tin hoá đơn')
      await expect(order.rowIn(invoice, 'Loại hoá đơn')).toHaveText('Cá nhân và HKD')
      await expect(order.rowIn(invoice, 'CCCD/CMND')).toHaveText(PERSONAL_INVOICE.identityNumber)
      await expect(order.field('Họ và tên người nhận hoá đơn')).toHaveText(PERSONAL_INVOICE.fullName)
      await expect(order.field('Địa chỉ nhận hoá đơn')).toHaveText(PERSONAL_INVOICE.address)
      await expect(invoice).toContainText(PERSONAL_INVOICE.email)
      await expect(invoice).toContainText(PERSONAL_INVOICE.phoneNumber)

      // a tax code belongs to a company invoice, and this order has none
      await expect(order.rowIn(invoice, 'Mã số thuế')).toHaveCount(0)

      // nothing has been paid yet, and the delivery entry reads as the scheduled
      // day rather than as immediate
      await order.expectUnpaidTimeline()

      const deliveryEntry = order.field('Ngày giao dự kiến')
      await expect(deliveryEntry).toContainText(formatDate(deliveryDate, 'dateMedium', { locale: 'vi-VN' }))
      await expect(deliveryEntry).toContainText(deliverySlot.label)
      await expect(deliveryEntry).not.toContainText('Ngay sau khi thanh toán')

      // a BaoKim order is paid by following the gateway redirect, so the CTA has
      // to be there - it renders only for a paymentUrl
      await expect(order.payNow).toBeVisible()
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
        shippingFee: quote.cheapest.data.total_fee,
        isExportInvoice: true,
        invoiceType: 'Personal',
        identityNumber: PERSONAL_INVOICE.identityNumber,
        receiptFullName: PERSONAL_INVOICE.fullName,
        receiptAddress: PERSONAL_INVOICE.address,
        receiptEmail: PERSONAL_INVOICE.email,
        receiptPhoneNumber: PERSONAL_INVOICE.phoneNumber,
        taxCode: null,
        // no webhook has been sent, so nothing may have been recorded as paid
        transaction: null,
        // the recipient card renders these straight from the detail response
        phoneReceiver: RECEIVER_PHONE
      })

      expect(detail.address).toBe(typedAddress)

      // seconds, in the future - a milliseconds regression lands ~55000 years out
      expect(detail.orderTime).toBeGreaterThan(Math.floor(Date.now() / 1000))

      expect(Number(detail.paymentMethod)).toBe(1)
      expect(detail.remark).toContain(ORDER_NOTE)

      expect(detail.details).toHaveLength(1)
      expect(detail.details[0].number).toBe(QUANTITY)

      // the sidebar the customer confirmed showed no VAT row at all - hasTaxCode
      // gates it and a Personal invoice has no tax code - so the server charging
      // any VAT here would bill more than was ever displayed. The server agrees
      // by construction: it keys VAT off the tax code too, not off the invoice
      // toggle, which makes this the one order that carries an invoice and no VAT
      expect(detail.vatFee, 'a Personal invoice was previewed without VAT, so none may be charged').toBe(0)

      // the backend prices every line itself and ignores the fees the client
      // sent, so this is the check that the sidebar the customer confirmed is
      // the amount they will actually be charged
      await expectServerTotalsMatchUi(page, order.id, uiTotals)
    })

    // Step 14 - the gateway redirect is the only way to pay a BaoKim order
    await orderTest.step('check the BaoKim payment handoff', async () => {
      expect(
        detail.paymentUrl,
        'a BaoKim order came back without a paymentUrl - the customer has no way to pay it'
      ).toBeTruthy()

      // showSepayQr renders the QR panel whenever a sepayUrl is present, so a
      // BaoKim order carrying one would show the customer two ways to pay
      expect(detail.sepayUrl, 'a BaoKim order must not also carry a SePay QR URL').toBeFalsy()
      await expect(order.sepayQrImage).toHaveCount(0)

      // the CTA is a button wrapped in the gateway anchor, so the href is what
      // actually carries the customer to BaoKim
      await expect(order.payNow).toBeVisible()
      await expect(order.payNow.locator('xpath=ancestor::a[1]')).toHaveAttribute('href', detail.paymentUrl as string)

      // the transfer card is the paid-order twin of this handoff
      await expect(order.section('Thông tin chuyển khoản')).toHaveCount(0)
    })

    await orderTest.step('check the order stays pending and unsaved', async () => {
      expect(createOrders.count, 'a single submit must create a single order').toBe(1)
      expect(estimates.count, 'leaving step 1 must quote exactly once').toBe(1)

      expect(createAddresses.count, 'checkout must never persist the address it was given').toBe(0)

      // useGetOrderStatus polls every 5s while the order is Pending - that poll
      // is what flips the page over when the webhook lands, so a regression that
      // silences it strands the customer on a stale page
      await expect
        .poll(() => statusPolls.count, {
          timeout: 20_000,
          message: 'the detail page must poll GET /orders/{id}/status while the order is Pending'
        })
        .toBeGreaterThanOrEqual(2)

      // and with no webhook sent, every one of those polls has to have come back
      // Pending
      await expect(order.statusBadge).toHaveText('Chờ xác nhận')
      expect((await getOrder(page, order.id)).transaction).toBeNull()
    })

    // Step 15 - hold here, pay the order by hand, then check what the webhook
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

        const paidDeliveryEntry = order.field('Ngày giao dự kiến')
        await expect(paidDeliveryEntry).toContainText(formatDate(deliveryDate, 'dateMedium', { locale: 'vi-VN' }))
        await expect(paidDeliveryEntry).toContainText(deliverySlot.label)

        await order.expectPaymentActionsGone()

        const paid = await getOrder(page, order.id)

        expect(paid.status).toBe('Paid')
        expect(paid.transaction).not.toBeNull()
        expect(paid.transaction?.transferAmount).toBe(paid.totalFee)

        // the invoice survives the payment, and a Personal one still carries no
        // VAT - paying must not retro-apply a tax the customer never agreed to
        expect(paid.isExportInvoice).toBe(true)
        expect(paid.invoiceType).toBe('Personal')
        expect(paid.vatFee).toBe(0)
        expect(paid.totalFee).toBe(productsSubtotal + quote.cheapest.data.total_fee)

        // same rule as CO-003: a scheduled order is booked on its delivery date,
        // so paying it must not hand the ride to Ahamove yet
        expect(paid.ahahaMoveOrderId).toBeFalsy()
        expect(paid.ahahaMoveTrackingUrl).toBeFalsy()

        await page.reload()
        await expect(order.section('Theo dõi đơn hàng')).toHaveCount(0)
      })
    }
  }
)
