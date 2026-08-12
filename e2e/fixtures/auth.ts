import { test as base, expect, type Page } from '@playwright/test'
import path from 'node:path'

// Path to the saved authentication state.
// This file contains cookies/storage from a previously authenticated session.
export const STORAGE_STATE = path.join(__dirname, '../../playwright/.auth/user.json')

// Default test account used when we need to perform a real sign-in.
// Environment variables allow different credentials to be used in CI/local environments.
export const TEST_USER = {
  email: process.env.E2E_EMAIL ?? 'danhgn392k3@gmail.com',
  password: process.env.E2E_PASSWORD ?? 'testDemo@123'
}

interface SignInOptions {
  // Allow the caller to sign in with a different user.
  user?: typeof TEST_USER
  // Whether to navigate to the sign-in page before filling the form.
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

  // Verify that the user is successfully signed in - the navbar swaps the
  // sign-in/sign-up links for the account dropdown trigger.
  // `exact` matters: role names match by substring, and the sign-in page itself
  // has a "Chưa có tài khoản? Đăng ký" button that would resolve immediately,
  // letting us continue before the session cookies land.
  await expect(page.getByRole('button', { name: 'Tài khoản', exact: true })).toBeVisible()
}

interface AuthFixtures {
  // A page that starts with an already authenticated session.
  authedPage: Page
}

export const test = base.extend<AuthFixtures>({
  // Create an authenticated page by reusing the saved storage state.
  // This avoids repeating the UI login flow in every test.
  authedPage: async ({ browser }, run) => {
    // Create a new isolated browser context with the saved login session.
    const context = await browser.newContext({
      storageState: STORAGE_STATE
    })

    // Create a page inside the authenticated context.
    const page = await context.newPage()

    // Give the authenticated page to the test.
    await run(page)

    // Clean up the context after the test finishes.
    await context.close()
  }
})
