import { test as setup } from '@playwright/test'
import { signIn, STORAGE_STATE } from '../fixtures/auth'

// runs once before the browser projects (see `dependencies` in playwright.config.ts)
// and persists the session cookies for every test that takes `authedPage`
setup('authenticate', async ({ page }) => {
  await signIn(page)

  await page.context().storageState({ path: STORAGE_STATE })
})
