import { expect } from '@playwright/test'
import { signIn, test } from '../fixtures/auth'

test('user can sign in from the navbar', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('link', { name: 'Đăng nhập' }).click()

  await expect(page).toHaveURL(/\/sign-in/)

  await signIn(page, { goto: false })

  await expect(page).toHaveURL('/')
})

test('signed-in user can visit a protected page', async ({ authedPage }) => {
  await authedPage.goto('/orders')

  await expect(authedPage).toHaveURL(/\/orders/)
})
