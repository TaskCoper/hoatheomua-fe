import type { OrderItem } from '@/features/orders/types'
import { expect } from '@playwright/test'
import { expectServerTotalsMatchUi, getOrder, type UiTotals } from '../api/orders.api'
import { FREE_SHIP_ADDRESS } from '../fixtures/address'
import { orderTest } from '../fixtures/order'
import { ORDER_NOTE, PRIMARY_PRODUCT, SECONDARY_PRODUCT } from '../fixtures/products'
import { CartPage } from '../pages/cart.page'
import { CheckoutPage } from '../pages/checkout.page'
import { OrderPage } from '../pages/order.page'
import { ProductPage } from '../pages/product.page'
import { waitForCreateOrderRequest } from '../utils/requests'

/**
 * CO-006 - a multi-line order built from part of the cart, and what the cart looks like
 * afterwards.
 *
 * Every other create-order spec buys one line at quantity 1 with every cart line selected,
 * so three rules have never been exercised together:
 *
 * 1. **multi-line pricing** - two lines, different products, different quantities;
 * 2. **partial cart selection** - `selectedCartItems` must carry exactly what was ticked;
 * 3. **cart cleanup** - the ordered lines are removed and nothing else is.
 *
 * **The cart is deliberately loaded so that the unselected line is a sibling variant of a
 * purchased product.** That is what makes the cleanup assertion meaningful: an
 * implementation that removed "every line belonging to product X", or that simply cleared
 * the cart, would pass a naive "cart is empty" check and fail here.
 *
 *   selected   PRIMARY variant 0   x2   (Bó Coral Pink)
 *   UNSELECTED PRIMARY variant 1   x1   (the same parent product as the line above)
 *   selected   SECONDARY           x1   (TANA bó kiểu_2026, no variants)
 *
 * The id model, traced rather than assumed: a variant line stores the **child's** id
 * (`product-purchase-box.tsx` - `const productId = selected.id`), the payload sends the
 * child's `nhanhProductId` (`payloads.ts:32`), and the created order keeps both -
 * `details[].productId` is the local child UUID, `details[].itemId` is the Nhanh id.
 * A parent product with no variants stores its own ids in the same two places.
 *
 * UT-002 covers the `nhanhProductId ?? productId` fallback as a pure function. It cannot
 * prove the backend prices from that id, which is what step 6 below does.
 */

// selected, quantity raised in the cart
const SELECTED_VARIANT_INDEX = 0
// left in the cart on purpose - same parent product as the selected variant
const UNSELECTED_VARIANT_INDEX = 1

const SELECTED_VARIANT_QUANTITY = 2
const SECONDARY_QUANTITY = 1

orderTest.use({ addressSpec: FREE_SHIP_ADDRESS })

