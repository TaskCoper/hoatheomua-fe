import { cancelOrderByMrcId } from '../api/orders.api'
import { addressTest } from './address'

// the same opt-in the checkout suite uses to hold for a hand-made payment
const WAIT_FOR_PAYMENT = process.env.E2E_WAIT_FOR_PAYMENT === '1'

interface OrderFixtures {
  createdOrders: string[]
}

export const orderTest = addressTest.extend<OrderFixtures>({
  createdOrders: async ({ authedPage }, run) => {
    const mrcOrderIds: string[] = []

    await run(mrcOrderIds)

    // when the test require real payment, dont cancel the order
    if (WAIT_FOR_PAYMENT) {
      for (const mrcOrderId of mrcOrderIds) {
        console.log(`Left ${mrcOrderId} open for payment (E2E_WAIT_FOR_PAYMENT=1)`)
      }
      return
    }

    await Promise.all(mrcOrderIds.map((mrcOrderId) => cancelOrderByMrcId(authedPage, mrcOrderId).catch(() => false)))
  }
})
