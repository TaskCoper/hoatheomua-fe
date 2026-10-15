import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire, registerHooks } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
// Next's bundler resolves this extensionless ESM import; mirror it in Node.
registerHooks({
  resolve(specifier, context, nextResolve) {
    return nextResolve(specifier === 'next/server' ? 'next/server.js' : specifier, context)
  }
})

const nativeRequire = createRequire(resolve(root, 'package.json'))
const ts = nativeRequire('typescript')
const cache = new Map()
const requests = []
const api = {
  post: async (url, body) => {
    requests.push({ url, body })
    return {
      data: {
        value: { challengeId: '11111111-1111-4111-8111-111111111111', expiresInSeconds: 300, resendAfterSeconds: 60 }
      }
    }
  }
}
function load(file) {
  const path = resolve(root, file)
  if (cache.has(path)) return cache.get(path).exports
  const loadedModule = { exports: {} }
  cache.set(path, loadedModule)
  const source = ts.transpileModule(readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true }
  }).outputText
  const require = (name) => {
    if (name === '@/lib/axios') return { apiTaskcoper: api }
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
const { createSignInSchema, createChangePasswordSchema, createUpdateMeSchema } = load('features/users/validations.ts')
const t = (key) => key
let count = 0
function check(name, run) {
  run()
  count++
  console.log(`PASS ${name}`)
}
const signIn = createSignInSchema(t)
const proof = { challengeId: '11111111-1111-4111-8111-111111111111', code: '123456' }
check('email cannot be used as a login number', () =>
  assert.equal(signIn.safeParse({ phoneNumber: 'old@example.com', ...proof }).success, false)
)
for (const phoneNumber of ['0901234567', '0812345678', '+84 901234567', '84901234567']) {
  check(`phone notation ${phoneNumber} accepted`, () =>
    assert.equal(signIn.safeParse({ phoneNumber, ...proof }).success, true)
  )
}
check('legacy password-only login is rejected', () =>
  assert.equal(signIn.safeParse({ phoneNumber: '0901234567', password: 'Demo123!' }).success, false)
)
for (const code of ['', '12345', '1234567', 'abcdef']) {
  check(`invalid OTP ${code} rejected`, () =>
    assert.equal(signIn.safeParse({ phoneNumber: '0901234567', ...proof, code }).success, false)
  )
}
check('OTP leading zero preserved', () =>
  assert.equal(signIn.parse({ phoneNumber: '0901234567', ...proof, code: '012345' }).code, '012345')
)
check('challenge ID required', () =>
  assert.equal(signIn.safeParse({ phoneNumber: '0901234567', code: '123456' }).success, false)
)
check('password field rejected even with valid OTP', () =>
  assert.equal(signIn.safeParse({ phoneNumber: '0901234567', ...proof, password: 'Demo123!' }).success, false)
)
check('password change rejects reuse', () =>
  assert.equal(
    createChangePasswordSchema(t).safeParse({
      currentPassword: 'Demo123!',
      newPassword: 'Demo123!',
      confirmPassword: 'Demo123!'
    }).success,
    false
  )
)
check('password change requires current password', () =>
  assert.equal(
    createChangePasswordSchema(t).safeParse({ currentPassword: '', newPassword: 'New123!', confirmPassword: 'New123!' })
      .success,
    false
  )
)
const profile = {
  firstName: 'Test',
  lastName: 'Phone',
  email: '',
  avatar: '',
  coverImageUrl: '',
  phoneNumber: '0901234567',
  address: '',
  city: '',
  state: '',
  timeZone: 'Asia/Ho_Chi_Minh',
  domainIds: []
}
check('phone profile does not require email', () =>
  assert.equal(createUpdateMeSchema(t, true).safeParse(profile).success, true)
)
check('profile name limit matches API', () =>
  assert.equal(createUpdateMeSchema(t, true).safeParse({ ...profile, firstName: 'a'.repeat(51) }).success, false)
)
const service = load('features/users/services.ts').default
await service.signIn({ body: { phoneNumber: '0901234567', ...proof } })
check('login uses v2 phone payload', () =>
  assert.deepEqual(requests.pop(), { url: 'v2/users/login', body: { phoneNumber: '0901234567', ...proof } })
)
const challenge = await service.requestPhoneOtp({ phoneNumber: '0901234567', purpose: 'login' })
check('login OTP request validates response and purpose', () => {
  assert.equal(challenge.challengeId, proof.challengeId)
  assert.deepEqual(requests.pop(), {
    url: 'v2/users/request_phone_otp',
    body: { phoneNumber: '0901234567', purpose: 'login' }
  })
})
check('removed phone signup and reset clients stay unavailable', () => {
  assert.equal(service.signUp, undefined)
  assert.equal(service.resetPhonePassword, undefined)
})
check('invalid legacy phone format is rejected', () =>
  assert.equal(signIn.safeParse({ phoneNumber: '01234567890', ...proof }).success, false)
)
const proxy = load('proxy.ts').default
const { NextRequest } = nativeRequire('next/server')
for (const pathname of ['/sign-in', '/sign-up', '/en/sign-in', '/en/sign-up']) {
  check(`stale cookies do not bounce ${pathname}`, () => {
    const response = proxy(
      new NextRequest(`http://localhost${pathname}`, {
        headers: { cookie: 'accessToken=expired; refreshToken=revoked' }
      })
    )
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('location'), null)
  })
}
check('Vietnamese sign-in rewrites internally', () =>
  assert.equal(
    new URL(proxy(new NextRequest('http://localhost/sign-in')).headers.get('x-middleware-rewrite')).pathname,
    '/vi/sign-in'
  )
)
check('protected page sends anonymous user to localized sign-in', () => {
  const response = proxy(new NextRequest('http://localhost/en/users/phone-test?section=password'))
  const target = new URL(response.headers.get('location'))
  assert.equal(target.pathname, '/en/sign-in')
  assert.equal(target.searchParams.get('from'), '/en/users/phone-test?section=password')
})
console.log(`${count} phone authentication checks passed`)
