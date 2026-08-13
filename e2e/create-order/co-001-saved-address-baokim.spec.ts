import type { AhamoveResult } from '@/features/orders/ahamove.type'
import { expect } from '@playwright/test'
import { getAddressCount, getFreeShipKm, getOrder, waitForAhamoveDispatch } from '../api/orders.api'
import { FREE_SHIP_ADDRESS } from '../fixtures/address'
import { orderTest } from '../fixtures/order'
import { CartPage } from '../pages/cart.page'
import { CheckoutPage } from '../pages/checkout.page'
import { OrderPage } from '../pages/order.page'
import { ProductPage } from '../pages/product.page'
import {
  announcePaymentWait,
  DISPATCH_TIMEOUT_MS,
  PAID_ORDER_TEST_TIMEOUT_MS,
  PAYMENT_TIMEOUT_MS,
  WAIT_FOR_PAYMENT
} from '../utils/payment'
import { dismissPromoPopup } from '../utils/promo-popup'

/**
 * CO-001 - saved address, immediate delivery, no invoice, free shipping, BaoKim.
 *
 * The base purchase path every other create-order case is a variation of. It
 * guards two things nothing else does: the form -> wire mapping in
 * `buildCheckoutPayload`, and the free-ship waiver, which is the only place the
 * frontend unilaterally reduces what the customer is charged.
 *
 * Payment is not completed unless E2E_WAIT_FOR_PAYMENT=1 - that needs a human
 * or a gateway sandbox. With the flag on, the test parks on the order detail
 * page until the webhook lands and then checks the paid order, the Ahamove
 * booking included. See CO-008/CO-009.
 */

const SEARCH_TERM = 'Coral Pink'
const PRODUCT_NAME = 'Bó Coral Pink_2026'
const PRODUCT_ID = 'a10efc5a-ad03-4102-9e1e-5807e3f7a38c'
const NOTE = 'DEV TEST - Không xử lý đơn hàng này.'
const QUANTITY = 1

// the whole point of this case: the address has to sit inside the free-ship radius
orderTest.use({ addressSpec: FREE_SHIP_ADDRESS })

orderTest(
  'CO-001 saved address, immediate delivery, no invoice, free ship, BaoKim',
  async ({ authedPage: page, savedAddress, createdOrders }) => {
    orderTest.slow()

    // the manual payment window and the dispatch wait both have to fit inside
    // the test timeout
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

    // Step 4 - pick the fixture address, leave delivery immediate, write a note
    await orderTest.step('choose the saved address and write a note', async () => {
      await checkout.pickSavedAddress(savedAddress.receiverName)

      // the picker, the request body and the order detail's recipient card all
      // have to agree on this address - step 9 and step 10 check the other two
      await expect(checkout.addressPicker).toContainText(savedAddress.receiverName)
      await expect(checkout.addressPicker).toContainText(savedAddress.phoneNumber)
      await expect(checkout.addressPicker).toContainText(savedAddress.addressLineText)

      // no clear affordance means the date was never moved off today, i.e.
      // orderTime is still 0
      await expect(checkout.deliveryDateClear).toHaveCount(0)
      await expect(checkout.deliverySlot).toHaveText('Không chọn')

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

    // Step 7 - the sidebar shows the raw fee and cancels it out with a discount
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
        orderTime: 0,
        tagIds: [],
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

      // the summary card repeats the sidebar the order was placed from, waiver
      // included: no VAT row, and a total that is the products alone
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

      // nothing has been paid yet, so the timeline stops at "created" and the
      // delivery entry reads as immediate rather than a chosen date
      const timeline = order.section('Nhật ký đơn hàng')
      await expect(order.field('Tạo đơn hàng')).not.toBeEmpty()
      await expect(timeline).not.toContainText('Xác nhận thanh toán')
      await expect(order.field('Ngày giao dự kiến')).toHaveText('Ngay sau khi thanh toán')

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
        tagsId: [],
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

        // the same transaction unlocks the paid timeline entry, and immediate
        // delivery still reads as immediate once the order is paid
        const timeline = order.section('Nhật ký đơn hàng')
        await expect(timeline).toContainText('Xác nhận thanh toán')
        await expect(order.field('Ngày giao dự kiến')).toHaveText('Ngay sau khi thanh toán')

        // a paid order can no longer be paid or cancelled
        await expect(order.payNow).toBeHidden()
        await expect(order.cancelOrder).toBeHidden()
        await expect(order.section('Thanh toán đơn hàng')).toHaveCount(0)

        // the payment only counts once the backend says so, and the waiver has
        // to survive it: the customer pays for the products alone
        const paid = await waitForAhamoveDispatch(page, order.id, DISPATCH_TIMEOUT_MS)

        expect(paid.status).toBe('Paid')
        expect(paid.shippingFee).toBe(0)
        expect(paid.totalFee).toBe(productsSubtotal)
        expect(paid.transaction).not.toBeNull()
        expect(paid.transaction?.transferAmount).toBe(paid.totalFee)

        // an immediate-delivery order is dispatched on payment, so both tracking
        // fields have to be filled in - waitForAhamoveDispatch waited for them
        expect(paid.ahahaMoveOrderId).toBeTruthy()
        expect(paid.ahahaMoveTrackingUrl).toMatch(/^https?:\/\//)

        // the detail page stops polling the moment it turns paid, so a booking
        // that lands after that only reaches the UI on a reload
        await page.reload()

        const tracking = order.section('Theo dõi đơn hàng')
        await expect(tracking).toContainText('Mã đơn Ahamove')
        await expect(tracking).toContainText(paid.ahahaMoveOrderId as string)
        await expect(order.trackAhamove).toHaveAttribute('href', paid.ahahaMoveTrackingUrl as string)
      })
    }
  }
)
