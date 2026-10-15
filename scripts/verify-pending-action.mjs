import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const nativeRequire = createRequire(resolve(root, 'package.json'))
const ts = nativeRequire('typescript')

// `pending-action.ts` reads `window.sessionStorage`; give it one that can be emptied and broken on demand.
const entries = new Map()
let storageBroken = false
globalThis.window = {
  sessionStorage: {
    getItem: (key) => (entries.has(key) ? entries.get(key) : null),
    setItem: (key, value) => {
      if (storageBroken) throw new Error('QuotaExceededError')
      entries.set(key, String(value))
    },
    removeItem: (key) => {
      entries.delete(key)
    }
  }
}

// The cart store probes `localStorage` up front and copes with it being blocked; Node would only warn about it.
Object.defineProperty(globalThis, 'localStorage', {
  get() {
    throw new Error('blocked')
  },
  configurable: true
})

const cache = new Map()
function load(file) {
  const path = resolve(root, file)
  if (cache.has(path)) return cache.get(path).exports
  const loadedModule = { exports: {} }
  cache.set(path, loadedModule)
  const source = ts.transpileModule(readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true }
  }).outputText
  const require = (name) => {
    // The cart store only needs this to drop cached stock after a cart edit.
    if (name === '@/features/products/invalidate-stock') return { invalidateSellableQuantity: () => {} }
    if (name.startsWith('@/')) return load(name.slice(2) + '.ts')
    if (name.startsWith('.')) return load(resolve(dirname(path), name) + '.ts')
    return nativeRequire(name)
  }
  vm.runInThisContext(`(function(require,module,exports){${source}\n})`, { filename: path })(
    require,
    loadedModule,
    loadedModule.exports
  )
  return loadedModule.exports
}

const {
  PENDING_ACTION_KEY,
  PENDING_ACTION_TTL_MS,
  clearPendingAction,
  getReplayGate,
  savePendingAction,
  takePendingAction
} = load('features/users/pending-action.ts')
const { replayPendingAction } = load('features/users/pending-action-handlers.ts')

const PATH = '/products/abc'
const NOW = 1_700_000_000_000
const request = { productId: 'prod-1', quantity: 2 }

const save = (type, payload = request, path = PATH) => savePendingAction({ type, payload, path }, NOW)
const store = (raw) => entries.set(PENDING_ACTION_KEY, typeof raw === 'string' ? raw : JSON.stringify(raw))

/** A replay context that records everything it is asked to do instead of doing it. */
function makeContext(overrides = {}) {
  const calls = { verified: [], added: [], intents: [], navigated: [], toasts: [], fetched: [], unavailable: 0 }
  const context = {
    t: (key) => key,
    toast: {
      success: (message, options) => calls.toasts.push({ kind: 'success', message, options }),
      error: (message) => calls.toasts.push({ kind: 'error', message })
    },
    verifySellableQuantity: async (requests) => {
      calls.verified.push(requests)
      return { ok: true }
    },
    getInCartQuantity: () => 0,
    addItem: (input) => calls.added.push(input),
    setCheckoutIntent: (items, source) => calls.intents.push({ items, source }),
    navigate: (href) => calls.navigated.push(href),
    canUseStorefront: true,
    canBuyNow: true,
    hasPhoneNumber: true,
    notifyUnavailable: () => {
      calls.unavailable++
    },
    // What the API says about the product; the stored payload is never the source of its name.
    getProduct: async (productId) => {
      calls.fetched.push(productId)
      return { productName: 'Rose bouquet', hasVariants: false }
    },
    ...overrides
  }
  return { context, calls }
}

const replay = (context, path = PATH) => replayPendingAction(context, path, NOW)

const nothingHappened = (calls) => {
  assert.deepEqual(calls.added, [])
  assert.deepEqual(calls.intents, [])
  assert.deepEqual(calls.navigated, [])
}

