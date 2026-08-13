import type { OrderPage } from '../pages/order.page'

export const WAIT_FOR_PAYMENT = process.env.E2E_WAIT_FOR_PAYMENT === '1'

/**
 * A NaN here is silent and catastrophic: `test.setTimeout(NaN)` reads as "no
 * timeout at all" and an `expect` given `{ timeout: NaN }` polls forever, so a
 * mistyped value turns a failing wait into a hung run. Underscores are accepted
 * because `300_000` reads naturally in an env file - `Number()` rejects it.
 */
const msFromEnv = (name: string, fallback: number) => {
  const raw = process.env[name]?.trim()
  if (!raw) return fallback

  const value = Number(raw.replaceAll('_', ''))
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} must be a positive number of milliseconds, got "${raw}"`)
  }

  return value
}

// how long a human gets to pay
export const PAYMENT_TIMEOUT_MS = msFromEnv('E2E_PAYMENT_TIMEOUT_MS', 300_000)

// how long the backend gets to book the Ahamove ride once the order is paid
export const DISPATCH_TIMEOUT_MS = msFromEnv('E2E_DISPATCH_TIMEOUT_MS', 120_000)

// both waits plus the ordinary purchase flow have to fit inside the test timeout
export const PAID_ORDER_TEST_TIMEOUT_MS = PAYMENT_TIMEOUT_MS + DISPATCH_TIMEOUT_MS + 120_000

export const announcePaymentWait = (order: OrderPage) => {
  console.log(`\n  Waiting up to ${PAYMENT_TIMEOUT_MS / 1000}s for a payment on order ${order.id}`)
  console.log(`  Pay the order now - the test resumes by itself.\n  ${order.url}\n`)
}
