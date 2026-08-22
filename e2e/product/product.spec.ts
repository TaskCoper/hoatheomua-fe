import { expect } from '@playwright/test'
import { test } from '../fixtures/auth'
import { PRIMARY_PRODUCT } from '../fixtures/products'

test('user can visit products page, filter, view detail and then add to cart', async ({ authedPage: page }) => {
  await page.goto('/products')

  // take first search input in the page
  const searchInput = page.getByRole('searchbox').first()
  await searchInput.fill(PRIMARY_PRODUCT.searchTerm)

  // check the params to make sure it on the URL - nuqs mirrors the filter into the query
  // string with spaces as '+', the same encoding ProductPage.search asserts
  const encodedTerm = encodeURIComponent(PRIMARY_PRODUCT.searchTerm).replace(/%20/g, '\\+')
  await expect(page).toHaveURL(new RegExp(`_q=${encodedTerm}`))

  // go to product page
  const productLink = page.getByRole('link', { name: PRIMARY_PRODUCT.name })
  await expect(productLink).toBeVisible()

  await productLink.click()

  await expect(page).toHaveURL(`/products/${PRIMARY_PRODUCT.id}`)

  // select the first variant
  const variantBtn = page.getByTestId('purchase-box').locator('button[aria-pressed]').first()
  const variantLabel = await variantBtn.textContent()

  // choose the variant
  await variantBtn.click()
  await expect(variantBtn).toHaveAttribute('aria-pressed', 'true')

  // add variant to cart
  const addToCartBtn = page.getByRole('button', { name: 'Thêm vào giỏ' })
  await expect(addToCartBtn).toBeEnabled()

  await addToCartBtn.click()

  // go the cart page and check added variant
  await page.goto('/cart')

  const cartLine = page.getByTestId('cart-line').filter({ hasText: variantLabel ?? '' })
  await expect(cartLine).toBeVisible()
})
