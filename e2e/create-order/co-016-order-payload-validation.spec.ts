import { expect } from '@playwright/test'
import { cancelOrderByMrcId, getOrder } from '../api/orders.api'
import { PAID_SHIP_ADDRESS } from '../fixtures/address'
import { orderTest } from '../fixtures/order'
import { ORDER_NOTE, PRIMARY_PRODUCT } from '../fixtures/products'
import { CartPage } from '../pages/cart.page'
import { CheckoutPage } from '../pages/checkout.page'
import { OrderPage } from '../pages/order.page'
import { ProductPage } from '../pages/product.page'
import { CREATE_ORDER_PATH, waitForCreateOrderRequest } from '../utils/requests'

/**
 * CO-016 - what the create-order endpoint accepts and rejects.
 *
 * Everything else in this folder drives the UI, which means it can only send
 * payloads the form is willing to produce. The rules below live on the server
 * and the form has its own, narrower opinion about them, so a UI-only suite
 * would never find out whether the backend actually enforces anything.
 *
 * Three rules are checked:
 *
 * - `orderTime` must be 0, or in the future and no more than 7 days out
 *   (EstimateShippingFeeRequestValidator). The date picker already limits the
 *   customer to today..+7, so this is the check that the limit is not merely
 *   cosmetic.
 * - `tagIds` is **not** validated at creation at all - the rule that a tag must
 *   exist only runs inside the payment webhook, long after the customer has
 *   paid. That is asserted as it currently behaves, deliberately, because it is
 *   the more dangerous of the two: a bad slot takes the money and then strands
 *   the order.
 * - **`shippingFee` is the client's opinion and nothing more.** The server
 *   quotes Ahamove itself and stores its own number, so a tampered fee cannot
 *   change what the customer is charged. This is the money assertion; see the
 *   steps at the bottom for why it takes two mutations rather than one.
 *
 * The fixture address is the **paid-ship** one. The free-ship address would
 * legitimately produce `shippingFee: 0` on both sides, which makes a tampered 0
 * indistinguishable from an honest one - the assertion would pass without
 * proving anything. Nothing else in this case depends on the address.
 *
 * A real payload is captured from one UI checkout rather than hand-built,
 * because the endpoint needs live coordinates and a Nhanh.vn item id that the
 * repository cannot supply on its own.
 */

const DAY_SECONDS = 24 * 60 * 60
const nowSeconds = () => Math.floor(Date.now() / 1000)

orderTest.use({ addressSpec: PAID_SHIP_ADDRESS })

