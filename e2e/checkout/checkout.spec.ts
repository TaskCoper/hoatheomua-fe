import { addressTest, expect } from '../fixtures/address'
import { CartPage } from '../pages/cart.page'
import { CheckoutPage } from '../pages/checkout.page'
import { OrderPage } from '../pages/order.page'
import { ProductPage } from '../pages/product.page'

const SEARCH_TERM = 'Coral Pink'
const PRODUCT_NAME = 'Bó Coral Pink_2026'
const PRODUCT_ID = 'a10efc5a-ad03-4102-9e1e-5807e3f7a38c'
const NOTE = 'DEV TEST - Không xử lý đơn hàng này.'

const WAIT_FOR_PAYMENT = process.env.E2E_WAIT_FOR_PAYMENT === '1'
const PAYMENT_TIMEOUT_MS = Number(process.env.E2E_PAYMENT_TIMEOUT_MS ?? 300_000)

addressTest('user can add an address, add to cart and place an order', async ({ authedPage: page, savedAddress }) => {
  // long test, increase the timeout
  addressTest.slow()

  // the manual webhook window has to fit inside the test timeout
  if (WAIT_FOR_PAYMENT) addressTest.setTimeout(PAYMENT_TIMEOUT_MS + 120_000)

  const products = new ProductPage(page)
  const cart = new CartPage(page)
  const checkout = new CheckoutPage(page)
  const order = new OrderPage(page)

  // Step 1 - see addressTest at e2e/fixtures/address.ts

  // Step 2 - go to products page, filter, click to view detail and add to cart
  let variantLabel = ''

  await addressTest.step('filter products and add to cart', async () => {
    await products.search(SEARCH_TERM)
    await products.open(PRODUCT_NAME, PRODUCT_ID)

    // save the variant label for checking in the cart
    variantLabel = await products.selectFirstVariant()

    await products.addToCart()
  })

  // Step 3 - go to the cart, bump the quantity and start the checkout.
  await addressTest.step('increase quantity and go to checkout', async () => {
    await cart.goto()
    await expect(cart.line(variantLabel)).toBeVisible()

    await cart.increase(variantLabel)
    await expect(cart.quantityOf(variantLabel)).toHaveText('2')

    await cart.goToCheckout()
  })

  // Step 4 - pick the address created by the fixture and leave a note.
  await addressTest.step('choose the saved address and write a note', async () => {
    await checkout.pickSavedAddress(savedAddress.receiverName)

    // the order detail page never renders the shipping address, so this is where
    // the chosen address gets verified
    await expect(checkout.addressPicker).toContainText(savedAddress.receiverName)
    await expect(checkout.addressPicker).toContainText(savedAddress.phoneNumber)
    await expect(checkout.addressPicker).toContainText(savedAddress.addressLineText)

    await checkout.setNote(NOTE)
  })

  // Step 5 - move to the payment step and create the order.
  await addressTest.step('create the order', async () => {
    await checkout.goToPayment()
    await checkout.placeOrder()
  })

  // Step 6 - check the order status and the rest of the info.
  await addressTest.step('check the created order', async () => {
    await expect(order.statusBadge).toHaveText('Chờ xác nhận')

    await expect(order.section('Ghi chú của khách')).toContainText(NOTE)

    // the order lists the variant that was added, not its parent product
    const itemsSection = order.section('Sản phẩm')
    await expect(itemsSection).toContainText(variantLabel)

    // quantity renders as 'x{qty} · {price}'
    await expect(itemsSection).toContainText('x2')

    await expect(order.total).toContainText('₫')
  })

  // Step 7 - hold here, fake the payment webhook by hand, then check what the
  // order detail page turns into. Opt-in, because it blocks on a human.
  if (WAIT_FOR_PAYMENT) {
    await addressTest.step('wait for the payment, then check the paid order', async () => {
      console.log(`\n  Waiting up to ${PAYMENT_TIMEOUT_MS / 1000}s for a payment on order ${order.id}`)
      console.log(`  Fake the gateway webhook now - the test resumes by itself.\n  ${order.url}\n`)

      await order.waitForPaid(PAYMENT_TIMEOUT_MS)

      // the transfer card only exists once the webhook has written a transaction
      const transferSection = order.section('Thông tin chuyển khoản')
      await expect(transferSection).toBeVisible()
      await expect(transferSection).toContainText('Ngân hàng')
      await expect(transferSection).toContainText('Nội dung')
      await expect(transferSection).toContainText('Thanh toán lúc')
      await expect(transferSection).toContainText('₫')

      // the same transaction unlocks two more timeline entries
      const timeline = order.section('Nhật ký đơn hàng')
      await expect(timeline).toContainText('Xác nhận thanh toán')
      await expect(timeline).toContainText('Ngày giao dự kiến')

      // a paid order can no longer be paid or cancelled
      await expect(page.getByRole('button', { name: 'Hủy đơn hàng' })).toBeHidden()
      await expect(page.getByRole('link', { name: 'Thanh toán ngay' })).toBeHidden()

      // the QR panel is pending-only
      await expect(page.getByRole('heading', { name: 'Thanh toán đơn hàng' })).toBeHidden()
    })
  }
})
