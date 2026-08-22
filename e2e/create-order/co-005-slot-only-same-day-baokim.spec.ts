import { formatDate } from '@/lib/date/format'
import { expect } from '@playwright/test'
import type { UiTotals } from '../api/orders.api'
import {
  expectInsideFreeShipRadius,
  expectServerTotalsMatchUi,
  getFirstDeliverySlot,
  getFreeShipKm,
  getOrder
} from '../api/orders.api'
import { FREE_SHIP_ADDRESS } from '../fixtures/address'
import { NO_INVOICE_FIELDS } from '../fixtures/invoice'
import { orderTest } from '../fixtures/order'
import { ORDER_NOTE, PRIMARY_PRODUCT } from '../fixtures/products'
import { CartPage } from '../pages/cart.page'
import { CheckoutPage, type ShippingQuote } from '../pages/checkout.page'
import { OrderPage } from '../pages/order.page'
import { ProductPage } from '../pages/product.page'
import { announcePaymentWait, PAID_ORDER_TEST_TIMEOUT_MS, PAYMENT_TIMEOUT_MS, WAIT_FOR_PAYMENT } from '../utils/payment'
import { countPostsTo, CREATE_ORDER_PATH, ESTIMATE_PATH, waitForCreateOrderRequest } from '../utils/requests'

/**
 * CO-005 - saved address, a delivery slot with no date, no invoice, free
 * shipping, BaoKim.
 *
 * The third reachable delivery combination, and the one that is easiest to lose:
 * a slot schedules the order on its own. The calendar collapses "today" to
 * orderTime 0 (checkout-fields.tsx), so this order carries orderTime 0 exactly
 * like CO-001's immediate one - the tag is the only thing that distinguishes
 * them. Anything that decides "scheduled" from orderTime alone silently
 * downgrades this customer's chosen window to "as soon as it is paid".
 *
 * Everything else is held at CO-001's values so a failure here can only be about
 * the slot.
 *
 * Payment is not completed unless E2E_WAIT_FOR_PAYMENT=1. With the flag on the
 * test parks on the order detail page until the webhook lands. Like CO-003 and
 * unlike CO-001, there is no Ahamove booking to wait for: only an immediate
 * order is dispatched on payment, and the slot makes this one scheduled.
 */

const QUANTITY = 1

orderTest.use({ addressSpec: FREE_SHIP_ADDRESS })