let count = 0
async function check(name, run) {
  entries.clear()
  storageBroken = false
  await run()
  count++
  console.log(`PASS ${name}`)
}

// --- storage ---------------------------------------------------------------------------------

await check('a saved intent is handed out once and then gone', async () => {
  assert.equal(save('cart.add'), true)
  const first = takePendingAction(NOW)
  assert.equal(first.status, 'ok')
  assert.deepEqual(first.action.payload, request)
  assert.equal(first.action.path, PATH)
  assert.equal(takePendingAction(NOW).status, 'none')
  assert.equal(entries.has(PENDING_ACTION_KEY), false)
})

await check('only one intent is kept - a newer one replaces the older', async () => {
  save('cart.add', { ...request, productId: 'old' })
  save('cart.buyNow', { ...request, productId: 'new' })
  const taken = takePendingAction(NOW)
  assert.equal(taken.action.type, 'cart.buyNow')
  assert.equal(taken.action.payload.productId, 'new')
})

await check('an intent past its TTL is expired, and removed', async () => {
  save('cart.add')
  assert.equal(takePendingAction(NOW + PENDING_ACTION_TTL_MS).status, 'expired')
  assert.equal(entries.has(PENDING_ACTION_KEY), false)
})

await check('an intent just inside its TTL is still good', async () => {
  save('cart.add')
  assert.equal(takePendingAction(NOW + PENDING_ACTION_TTL_MS - 1).status, 'ok')
})

await check('malformed storage is invalid, not a crash, and is removed', async () => {
  for (const raw of ['{not json', 'null', '[]', '"cart.add"', '42']) {
    store(raw)
    assert.equal(takePendingAction(NOW).status, 'invalid', raw)
    assert.equal(entries.has(PENDING_ACTION_KEY), false, raw)
  }
})

await check('a type outside the allowlist is invalid whatever its payload', async () => {
  for (const type of ['order.place', 'payment.start', 'job.apply', '', null, 7, undefined]) {
    store({ type, payload: request, path: PATH, expiresAt: NOW + 1000 })
    assert.equal(takePendingAction(NOW).status, 'invalid', String(type))
  }
})

await check('a missing or non-internal path, or a bad expiry, is invalid', async () => {
  for (const patch of [
    { path: undefined },
    { path: 'products/abc' },
    { path: 'https://evil.example/' },
    { path: 7 },
    { expiresAt: undefined },
    { expiresAt: '9999999999999' },
    { expiresAt: Number.NaN }
  ]) {
    store({ type: 'cart.add', payload: request, path: PATH, expiresAt: NOW + 1000, ...patch })
    assert.equal(takePendingAction(NOW).status, 'invalid', JSON.stringify(patch))
  }
})

await check('a blocked storage means nothing saved, and nothing thrown', async () => {
  storageBroken = true
  assert.equal(save('cart.add'), false)
  assert.equal(takePendingAction(NOW).status, 'none')
})

// --- replay: success -------------------------------------------------------------------------

await check('cart.add: verifies stock, adds the line, tells the buyer, and goes nowhere', async () => {
  save('cart.add')
  const { context, calls } = makeContext()
  assert.equal(await replay(context), 'ran')
  assert.deepEqual(calls.verified, [[{ productId: 'prod-1', productName: 'Rose bouquet', quantity: 2 }]])
  assert.deepEqual(calls.added, [{ productId: 'prod-1', variantId: null, quantity: 2, selectedOptions: {} }])
  assert.equal(calls.toasts.length, 1)
  assert.equal(calls.toasts[0].kind, 'success')
  assert.equal(calls.toasts[0].message, 'products.detail.purchase.addedToCart')
  assert.equal(calls.toasts[0].options.description, 'Rose bouquet')
  assert.deepEqual(calls.intents, [])
  assert.deepEqual(calls.navigated, [])
})

