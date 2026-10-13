import type { BrowserOptions } from '@sentry/nextjs'

// Options shared by the browser, Node and edge `Sentry.init` calls. One module so the privacy
// settings cannot drift between runtimes.

// The SDK does not re-export its `DataCollection` type, so derive it from the options.
type DataCollection = NonNullable<BrowserOptions['dataCollection']>

// A DSN is a write-only ingest key and ships in the browser bundle by design; it is not a secret.
export const SENTRY_DSN =
  'https://4fdd84fbd6e08161f3161357c5a57f7d@o4512247139794944.ingest.us.sentry.io/4512247162732544'

// Demo and prod are separate image builds that both run with NODE_ENV=production, so NODE_ENV alone
// cannot tell them apart. The Docker build bakes NEXT_PUBLIC_SENTRY_ENVIRONMENT in (`development` for
// demo, `production` for prod, see Dockerfile); it is inlined into the client, server and edge bundles
// alike. Without it (local `next dev` / `next build`) Sentry stays off, so local noise never lands in
// the `development` environment.
export const SENTRY_ENVIRONMENT = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || undefined

// Terms are matched as case-insensitive substrings of the header / cookie / query-param name, on top
// of the SDK's built-in list (auth, token, secret, session, key, cookie, password, ...).
const IDENTIFYING_TERMS = ['forwarded', '-ip', 'remote-', 'via', '-user']

// Query params that carry user data the built-in list does not know about: the delivery address and
// coordinates sent to /api/geocode/*, and the phone / email used by the phone-auth flows.
// 'lat' also matches names like `template*`; losing those in a URL is an acceptable trade-off.
const PERSONAL_QUERY_TERMS = ['phone', 'email', 'otp', 'address', 'text', 'focus', 'ward', 'city', 'lat', 'lng']

export const sentryDataCollection: DataCollection = {
  // Only stops the SDK inferring the visitor's IP. An explicit Sentry.setUser({ id }) still applies.
  userInfo: false,
  graphQL: { document: false, variables: false },
  genAI: { inputs: false, outputs: false },
  databaseQueryData: false,
  queues: false,
  httpBodies: [],
  httpHeaders: { deny: IDENTIFYING_TERMS },
  cookies: { deny: IDENTIFYING_TERMS },
  urlQueryParams: { deny: [...IDENTIFYING_TERMS, ...PERSONAL_QUERY_TERMS] }
}

export const sentryBaseOptions = {
  dsn: SENTRY_DSN,
  enabled: Boolean(SENTRY_ENVIRONMENT),
  environment: SENTRY_ENVIRONMENT,
  // Sampling is parent-based: a browser-sampled trace is always continued by the server.
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1,
  dataCollection: sentryDataCollection
}