orderTest(
  'CO-006 - Đặt một phần giỏ hàng thành đơn nhiều sản phẩm',
  async ({ authedPage: page, savedAddress, createdOrders }) => {
    orderTest.slow()

    const products = new ProductPage(page)
    const cart = new CartPage(page)
    const checkout = new CheckoutPage(page)
    const order = new OrderPage(page)

    let selectedVariantLabel = ''
    let unselectedVariantLabel = ''

    await orderTest.step('put two variants of the same product in the cart', async () => {
      await products.search(PRIMARY_PRODUCT.searchTerm)
      await products.open(PRIMARY_PRODUCT.name, PRIMARY_PRODUCT.id)

      selectedVariantLabel = await products.selectVariantAt(SELECTED_VARIANT_INDEX)
      await products.addToCart()

      unselectedVariantLabel = await products.selectVariantAt(UNSELECTED_VARIANT_INDEX)
      await products.addToCart()

      // two variants of one product must be two cart lines, not one merged line
      expect(
        unselectedVariantLabel,
        'both variant buttons rendered the same label - the cart lines would be indistinguishable'
      ).not.toBe(selectedVariantLabel)
    })

    await orderTest.step('add a second, unrelated product', async () => {
      await products.search(SECONDARY_PRODUCT.searchTerm)
      await products.open(SECONDARY_PRODUCT.name, SECONDARY_PRODUCT.id)

      // no variants: the parent itself is the purchasable unit
      await products.addToCart()
    })

    await orderTest.step('tick two of the three lines', async () => {
      await cart.goto()

      // all three are distinct lines before anything is selected
      await expect(cart.line(selectedVariantLabel)).toBeVisible()
      await expect(cart.line(unselectedVariantLabel)).toBeVisible()
      await expect(cart.line(SECONDARY_PRODUCT.name)).toBeVisible()

      await cart.increase(selectedVariantLabel)
      await expect(cart.quantityOf(selectedVariantLabel)).toHaveText(String(SELECTED_VARIANT_QUANTITY))

      await cart.select(selectedVariantLabel)
      await cart.select(SECONDARY_PRODUCT.name)

      // the whole case turns on this line staying unticked
      await expect(
        cart.selectionOf(unselectedVariantLabel),
        'the sibling variant was selected - the partial-selection and cleanup assertions would both be vacuous'
      ).not.toBeChecked()

      await cart.submitCheckout()
    })

    let uiTotals: UiTotals

    await orderTest.step('the checkout summary carries only the ticked lines', async () => {
      await checkout.pickSavedAddress(savedAddress.receiverName)
      await checkout.setNote(ORDER_NOTE)

      await expect(checkout.sidebar).toContainText(selectedVariantLabel)
      await expect(checkout.sidebar).toContainText(SECONDARY_PRODUCT.name)

      // the sibling variant was never checked out, so it must appear nowhere
      await expect(checkout.sidebar, 'an unselected cart line reached the checkout summary').not.toContainText(
        unselectedVariantLabel
      )

      await checkout.goToPayment()

      const productsSubtotal = await checkout.sidebarAmount('Tạm tính')

      uiTotals = {
        productsSubtotal,
        shippingFee: 0,
        vatAmount: 0,
        grandTotal: await checkout.sidebarTotalAmount()
      }
    })

    let checkoutPayload: Record<string, unknown> = {}

    await orderTest.step('place the order', async () => {
      const createRequest = waitForCreateOrderRequest(page)

      await checkout.placeOrder()

      // register cleanup before any assertion can throw
      createdOrders.push(order.id)

      checkoutPayload = (await createRequest).postDataJSON()
    })

    await orderTest.step('the order detail lists both lines at their quantities', async () => {
      const items = order.section('Sản phẩm')

      await expect(items).toContainText(selectedVariantLabel)
      await expect(items).toContainText(SECONDARY_PRODUCT.name)

      // each line renders as 'x{qty} · {price}', so this is the only place the quantity the
      // customer chose is checked as *rendered* rather than as stored
      await expect(items).toContainText(`x${SELECTED_VARIANT_QUANTITY}`)
    })

    await orderTest.step('the payload carries two lines, priced by their Nhanh ids', async () => {
      const items = checkoutPayload.items as { itemId: string; number: number }[]

      expect(items, 'the payload must carry exactly the two ticked lines').toHaveLength(2)

      const byNumber = [...items].sort((a, b) => b.number - a.number)

      expect(byNumber[0].number).toBe(SELECTED_VARIANT_QUANTITY)
      expect(byNumber[1].number).toBe(SECONDARY_QUANTITY)

      // every itemId is a Nhanh catalogue id, never a local UUID - the backend prices from
      // this field and a UUID here would silently price nothing (UT-002 covers the fallback)
      for (const item of items) {
        expect(item.itemId, `itemId ${item.itemId} looks like a local UUID, not a Nhanh id`).toMatch(/^\d+$/)
      }
    })

    let detailLines: OrderItem[] = []

    await orderTest.step('the server persisted both lines with their own quantities', async () => {
      const detail = await getOrder(page, order.id)
      detailLines = detail.details

      expect(detailLines, 'the order must hold exactly the two ticked lines').toHaveLength(2)

      const sentIds = (checkoutPayload.items as { itemId: string }[]).map((item) => String(item.itemId)).sort()
      expect(detailLines.map((line) => String(line.itemId)).sort()).toEqual(sentIds)

      const bySize = [...detailLines].sort((a, b) => b.number - a.number)
      expect(bySize[0].number).toBe(SELECTED_VARIANT_QUANTITY)
      expect(bySize[1].number).toBe(SECONDARY_QUANTITY)

      // the variant line is stored against the child, not its parent
      expect(bySize[0].name).toBe(selectedVariantLabel)
      expect(bySize[0].productId).not.toBe(PRIMARY_PRODUCT.id)

      // the sibling variant is nowhere in the order
      expect(
        detailLines.map((line) => line.name),
        'an unselected cart line was persisted on the order'
      ).not.toContain(unselectedVariantLabel)

      // the subtotal is the sum of the server's own per-line prices, which is only equal to
      // the single-line case by accident - this is the multi-line arithmetic
      const summed = detailLines.reduce((total, line) => total + line.price * line.number, 0)
      expect(detail.productFee, 'productFee is not the sum of the persisted lines').toBe(summed)

      await expectServerTotalsMatchUi(page, order.id, uiTotals)
    })

    /*
     * The regression detector.
     *
     * `useCheckoutFlow` removes lines with `items.forEach(removeCartItem)` and only when
     * `source === 'cart'`. Two failure modes it has to be told apart from a correct run, and
     * a bare "the cart is empty" assertion would pass under the first one:
     *
     * - clearing the whole cart, which would also take the untouched sibling variant;
     * - removing by product rather than by line, which would take the sibling too because it
     *   shares a parent with a purchased line.
     *
     * Asserting the survivor by name, at its original quantity, is what separates them.
     */
    await orderTest.step('only the ordered lines left the cart', async () => {
      await cart.goto()

      await expect(cart.line(selectedVariantLabel), 'a purchased line stayed in the cart').toHaveCount(0)
      await expect(cart.line(SECONDARY_PRODUCT.name), 'a purchased line stayed in the cart').toHaveCount(0)

      await expect(
        cart.line(unselectedVariantLabel),
        'the unselected sibling variant was removed - checkout is clearing more than it bought'
      ).toBeVisible()

      await expect(cart.quantityOf(unselectedVariantLabel)).toHaveText('1')

      // and it is still an ordinary, selectable line rather than a leftover husk
      await expect(cart.selectionOf(unselectedVariantLabel)).toBeEnabled()
    })
  }
)
