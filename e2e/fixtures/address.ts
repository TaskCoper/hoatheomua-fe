import { ProfilePage, type NewAddress } from '../pages/profile.page'
import { test as authTest } from './auth'

export interface AddressSpec {
  // typed into the address autocomplete
  addressQuery: string
  // the city/ward the first suggestion is expected to resolve to
  city: string
  ward: string
  // a substring of the resolved address line, for containment assertions
  addressLineText: string
}

export const FREE_SHIP_ADDRESS: AddressSpec = {
  addressQuery: '166/41/4 Thích Quảng Đức',
  city: 'Hồ Chí Minh',
  ward: 'Phường Đức Nhuận',
  addressLineText: 'Thích Quảng Đức'
}

export const PAID_SHIP_ADDRESS: AddressSpec = {
  addressQuery: '84 D5, KDC An Thiên Lý',
  city: 'Hồ Chí Minh',
  ward: 'Phường Phước Long',
  addressLineText: 'An Thiên Lý'
}

interface CheckoutFixtures {
  // address that for manual
  addressSpec: AddressSpec
  // saved address for selection
  savedAddress: NewAddress
}

export const addressTest = authTest.extend<CheckoutFixtures>({
  addressSpec: [FREE_SHIP_ADDRESS, { option: true }],
  savedAddress: async ({ authedPage, addressSpec }, run, testInfo) => {
    const profile = new ProfilePage(authedPage)

    const address: NewAddress = {
      receiverName: `E2E ${testInfo.project.name} ${testInfo.testId} ${Date.now()}`,
      phoneNumber: '0909111111',
      ...addressSpec,
      isDefault: false
    }

    await profile.createAddress(address)

    await run(address)

    await profile.deleteAddress(address.receiverName)
  }
})
