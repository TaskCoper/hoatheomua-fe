import type { AhamoveResult } from '@/features/orders/ahamove.type'
import { formatDate } from '@/lib/date/format'
import { expect } from '@playwright/test'
import { getAddressCount, getFreeShipKm, getOrder, getOrderTags } from '../api/orders.api'
import { FREE_SHIP_ADDRESS } from '../fixtures/address'
import { orderTest } from '../fixtures/order'
import { CartPage } from '../pages/cart.page'
import { CheckoutPage } from '../pages/checkout.page'
import { OrderPage } from '../pages/order.page'
import { ProductPage } from '../pages/product.page'
import { announcePaymentWait, PAID_ORDER_TEST_TIMEOUT_MS, PAYMENT_TIMEOUT_MS, WAIT_FOR_PAYMENT } from '../utils/payment'
import { dismissPromoPopup } from '../utils/promo-popup'

/**
 * CO-013 - saved address, a delivery slot with no date, no invoice, free
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

const SEARCH_TERM = 'Coral Pink'
const PRODUCT_NAME = 'Bó Coral Pink_2026'
const PRODUCT_ID = 'a10efc5a-ad03-4102-9e1e-5807e3f7a38c'
const NOTE = 'DEV TEST - Không xử lý đơn hàng này.'
const QUANTITY = 1

orderTest.use({ addressSpec: FREE_SHIP_ADDRESS })

orderTest(
  'CO-013 saved address, delivery slot with no date, no invoice, free ship, BaoKim',
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

    page.on('request', (request) => {
      if (request.method() !== 'POST') return

      const { pathname } = new URL(request.url())
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

    // with no date the delivery day is the day the order was placed, which is
    // what the detail page falls back to
    const todayLabel = formatDate(new Date(), 'dateMedium', { locale: 'vi-VN' })

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

      await checkout.setNote(NOTE)
    })

    // Step 5 - leaving step 1 fires the Ahamove quote
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

      // the pair this case exists for: no timestamp, but a slot
      expect(estimatePayload.orderTime).toBe(0)
      expect(estimatePayload.tagIds).toEqual([deliverySlot.value])

      const { ahamoveResult } = (await estimateResponse.json()).value as { ahamoveResult: AhamoveResult[] }
      expect(ahamoveResult.length, 'Ahamove returned no services - the submit button never enables').toBeGreaterThan(0)

      // checkout-client.tsx preselects sortedAhamove[0], cheapest by total_fee
      cheapestService = [...ahamoveResult].sort((a, b) => (a.data?.total_fee ?? 0) - (b.data?.total_fee ?? 0))[0]

      const distanceKm = cheapestService.data.distance
      expect(
        distanceKm,
        `FREE_SHIP_ADDRESS "${FREE_SHIP_ADDRESS.addressQuery}" was quoted at ${distanceKm}km but ` +
          `ahamove.free_ship is ${freeShipKm}km - this address is no longer inside the radius`
      ).toBeLessThan(freeShipKm)
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

    // Step 7 - a slot must not change what is charged
    let productsSubtotal = 0

    await orderTest.step('check the free-ship discount in the sidebar', async () => {
      const rawShippingFee = cheapestService.data.total_fee

      productsSubtotal = await checkout.sidebarAmount('Tạm tính')

      expect(await checkout.sidebarAmount('Phí vận chuyển')).toBe(rawShippingFee)
      expect(await checkout.sidebarAmount('Giảm giá (bán kính miễn phí ship)')).toBe(-rawShippingFee)

      // no invoice means no VAT row, and the waiver means no shipping in the total
      await expect(checkout.sidebarRow('VAT 8%')).toHaveCount(0)
      expect(await checkout.sidebarTotalAmount()).toBe(productsSubtotal)
    })

    // Step 8 - submit. The request body has to be captured before the click.
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

    // Step 9 - the payload is the only place the address and the gateway exist
    await orderTest.step('check the create-order request body', async () => {
      expect(checkoutPayload).toMatchObject({
        gateway: 'BaoKim',
        // orderService.createOrder coerces the form's '1' to a number
        paymentMethod: 1,
        shippingFee: 0,
        // the slot travels alone - buildCheckoutPayload must not invent a date
        // for it, and must not drop it for the want of one
        orderTime: 0,
        tagIds: [deliverySlot.value],
        remarks: NOTE,
        phoneReceiver: savedAddress.phoneNumber,
        isExportInvoice: false,
        invoiceType: null,
        taxCode: null,
        identityNumber: null,
        receiptFullName: null,
        receiptPhoneNumber: null,
        receiptAddress: null,
        receiptEmail: null
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

    // Step 10 - what the customer sees on the order they just created
    await orderTest.step('check the created order in the UI', async () => {
      await expect(order.statusBadge).toHaveText('Chờ xác nhận')

      await expect(order.section('Sản phẩm')).toContainText(variantLabel)
      await expect(order.section('Ghi chú của khách')).toContainText(NOTE)

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
      // the pin dropped at checkout, not a text search - see buildMapHref
      await expect(order.mapLink).toHaveAttribute('href', /maps\/search\/\?api=1&query=-?\d/)

      await expect(order.section('Thông tin hoá đơn')).toContainText('Không xuất hoá đơn')

      // the assertion the whole case is built around: orderTime is 0, but the
      // customer picked a window, so the timeline must read as a scheduled
      // delivery on the day the order was placed - never as immediate
      const timeline = order.section('Nhật ký đơn hàng')
      await expect(order.field('Tạo đơn hàng')).not.toBeEmpty()
      await expect(timeline).not.toContainText('Xác nhận thanh toán')

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
        status: 'Pending',
        orderTime: 0,
        // the slot has to survive the round trip - an empty tagsId here is the
        // regression this case exists to catch
        tagsId: [deliverySlot.value],
        shippingFee: 0,
        vatFee: 0,
        isExportInvoice: false,
        invoiceType: null,
        taxCode: null,
        identityNumber: null,
        receiptFullName: null,
        receiptPhoneNumber: null,
        receiptAddress: null,
        receiptEmail: null,
        transaction: null,
        // the recipient card renders these straight from the detail response
        phoneReceiver: savedAddress.phoneNumber
      })

      expect(detail.address).toBe(checkoutPayload.address)

      // no shipping, no VAT
      expect(detail.totalFee).toBe(detail.productFee)
      // the backend prices the line itself, so this also checks the client preview
      expect(detail.productFee).toBe(productsSubtotal)

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

    // Step 12 - hold here, pay the order by hand, then check what the webhook
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

        // the same transaction unlocks the paid timeline entry, and the slot has
        // to survive the payment rather than collapsing to immediate
        const timeline = order.section('Nhật ký đơn hàng')
        await expect(timeline).toContainText('Xác nhận thanh toán')
        await expect(order.field('Ngày giao dự kiến')).toContainText(deliverySlot.label)
        await expect(order.field('Ngày giao dự kiến')).not.toContainText('Ngay sau khi thanh toán')

        // a paid order can no longer be paid or cancelled
        await expect(order.payNow).toBeHidden()
        await expect(order.cancelOrder).toBeHidden()
        await expect(order.section('Thanh toán đơn hàng')).toHaveCount(0)

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
