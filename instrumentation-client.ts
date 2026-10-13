// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'
import { sentryBaseOptions } from './lib/sentry-options'

// Request breadcrumbs (axios goes through XHR) carry the raw URL: the SDK's dataCollection query filter
// only covers spans and event requests, not breadcrumbs. Replay builds its network entries from the
// same breadcrumbs, so dropping the query here covers both. Request spans keep a filtered query.
const stripRequestQuery = (breadcrumb: Sentry.Breadcrumb) => {
  const url: unknown = breadcrumb.data?.url

  if ((breadcrumb.category === 'xhr' || breadcrumb.category === 'fetch') && typeof url === 'string') {
    breadcrumb.data = { ...breadcrumb.data, url: url.split(/[?#]/, 1)[0] }
  }

  return breadcrumb
}

// Crawlers and lab tools are not users. Skipping Replay for them keeps them out of the quota and stops
// the recording overhead from skewing Lighthouse / PageSpeed runs (headless Chrome). `isBotUserAgent`
// only knows the big search crawlers, hence the extra pattern.
const isAutomatedVisitor = () =>
  Sentry.isBotUserAgent() || /Lighthouse|HeadlessChrome|PageSpeed|GTmetrix|Pingdom/i.test(navigator.userAgent)

// Errors whose session nobody can learn from: the visitor went offline or timed out (axios `Network Error`
// / `timeout of Nms exceeded`), the API answered with a client error (`status code 4xx`, e.g. a stale
// link) or the browser's harmless ResizeObserver notice. The error is still reported - only its replay is
// skipped. 5xx and every other error keep their replay.
const NOISY_AXIOS_MESSAGE = /^(Network Error|timeout of \d+ms exceeded|Request failed with status code 4\d\d)$/

const isNoisyForReplay = (event: Sentry.ErrorEvent) => {
  const values = event.exception?.values
  const error = values?.[values.length - 1]
  const message = error?.value ?? ''

  return (error?.type === 'AxiosError' && NOISY_AXIOS_MESSAGE.test(message)) || /^ResizeObserver loop/.test(message)
}

Sentry.init({
  // Shared DSN, environment, sampling and data-collection (privacy) settings live in lib/sentry-options.ts.
  // `release` is deliberately not set: withSentryConfig injects it at build time from SENTRY_RELEASE.
  ...sentryBaseOptions,

  beforeBreadcrumb: stripRequestQuery,

  // Session Replay. Quota is only spent on replays that are sent: 1% of sessions, plus every session with
  // an error. Every other session records into memory ("buffer" mode) and sends nothing unless an error
  // occurs, so the on-error rate also covers the sessions that were not sampled.
  // Privacy: every text node and input is masked and all media is blocked (these are the SDK defaults,
  // stated explicitly so a future SDK upgrade cannot loosen them). Request/response bodies and headers
  // are not recorded because `networkDetailAllowUrls` is intentionally left empty.
  integrations: isAutomatedVisitor()
    ? []
    : [
        Sentry.replayIntegration({
          maskAllText: true,
          maskAllInputs: true,
          blockAllMedia: true,
          beforeErrorSampling: (event) => !isNoisyForReplay(event)
        })
      ],
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.01 : 0,
  replaysOnErrorSampleRate: 1
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
