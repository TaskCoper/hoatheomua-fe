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

Sentry.init({
  // Shared DSN, environment, sampling and data-collection (privacy) settings live in lib/sentry-options.ts.
  // `release` is deliberately not set: withSentryConfig injects it at build time from SENTRY_RELEASE.
  ...sentryBaseOptions,

  beforeBreadcrumb: stripRequestQuery,

  // Session Replay. Recording is always in "buffer" mode (kept in memory, nothing is sent) until an
  // error occurs, so the on-error rate below also covers the 95% of sessions that are not sampled.
  // Privacy: every text node and input is masked and all media is blocked (these are the SDK defaults,
  // stated explicitly so a future SDK upgrade cannot loosen them). Request/response bodies and headers
  // are not recorded because `networkDetailAllowUrls` is intentionally left empty.
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      maskAllInputs: true,
      blockAllMedia: true
    })
  ],
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 0,
  replaysOnErrorSampleRate: 1
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
