import { ProfilePage, type NewAddress } from '../pages/profile.page'
import { test as authTest } from './auth'

// This resolves to Hồ Chí Minh / Phường Sài Gòn in the address autocomplete.
const ADDRESS_QUERY = '72 Lê Thánh Tôn'

interface CheckoutFixtures {
  // An address created before the test and removed after it, pass or fail.
  savedAddress: NewAddress
}

export const addressTest = authTest.extend<CheckoutFixtures>({
  /**
   * Creating the address here rather than in the test body means the teardown
   * runs even when the test fails half way, which is what stops abandoned E2E
   * addresses from piling up on the account.
   */
  savedAddress: async ({ authedPage }, run, testInfo) => {
    const profile = new ProfilePage(authedPage)

    const address: NewAddress = {
      // unique per run, so parallel projects never collide on the same address
      receiverName: `E2E ${testInfo.project.name} ${testInfo.testId} ${Date.now()}`,
      phoneNumber: '0909111111',
      addressQuery: ADDRESS_QUERY,
      city: 'Hồ Chí Minh',
      ward: 'Phường Sài Gòn',
      // left non-default on purpose: the checkout auto-selects the default one,
      // so a non-default address forces the picker to actually be used
      isDefault: false
    }

    await profile.createAddress(address)

    await run(address)

    await profile.deleteAddress(address.receiverName)
  }
})

export { expect } from '@playwright/test'