orderTest(
  'CO-016 - Server tự quyết phí giao hàng và giới hạn ngày giao khi tạo đơn',
  async ({ authedPage: page, savedAddress, createdOrders }) => {
    orderTest.slow()

    const products = new ProductPage(page)
    const cart = new CartPage(page)
    const checkout = new CheckoutPage(page)
    const order = new OrderPage(page)

    // a payload the server has already accepted once, so every rejection below
    // is caused by the one field the case changes and nothing else
    let basePayload: Record<string, unknown> = {}
    // the order that payload produced, so the fee the server computed for it can
    // be read back and used as the control for the tampered submissions
    let baseOrderId = ''

    await orderTest.step('capture a known-good payload from the UI', async () => {
      const variantLabel = await products.addFixtureToCart(PRIMARY_PRODUCT)

      await cart.goto()
      await expect(cart.line(variantLabel)).toBeVisible()

      await cart.goToCheckout()

      await checkout.pickSavedAddress(savedAddress.receiverName)
      await checkout.setNote(ORDER_NOTE)

      await checkout.goToPaymentCapturingQuote()

      const createRequest = waitForCreateOrderRequest(page)

      await checkout.placeOrder()

      // register cleanup before any assertion can throw
      createdOrders.push(order.id)
      baseOrderId = order.id

      basePayload = (await createRequest).postDataJSON()

      // the captured payload is immediate delivery with no slot, which is the
      // baseline every mutation below starts from
      expect(basePayload.orderTime).toBe(0)
      expect(basePayload.tagIds).toEqual([])
    })

    const post = (payload: Record<string, unknown>) => page.request.post(CREATE_ORDER_PATH, { data: payload })

    /**
     * Only the status and the messageCode are asserted, never the field-level
     * message. The server fills `errors` in from the exception only when it is
     * running in Development, so against any deployed environment the body is
     * `{"detail":""}` - the rule name `ORDER_TIME_INVALID` exists in the
     * validator but never reaches a client. Asserting it would pass locally and
     * fail everywhere else.
     */
    const expectRejected = async (response: Awaited<ReturnType<typeof post>>, because: string) => {
      expect(response.status(), because).toBe(422)
      expect((await response.json()).messageCode).toBe('VALIDATION_ERROR')
    }

    await orderTest.step('an orderTime in the past is rejected', async () => {
      await expectRejected(
        await post({ ...basePayload, orderTime: nowSeconds() - DAY_SECONDS }),
        'a delivery date in the past was accepted'
      )
    })

    await orderTest.step('an orderTime beyond the 7 day window is rejected', async () => {
      await expectRejected(
        await post({ ...basePayload, orderTime: nowSeconds() + 8 * DAY_SECONDS }),
        'a delivery date more than 7 days out was accepted'
      )
    })

    await orderTest.step('an orderTime inside the window is accepted', async () => {
      // +6 days rather than +7: the server compares against UtcNow at the moment
      // it handles the request, so the boundary itself is a race
      const orderTime = nowSeconds() + 6 * DAY_SECONDS
      const response = await post({ ...basePayload, orderTime })

      expect(response.status(), 'a delivery date inside the allowed window was rejected').toBe(200)

      const mrcOrderId = (await response.json()).value.mrc_order_id as string
      createdOrders.push(mrcOrderId)

      // and it is stored as the seconds it was sent as - a milliseconds
      // regression would land the delivery ~55000 years out and still pass a
      // status check
      expect((await getOrder(page, mrcOrderId)).orderTime).toBe(orderTime)
    })

    /**
     * Documented gap, not a wish.
     *
     * `CreateOrderRequestValidator` has its tagIds rule commented out, so any
     * number is stored as-is. The only place a tag is checked against the
     * configured delivery slots is `ConvertTimeDelivery`, inside the payment
     * webhook - which means a bad slot is accepted here, the customer pays, and
     * *then* the webhook throws. The order stays Pending with the money gone.
     *
     * This asserts the current behaviour so the gap is visible in the suite. If
     * validation is ever added at creation, this step fails and should become an
     * assertion that the bad tag is rejected with 422.
     */
    await orderTest.step('KNOWN GAP: an unknown tagId is accepted at creation', async () => {
      const response = await post({ ...basePayload, tagIds: [999_999_999] })

      expect(
        response.status(),
        'tagIds are now validated at creation - swap this step for a 422 assertion and delete the webhook caveat'
      ).toBe(200)

      const mrcOrderId = (await response.json()).value.mrc_order_id as string
      createdOrders.push(mrcOrderId)

      // stored verbatim, so nothing downstream can tell it apart from a real slot
      expect((await getOrder(page, mrcOrderId)).tagsId).toEqual([999_999_999])

      // cancel it here rather than leaving it for teardown: an order carrying a
      // slot that does not exist must never be left payable
      expect(await cancelOrderByMrcId(page, mrcOrderId)).toBeTruthy()
    })

    /**
     * The money assertion.
     *
     * `CreateOrderRequest` (and the `EstimateShippingFeeRequest` it extends)
     * declares no `ShippingFee` property at all, so the field the client sends is
     * not bindable. The server quotes Ahamove itself
     * (`Order/Service.cs` - `EstimateShippingFeeAsync`) and stores that number
     * (`ShippingFee = totalShippingFee`). The only write path that honours a
     * caller-supplied fee is `PATCH /api/v1/orders/update-ahamove`, which is
     * behind the admin policy.
     *
     * This is a contract guard rather than a validation check: nothing is
     * rejected, and nothing here can fail while the DTO stays as it is. It goes
     * red the day someone adds a `ShippingFee` property "for convenience", which
     * is the only way a customer could ever pay their own number.
     *
     * Two mutations, because one does not prove independence:
     *
     * - sending 0 rules out the server trusting the client, and also rules out
     *   `min(client, computed)` - either would store 0;
     * - sending an absurdly large value rules out `max(client, computed)`, which
     *   the first mutation would pass.
     *
     * Both are checked against the fee the server computed for the *untampered*
     * payload, so the control and the mutations differ in exactly one field.
     */
    let serverShippingFee = 0

    await orderTest.step('the server computes its own shipping fee', async () => {
      serverShippingFee = (await getOrder(page, baseOrderId)).shippingFee

      expect(
        serverShippingFee,
        'PAID_SHIP_ADDRESS was quoted inside the free-ship radius, so the server charged 0 - a tampered 0 ' +
          'would be indistinguishable from an honest one and the two steps below would prove nothing. ' +
          'Move the fixture address further out.'
      ).toBeGreaterThan(0)

      // the honest path: what the customer was shown is what the order was
      // created for. CO-001/CO-003 assert this through the UI; here it is the
      // control the mutations are measured against
      expect(basePayload.shippingFee, 'the UI sent a different fee than the server computed').toBe(serverShippingFee)
    })

    await orderTest.step('a tampered shippingFee of 0 does not discount the order', async () => {
      const response = await post({ ...basePayload, shippingFee: 0 })

      expect(response.status(), 'a payload claiming free shipping was rejected outright').toBe(200)

      const mrcOrderId = (await response.json()).value.mrc_order_id as string
      createdOrders.push(mrcOrderId)

      expect(
        (await getOrder(page, mrcOrderId)).shippingFee,
        'the server accepted the client shipping fee - a customer can now choose what they pay to ship'
      ).toBe(serverShippingFee)
    })

    await orderTest.step('an inflated shippingFee does not overcharge the order', async () => {
      const response = await post({ ...basePayload, shippingFee: 999_999_999 })

      expect(response.status(), 'a payload claiming an absurd fee was rejected outright').toBe(200)

      const mrcOrderId = (await response.json()).value.mrc_order_id as string
      createdOrders.push(mrcOrderId)

      const detail = await getOrder(page, mrcOrderId)

      expect(
        detail.shippingFee,
        'the server took the larger of the client and computed fees - a tampered payload can overcharge'
      ).toBe(serverShippingFee)

      // and the stored total is built from the server's own parts, so an ignored
      // fee cannot leak into the amount the customer is asked to transfer
      expect(detail.totalFee).toBe(detail.productFee + detail.shippingFee + detail.vatFee)
    })
  }
)
