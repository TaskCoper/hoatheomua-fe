import { test as base, expect, type Page } from '@playwright/test'
import path from 'node:path'
import { armPromoPopupHandler } from '../utils/promo-popup'

// where we save signed in user credentials
export const STORAGE_STATE = path.join(__dirname, '../../playwright/.auth/user.json')

export const TEST_USER = {
  email: process.env.E2E_USER_EMAIL ?? '',
  password: process.env.E2E_USER_PASSWORD ?? ''
}

interface SignInOptions {
  user?: typeof TEST_USER
  goto?: boolean
}

// Reusable helper for performing the sign-in flow through the UI.
export const signIn = async (page: Page, { user = TEST_USER, goto = true }: SignInOptions = {}) => {
  // Navigate to the sign-in page when requested.
  if (goto) {
    await page.goto('/sign-in')
  }

  // Make sure the sign-in page is ready before interacting with the form.
  await expect(page.getByRole('heading', { name: 'Đăng nhập' })).toBeVisible()

  // Fill in the credentials and submit the form.
  await page.getByRole('textbox', { name: 'Email' }).fill(user.email)
  await page.getByRole('textbox', { name: 'Mật khẩu' }).fill(user.password)
  await page.getByRole('button', { name: 'Đăng nhập' }).click()

  await expect(page.getByRole('button', { name: 'Tài khoản', exact: true })).toBeVisible()
}

interface AuthFixtures {
  authedPage: Page
}

export const test = base.extend<AuthFixtures>({
  authedPage: async ({ browser }, run) => {
    // create a new isolated browser context with the saved login session.
    const context = await browser.newContext({
      storageState: STORAGE_STATE
    })

    // create a page inside the authenticated context.
    const page = await context.newPage()

    // close the promotion popup
    await armPromoPopupHandler(page)

    // give the authenticated page to the test.
    await run(page)

    // clean up the context after the test finishes.
    await context.close()
  }
})
