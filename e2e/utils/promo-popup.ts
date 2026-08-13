import type { Page } from '@playwright/test'

// avoids re-waiting once we know the popup already fired for this page
const closedOnce = new WeakMap<Page, boolean>()

const dialogOf = (page: Page) => page.getByRole('dialog', { name: 'Chương trình khuyến mãi' })

const closeButtonOf = (page: Page) => dialogOf(page).getByRole('button', { name: 'Đóng thông báo khuyến mãi' })

export const dismissPromoPopup = async (page: Page, { timeout = 6000 } = {}): Promise<boolean> => {
  if (closedOnce.get(page)) return false

  try {
    await dialogOf(page).waitFor({ state: 'visible', timeout })
  } catch {
    return false
  }

  await closeButtonOf(page).click()
  await dialogOf(page).waitFor({ state: 'hidden' })
  closedOnce.set(page, true)

  return true
}

export const armPromoPopupHandler = async (page: Page) => {
  await page.addLocatorHandler(dialogOf(page), async () => {
    await closeButtonOf(page).click()
    closedOnce.set(page, true)
  })
}