await check('cart.add: what is already in the cart counts against stock', async () => {
  save('cart.add')
  const { context, calls } = makeContext({ getInCartQuantity: () => 3 })
  assert.equal(await replay(context), 'ran')
  assert.equal(calls.verified[0][0].quantity, 5)
  assert.equal(calls.added.length, 1)
})

await check('cart.buyNow: sets a buy-now intent for exactly that line and opens /checkout - nothing else', async () => {
  save('cart.buyNow')
  const { context, calls } = makeContext()
  assert.equal(await replay(context), 'ran')
  assert.deepEqual(calls.navigated, ['/checkout'])
  assert.equal(calls.intents.length, 1)
  assert.equal(calls.intents[0].source, 'buy-now')
  assert.equal(calls.intents[0].items.length, 1)
  const [item] = calls.intents[0].items
  assert.equal(item.productId, 'prod-1')
  assert.equal(item.quantity, 2)
  assert.equal(item.variantId, null)
  assert.equal(item.aiFlower, null)
  assert.equal(item.lineId, 'p:prod-1|v:none|o:')
  assert.deepEqual(calls.added, [], 'buy now must not touch the cart')
  assert.deepEqual(calls.verified, [[{ productId: 'prod-1', productName: 'Rose bouquet', quantity: 2 }]])
})

// --- replay: things that go wrong ------------------------------------------------------------

await check('nothing stored: nothing happens', async () => {
  const { context, calls } = makeContext()
  assert.equal(await replay(context), 'none')
  nothingHappened(calls)
  assert.deepEqual(calls.toasts, [])
})

await check('expired intent: dropped without running anything', async () => {
  save('cart.add')
  const { context, calls } = makeContext()
  assert.equal(await replayPendingAction(context, PATH, NOW + PENDING_ACTION_TTL_MS + 1), 'expired')
  nothingHappened(calls)
  assert.deepEqual(calls.verified, [])
  assert.equal(entries.has(PENDING_ACTION_KEY), false)
})

await check('invalid payloads are refused outright, never repaired or defaulted', async () => {
  const bad = [
    undefined,
    null,
    'prod-1',
    [],
    {},
    { ...request, productId: undefined },
    { ...request, productId: '' },
    { ...request, productId: '   ' },
    { ...request, productId: 12 },
    { ...request, quantity: undefined },
    { ...request, quantity: '2' },
    { ...request, quantity: 0 },
    { ...request, quantity: -1 },
    { ...request, quantity: 1.5 },
    { ...request, quantity: 100 },
    { ...request, quantity: Number.POSITIVE_INFINITY }
  ]
  for (const type of ['cart.add', 'cart.buyNow']) {
    for (const payload of bad) {
      // JSON.stringify drops `undefined` fields and turns Infinity into null - both are "missing" to the parser.
      store({ type, payload, path: PATH, expiresAt: NOW + 1000 })
      const { context, calls } = makeContext()
      assert.equal(await replay(context), 'invalid', `${type} ${JSON.stringify(payload)}`)
      nothingHappened(calls)
      assert.deepEqual(calls.verified, [])
      assert.deepEqual(calls.toasts, [])
    }
  }
})

await check('signing in landed on another page: the intent is dropped, not replayed there', async () => {
  save('cart.buyNow')
  const { context, calls } = makeContext()
  assert.equal(await replay(context, '/'), 'elsewhere')
  nothingHappened(calls)
  assert.equal(takePendingAction(NOW).status, 'none')
})

await check('an account that cannot shop is told so, and nothing runs - for either action', async () => {
  for (const type of ['cart.add', 'cart.buyNow']) {
    save(type)
    const { context, calls } = makeContext({ canUseStorefront: false })
    assert.equal(await replay(context), 'ran', type)
    nothingHappened(calls)
    assert.deepEqual(calls.verified, [], type)
    assert.deepEqual(calls.toasts, [{ kind: 'error', message: 'auth.phone.storefrontUnavailable' }], type)
    assert.equal(takePendingAction(NOW).status, 'none', 'consumed even when refused')
  }
})