orderTest(
  'CO-005 - Đặt hàng giao trong ngày theo khung giờ',
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

    const freeShipKm = await getFreeShipKm(page)
    const deliverySlot = await getFirstDeliverySlot(page)

    // with no date the delivery day is the day the order was placed, which is
    // what the detail page falls back to
    const todayLabel = formatDate(new Date(), 'dateMedium', { locale: 'vi-VN' })

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

    // Step 4 - pick the fixture address, pick a slot and *nothing else*
    await orderTest.step('choose the saved address and pick a slot with no date', async () => {
      await checkout.pickSavedAddress(savedAddress.receiverName)

      await expect(checkout.addressPicker).toContainText(savedAddress.receiverName)
      await expect(checkout.addressPicker).toContainText(savedAddress.phoneNumber)
      await expect(checkout.addressPicker).toContainText(savedAddress.addressLineText)

      await checkout.selectDeliverySlot(deliverySlot.label)

      // the calendar is never opened, so the clear affordance must stay absent -
      // that is the whole premise of the case, and it has to hold *after* the
      // slot was picked, not just before
      await expect(checkout.deliveryDateClear).toHaveCount(0)

      // the checkout has always read a slot-only order as "today, in this
      // window": the sidebar dates it today even though orderTime is 0
      await expect(checkout.sidebarRow('Ngày giao hàng')).toHaveText(
        formatDate(new Date(), 'dateLong', { locale: 'vi-VN' })
      )
      await expect(checkout.sidebarRow('Thời gian giao')).toHaveText(deliverySlot.label)

      await checkout.setNote(ORDER_NOTE)
    })

    // Step 5 - leaving step 1 fires the Ahamove quote
    let quote: ShippingQuote

    await orderTest.step('continue to payment and capture the quote', async () => {
      quote = await checkout.goToPaymentCapturingQuote()

      // the pair this case exists for: no timestamp, but a slot
      expect(quote.payload.orderTime).toBe(0)
      expect(quote.payload.tagIds).toEqual([deliverySlot.value])

      expectInsideFreeShipRadius(quote.cheapest.data.distance, freeShipKm, FREE_SHIP_ADDRESS)
    })

    // Step 6 - the defaults step 2 lands on
    await orderTest.step('check the payment step defaults', async () => {
      await checkout.expectDefaultPaymentSelections(quote.cheapest.service_id)
    })

    // Step 7 - a slot must not change what is charged
    let productsSubtotal = 0
    let uiTotals: UiTotals

    await orderTest.step('check the free-ship discount in the sidebar', async () => {
      const rawShippingFee = quote.cheapest.data.total_fee

      productsSubtotal = await checkout.sidebarAmount('Tạm tính')

      expect(await checkout.sidebarAmount('Phí vận chuyển')).toBe(rawShippingFee)
      expect(await checkout.sidebarAmount('Giảm giá (bán kính miễn phí ship)')).toBe(-rawShippingFee)

      // no invoice means no VAT row, and the waiver means no shipping in the total
      await expect(checkout.sidebarRow('VAT 8%')).toHaveCount(0)
      expect(await checkout.sidebarTotalAmount()).toBe(productsSubtotal)

      // picking a slot must not quietly re-price the order, so the same totals
      // check CO-001 runs has to hold here too
      uiTotals = {
        productsSubtotal,
        shippingFee: 0,
        vatAmount: 0,
        grandTotal: await checkout.sidebarTotalAmount()
      }
    })

    // Step 8 - submit. The request body has to be captured before the click.
    let checkoutPayload: Record<string, unknown>

    await orderTest.step('place the order', async () => {
      const createRequest = waitForCreateOrderRequest(page)

      await checkout.placeOrder()

      // register cleanup before any assertion can throw
      createdOrders.push(order.id)

      checkoutPayload = (await createRequest).postDataJSON()
    })

    // Step 9 - the payload is the only place the address and the gateway exist
    await orderTest.step('check the create-order request body', async () => {
      expect(checkoutPayload).toMatchObject({
        ...NO_INVOICE_FIELDS,
        gateway: 'BaoKim',
        // orderService.createOrder coerces the form's '1' to a number
        paymentMethod: 1,
        // the server's CreateOrderRequest has no fee fields, so this one is sent
        // and dropped. It is asserted to pin what the client believes, never as
        // a check on what the customer is charged - see expectServerTotalsMatchUi
        shippingFee: 0,
        // the slot travels alone - buildCheckoutPayload must not invent a date
        // for it, and must not drop it for the want of one
        orderTime: 0,
        tagIds: [deliverySlot.value],
        remarks: ORDER_NOTE,
        phoneReceiver: savedAddress.phoneNumber
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

    // Step 10 - what the customer sees on the order they just created
    await orderTest.step('check the created order in the UI', async () => {
      await expect(order.statusBadge).toHaveText('Chờ xác nhận')

      await expect(order.section('Sản phẩm')).toContainText(variantLabel)
      await expect(order.section('Ghi chú của khách')).toContainText(ORDER_NOTE)

      // a slot changes nothing about the money
      expect(await order.amount('Tạm tính')).toBe(productsSubtotal)
      expect(await order.amount('Phí vận chuyển')).toBe(0)
      await expect(order.row('VAT 8%')).toHaveCount(0)
      expect(await order.amount('Tổng cộng')).toBe(productsSubtotal)
      await expect(order.row('Phương thức thanh toán')).toHaveText('VA')

      // the recipient card is where the shipping address surfaces in the UI
      const recipient = order.section('Thông tin nhận hàng')
      await expect(recipient).toContainText(savedAddress.phoneNumber)
      await expect(recipient).toContainText(savedAddress.addressLineText)
      await expect(order.field('Địa chỉ')).toContainText(savedAddress.ward)
      await order.expectMapPinDropped()

      await expect(order.section('Thông tin hoá đơn')).toContainText('Không xuất hoá đơn')

      // the assertion the whole case is built around: orderTime is 0, but the
      // customer picked a window, so the timeline must read as a scheduled
      // delivery on the day the order was placed - never as immediate
      await order.expectUnpaidTimeline()

      const deliveryEntry = order.field('Ngày giao dự kiến')
      await expect(deliveryEntry).toContainText(todayLabel)
      await expect(deliveryEntry).toContainText(deliverySlot.label)
      await expect(deliveryEntry).not.toContainText('Ngay sau khi thanh toán')

      // BaoKim hands back a redirect URL, so the SePay QR card must not render
      await expect(order.section('Thanh toán đơn hàng')).toHaveCount(0)
      await expect(order.payNow).toBeVisible()
      await expect(order.cancelOrder).toBeVisible()
    })

    // Step 11 - the strongest verification available: read the order back
    await orderTest.step('check the created order over the API', async () => {
      const detail = await getOrder(page, order.id)

      expect(detail).toMatchObject({
        ...NO_INVOICE_FIELDS,
        status: 'Pending',
        orderTime: 0,
        // the slot has to survive the round trip - an empty tagsId here is the
        // regression this case exists to catch
        tagsId: [deliverySlot.value],
        shippingFee: 0,
        vatFee: 0,
        transaction: null,
        // the recipient card renders these straight from the detail response
        phoneReceiver: savedAddress.phoneNumber
      })

      expect(detail.address).toBe(checkoutPayload.address)

      // no shipping, no VAT
      expect(detail.totalFee).toBe(detail.productFee)

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

    // Step 12 - hold here, pay the order by hand, then check what the webhook
    // turned it into. Opt-in, because it blocks on a human, and the fixture
    // leaves the order uncancelled while the flag is on.
    if (WAIT_FOR_PAYMENT) {
      await orderTest.step('wait for the payment, then check the paid order', async () => {
        announcePaymentWait(order)

        await order.waitForPaid(PAYMENT_TIMEOUT_MS)

        await order.expectTransferCard()

        // the same transaction unlocks the paid timeline entry, and the slot has
        // to survive the payment rather than collapsing to immediate
        await expect(order.section('Nhật ký đơn hàng')).toContainText('Xác nhận thanh toán')
        await expect(order.field('Ngày giao dự kiến')).toContainText(deliverySlot.label)
        await expect(order.field('Ngày giao dự kiến')).not.toContainText('Ngay sau khi thanh toán')

        await order.expectPaymentActionsGone()

        // the payment only counts once the backend says so, and the waiver has
        // to survive it: the customer pays for the products alone
        const paid = await getOrder(page, order.id)

        expect(paid.status).toBe('Paid')
        expect(paid.shippingFee).toBe(0)
        expect(paid.totalFee).toBe(productsSubtotal)
        expect(paid.transaction).not.toBeNull()
        expect(paid.transaction?.transferAmount).toBe(paid.totalFee)
        expect(paid.tagsId).toEqual([deliverySlot.value])

        // only an immediate order is handed to Ahamove on payment - see CO-001,
        // which waits for the booking. The slot makes this one scheduled, so it
        // is dispatched for its window and there is nothing to wait for here
        expect(paid.ahahaMoveOrderId).toBeFalsy()
        expect(paid.ahahaMoveTrackingUrl).toBeFalsy()

        await page.reload()
        await expect(order.section('Theo dõi đơn hàng')).toHaveCount(0)
      })
    }
  }
)
