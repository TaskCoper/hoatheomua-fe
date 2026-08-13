import { expect, type Locator, type Page } from '@playwright/test'
import { dismissPromoPopup } from '../utils/promo-popup'

export interface NewAddress {
  receiverName: string
  phoneNumber: string
  // autocomplete input value
  addressQuery: string
  // the city/ward the suggestion is expected to resolve to
  city: string
  ward: string
  // a substring of the resolved address line - the suggestion that gets saved is
  // rarely character-for-character what was typed, so assert on this instead
  addressLineText: string
  // should this address be default
  isDefault?: boolean
}

export class ProfilePage {
  readonly dialog: Locator

  constructor(private readonly page: Page) {
    this.dialog = page.getByRole('dialog', { name: 'Hồ sơ cá nhân' })
  }

  // open nav-user
  async open() {
    await this.page.goto('/')

    await dismissPromoPopup(this.page)

    const accountBtn = this.page.getByRole('button', { name: 'Tài khoản', exact: true })
    await expect(accountBtn).toBeVisible()

    await accountBtn.click()
    await this.page.getByRole('menuitem', { name: 'Tài khoản' }).click()

    await expect(this.page).toHaveURL(/\/users\//)
    await expect(this.dialog).toBeVisible()
  }

  // open address tab in user profile
  async openAddresses() {
    await this.dialog.getByRole('button', { name: 'Địa chỉ', exact: true }).click()
    await expect(this.dialog.getByRole('heading', { name: 'Địa chỉ của bạn' })).toBeVisible()
  }

  // find the address card by text
  addressCard(receiverName: string) {
    return this.page.getByTestId('address-card').filter({ hasText: receiverName })
  }

  // add new address with isDefault = false to DB
  async createAddress({ receiverName, phoneNumber, addressQuery, city, ward, isDefault = false }: NewAddress) {
    await this.open()
    await this.openAddresses()

    await this.dialog.getByRole('button', { name: 'Thêm địa chỉ' }).first().click()

    const form = this.page.getByRole('dialog', { name: 'Thêm địa chỉ' })
    await expect(form).toBeVisible()

    await form.getByLabel('Tên người nhận').fill(receiverName)
    await form.getByLabel('Số điện thoại').fill(phoneNumber)

    const cityField = form.getByRole('combobox', { name: 'Thành phố', exact: true })
    const wardField = form.getByRole('combobox', { name: 'Phường/Xã', exact: true })

    // wait for the city api call
    await expect(cityField).toBeEnabled()

    // picking the first autocomplete option will fill city and ward for us
    await form.getByLabel('Địa chỉ', { exact: true }).fill(addressQuery)
    await this.page.getByRole('option').first().click()

    await expect(cityField).toHaveText(city)
    await expect(wardField).toHaveText(ward)

    const isDefaultCheckbox = form.getByRole('checkbox', { name: 'Đặt làm mặc định' })
    if (isDefault) {
      await isDefaultCheckbox.check()
    } else {
      await isDefaultCheckbox.uncheck()
    }

    await form.getByRole('button', { name: 'Tạo địa chỉ' }).click()

    await expect(this.page.getByText('Đã tạo địa chỉ')).toBeVisible()
    await expect(form).toBeHidden()

    const card = this.addressCard(receiverName)
    await expect(card).toBeVisible()
    await expect(card).toContainText(phoneNumber)
  }

  async deleteAddress(receiverName: string) {
    await this.open()
    await this.openAddresses()

    const card = this.addressCard(receiverName)
    await expect(card).toBeVisible()

    await card.getByRole('button', { name: 'Thêm', exact: true }).click()
    await this.page.getByRole('menuitem', { name: 'Xóa địa chỉ' }).click()

    const deleteDialog = this.page.getByRole('dialog', { name: 'Xóa địa chỉ' })
    await deleteDialog.getByRole('button', { name: 'Xóa địa chỉ' }).click()

    await expect(this.page.getByText('Đã xóa địa chỉ')).toBeVisible()
    await expect(card).toBeHidden()
  }
}