await check('buy now with ordering switched off says so and does not touch checkout', async () => {
  save('cart.buyNow')
  const { context, calls } = makeContext({ canBuyNow: false })
  await replay(context)
  assert.equal(calls.unavailable, 1)
  nothingHappened(calls)
  assert.deepEqual(calls.verified, [])
})

await check('buy now without a phone number is refused with the contact message', async () => {
  save('cart.buyNow')
  const { context, calls } = makeContext({ hasPhoneNumber: false })
  await replay(context)
  assert.deepEqual(calls.toasts, [{ kind: 'error', message: 'orders.checkout.contactMissing' }])
  nothingHappened(calls)
  assert.deepEqual(calls.verified, [])
})

await check('stock that no longer covers the amount stops both actions', async () => {
  for (const type of ['cart.add', 'cart.buyNow']) {
    save(type)
    const { context, calls } = makeContext({ verifySellableQuantity: async () => ({ ok: false }) })
    assert.equal(await replay(context), 'ran', type)
    nothingHappened(calls)
    assert.deepEqual(calls.toasts, [], 'the verifier itself reports the shortage')
  }
})

await check('cart.add refuses to exceed the per-line maximum rather than add less than asked', async () => {
  save('cart.add', { ...request, quantity: 5 })
  const { context, calls } = makeContext({ getInCartQuantity: () => 96 })
  await replay(context)
  assert.deepEqual(calls.added, [])
  assert.deepEqual(calls.verified, [])
  assert.deepEqual(calls.toasts, [{ kind: 'error', message: 'products.detail.purchase.stockLimit' }])
})

await check('a handler that throws is reported as failed, and the intent is still spent', async () => {
  save('cart.add')
  const { context, calls } = makeContext({
    verifySellableQuantity: async () => {
      throw new Error('boom')
    }
  })
  assert.equal(await replay(context), 'failed')
  nothingHappened(calls)
  assert.equal(takePendingAction(NOW).status, 'none')
})

await check('a tampered productName in storage is ignored: the API name is what gets verified and shown', async () => {
  save('cart.add', { ...request, productName: '<img src=x onerror=alert(1)>' })
  const { context, calls } = makeContext()
  assert.equal(await replay(context), 'ran')
  assert.deepEqual(calls.verified, [[{ productId: 'prod-1', productName: 'Rose bouquet', quantity: 2 }]])
  assert.equal(calls.toasts[0].options.description, 'Rose bouquet')
  assert.equal(calls.added.length, 1)
})

await check('extra fields (price, variantId, aiFlower, options) never reach the cart or checkout', async () => {
  const extras = {
    price: 1,
    unitPrice: 1,
    variantId: 5,
    selectedOptions: { a: 'b' },
    aiFlower: { generatedFlowerId: 'x' }
  }
  save('cart.add', { ...request, ...extras })
  const add = makeContext()
  await replay(add.context)
  assert.deepEqual(add.calls.added, [{ productId: 'prod-1', variantId: null, quantity: 2, selectedOptions: {} }])

  save('cart.buyNow', { ...request, ...extras })
  const buy = makeContext()
  await replay(buy.context)
  const [item] = buy.calls.intents[0].items
  assert.equal(item.variantId, null)
  assert.deepEqual(item.selectedOptions, {})
  assert.equal(item.aiFlower, null)
  assert.equal('price' in item, false)
})

await check('an id the API does not know is refused - nothing verified, added or opened', async () => {
  for (const type of ['cart.add', 'cart.buyNow']) {
    save(type)
    const { context, calls } = makeContext({ getProduct: async () => null })
    assert.equal(await replay(context), 'ran', type)
    nothingHappened(calls)
    assert.deepEqual(calls.verified, [], type)
    assert.deepEqual(calls.toasts, [{ kind: 'error', message: 'error.somethingWentWrong' }], type)
    assert.equal(takePendingAction(NOW).status, 'none', 'consumed even when refused')
  }
})

