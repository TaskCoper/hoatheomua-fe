import { expect } from '@playwright/test'
import { test } from '../fixtures/auth'

test('user can visit products page, filter, view detail and then add to cart', async ({ authedPage: page }) => {
  await page.goto('/products')

  // take first search input in the page
  const searchInput = page.getByRole('searchbox').first()
  await searchInput.fill('Coral Pink')

  // check the params to make sure it on the URL
  await expect(page).toHaveURL(/_q=Coral\+Pink/)

  // go to product page
  const productLink = page.getByRole('link', { name: 'Bó Coral Pink_2026' })
  await expect(productLink).toBeVisible()

  await productLink.click()

  await expect(page).toHaveURL('/products/a10efc5a-ad03-4102-9e1e-5807e3f7a38c')

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
