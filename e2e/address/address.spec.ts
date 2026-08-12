import { expect } from '@playwright/test'
import { test } from '../fixtures/auth'

const ADDRESS_QUERY = '72 Lê Thánh Tôn'

test('user can visit their profile and add new address', async ({ authedPage: page }, testInfo) => {
  // add unique name
  const receiverName = `E2E ${testInfo.project.name} ${testInfo.testId} ${Date.now()}`
  const phoneNumber = '0909111111'

  await page.goto('/')

  // click on avatar
  const accountBtn = page.getByRole('button', { name: 'Tài khoản', exact: true })
  await expect(accountBtn).toBeVisible()

  await accountBtn.click()

  // choose 'Tài khoản'
  await page.getByRole('menuitem', { name: 'Tài khoản' }).click()
  await expect(page).toHaveURL(/\/users\//)

  const profile = page.getByRole('dialog', { name: 'Hồ sơ cá nhân' })
  await expect(profile).toBeVisible()

  // choose 'Địa chỉ' section
  await profile.getByRole('button', { name: 'Địa chỉ', exact: true }).click()
  await expect(profile.getByRole('heading', { name: 'Địa chỉ của bạn' })).toBeVisible()

  // add new address
  await profile.getByRole('button', { name: 'Thêm địa chỉ' }).first().click()

  const form = page.getByRole('dialog', { name: 'Thêm địa chỉ' })
  await expect(form).toBeVisible()

  await form.getByLabel('Tên người nhận').fill(receiverName)
  await form.getByLabel('Số điện thoại').fill(phoneNumber)

  const cityField = form.getByRole('combobox', { name: 'Thành phố', exact: true })
  const wardField = form.getByRole('combobox', { name: 'Phường/Xã', exact: true })

  // wait for city api call
  await expect(cityField).toBeEnabled()

  // picking the first autocomplete option
  await form.getByLabel('Địa chỉ', { exact: true }).fill(ADDRESS_QUERY)
  await page.getByRole('option').first().click()

  // make sure the input have selected values
  await expect(cityField).toHaveText('Hồ Chí Minh')
  await expect(wardField).toHaveText('Phường Sài Gòn')

  // uncheck default address checkbox
  const isDefaultCheckbox = form.getByRole('checkbox', { name: 'Đặt làm mặc định' })
  await isDefaultCheckbox.uncheck()

  // create the address
  await form.getByRole('button', { name: 'Tạo địa chỉ' }).click()

  await expect(page.getByText('Đã tạo địa chỉ')).toBeVisible()
  await expect(form).toBeHidden()

  // check to see whether new added address is visible
  const card = page.getByTestId('address-card').filter({ hasText: receiverName })
  await expect(card).toBeVisible()
  await expect(card).toContainText(phoneNumber)

  // delete address to prevent creating too much
  await card.getByRole('button', { name: 'Thêm', exact: true }).click()
  await page.getByRole('menuitem', { name: 'Xóa địa chỉ' }).click()

  const deleteDialog = page.getByRole('dialog', { name: 'Xóa địa chỉ' })
  await deleteDialog.getByRole('button', { name: 'Xóa địa chỉ' }).click()

  // check for deletion success
  await expect(page.getByText('Đã xóa địa chỉ')).toBeVisible()
  await expect(card).toBeHidden()
})