await check('a parent product with variants is never added directly', async () => {
  for (const type of ['cart.add', 'cart.buyNow']) {
    save(type)
    const { context, calls } = makeContext({ getProduct: async () => ({ productName: 'Parent', hasVariants: true }) })
    await replay(context)
    nothingHappened(calls)
    assert.deepEqual(calls.verified, [], type)
    assert.deepEqual(calls.toasts, [{ kind: 'error', message: 'error.somethingWentWrong' }], type)
  }
})

await check('permission checks run before any product lookup', async () => {
  save('cart.add')
  const { context, calls } = makeContext({ canUseStorefront: false })
  await replay(context)
  assert.deepEqual(calls.fetched, [])
})

await check('the product is looked up by the stored id, once', async () => {
  save('cart.buyNow', { productId: 'prod-77', quantity: 1 })
  const { context, calls } = makeContext()
  await replay(context)
  assert.deepEqual(calls.fetched, ['prod-77'])
})

// --- replay: duplicates ----------------------------------------------------------------------

await check('concurrent replays (re-render, Strict Mode) run the action exactly once', async () => {
  save('cart.add')
  const { context, calls } = makeContext()
  const results = await Promise.all([replay(context), replay(context), replay(context)])
  assert.deepEqual([...results].sort(), ['none', 'none', 'ran'])
  assert.equal(calls.added.length, 1)
  assert.equal(calls.verified.length, 1)
})

await check('a repeat after completion does nothing either', async () => {
  save('cart.buyNow')
  const { context, calls } = makeContext()
  assert.equal(await replay(context), 'ran')
  assert.equal(await replay(context), 'none')
  assert.equal(calls.intents.length, 1)
  assert.deepEqual(calls.navigated, ['/checkout'])
})

// --- the replayer's gate ---------------------------------------------------------------------

const ready = {
  mounted: true,
  isOnAuthPage: false,
  isGettingMe: false,
  isAuthenticated: true,
  hasCartHydrated: true,
  sawAuthPage: false
}

await check('the gate opens only for a signed-in visitor off the auth pages, with the cart read back', async () => {
  assert.equal(getReplayGate(ready), 'ready')
  assert.equal(getReplayGate({ ...ready, mounted: false }), 'wait')
  assert.equal(getReplayGate({ ...ready, isGettingMe: true }), 'wait')
  assert.equal(getReplayGate({ ...ready, isAuthenticated: false }), 'wait')
  assert.equal(getReplayGate({ ...ready, hasCartHydrated: false }), 'wait')
})

await check('while the sign-in modal or route is up, the gate never opens - even when signed in', async () => {
  assert.equal(getReplayGate({ ...ready, isOnAuthPage: true }), 'onAuthPage')
  assert.equal(getReplayGate({ ...ready, isOnAuthPage: true, isAuthenticated: false }), 'onAuthPage')
  assert.equal(getReplayGate({ ...ready, isOnAuthPage: true, isGettingMe: true }), 'onAuthPage')
})

await check('cancelled login: back from the auth pages with no session forgets the intent', async () => {
  save('cart.buyNow')
  const gate = getReplayGate({ ...ready, isAuthenticated: false, sawAuthPage: true })
  assert.equal(gate, 'cancelled')
  clearPendingAction()
  const { context, calls } = makeContext()
  assert.equal(await replay(context), 'none')
  nothingHappened(calls)
})

await check(
  'an unauthenticated visitor who never saw the auth pages keeps the intent (a reload is still loading)',
  async () => {
    save('cart.add')
    assert.equal(getReplayGate({ ...ready, isAuthenticated: false, sawAuthPage: false }), 'wait')
    assert.equal(takePendingAction(NOW).status, 'ok')
  }
)

console.log(`\n${count} pending-action checks passed`)
