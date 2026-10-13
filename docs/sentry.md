# Sentry

Org `dahn-i7`, project `hoatheomua-fe`, `@sentry/nextjs` 11.x. All runtimes share one options module, `lib/sentry-options.ts` (DSN, environment, sampling, privacy). Per-runtime init lives in `instrumentation-client.ts` (browser), `sentry.server.config.ts` and `sentry.edge.config.ts`.

## What is wired

| Area                | How                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Errors              | Uncaught client/server errors, `onRequestError`, `app/global-error.tsx`, and `app/[locale]/error.tsx` (it swallows the error, so it reports it itself - this is where most failed React Query fetches end up, see `throwOnError`). The API proxy (`app/api/[...path]/route.ts`) reports upstream connect/timeout failures, at most one per error code per minute per instance.                                                            |
| Performance         | `tracesSampleRate` 0.1 in production, 1 in dev. Parent-based: a browser-sampled trace is always continued by the server. `/robots.txt` (the Docker healthcheck) is already excluded by the SDK.                                                                                                                                                                                                                                           |
| Distributed tracing | The browser only calls same-origin `/api/*`, so the SDK's default propagation targets attach `sentry-trace` + `baggage` and there is no CORS surface. The proxy forwards both headers to the backend untouched, so the trace id is continuous browser -> Next -> backend. **Do not add `tracePropagationTargets`** for cross-origin hosts (presigned uploads, vietqr, goong, live chat): their CORS rules would reject the extra headers. |
| Session Replay      | Browser only. 1% of sessions in production, 100% of sessions with an error (dev: errors only). Text and inputs masked, media blocked, no network bodies/headers. Not started for crawlers or Lighthouse/PageSpeed. An error does not get a replay when it is axios offline/timeout/4xx or a ResizeObserver notice (the error itself is still reported).                                                                                   |
| User context        | `features/users/components/sentry-user-context.tsx`, mounted in `app/[locale]/layout.tsx`. Sets `{ id }` only, follows the `['me']` query cache (no extra request), clears on sign-out / 401. The server sets no user.                                                                                                                                                                                                                    |
| Release             | The commit SHA: `SENTRY_RELEASE` is passed by `build-image.yaml` -> compose build arg -> Dockerfile, and `withSentryConfig` bakes it into the client and server bundles and the source-map upload.                                                                                                                                                                                                                                        |
| Environment         | `prod` is reported as `production`, `demo` as `demo` (`NEXT_PUBLIC_SENTRY_ENVIRONMENT`, from the same workflow). Local `next dev` reports `development`.                                                                                                                                                                                                                                                                                  |
| Source maps         | `next.config.ts`: uploaded after the Turbopack build with `SENTRY_AUTH_TOKEN` (Docker build secret), then deleted from the image. Upload or release failures log an error but do not fail the build.                                                                                                                                                                                                                                      |

## Privacy

Configured in `lib/sentry-options.ts` (`dataCollection`) and `instrumentation-client.ts`:

- Never collected: request/response bodies, IP inference, GraphQL/AI/DB/queue payloads, local variables.
- Always `[Filtered]` by the SDK: any cookie / header / query param whose name contains `auth`, `token`, `secret`, `session`, `key`, `cookie`, `password`, ... This covers `accessToken`, `refreshToken` and the `apikey` on the geocode calls.
- Additionally filtered in query strings: `phone`, `email`, `otp`, `address`, `text`, `focus`, `ward`, `city`, `lat`, `lng` (the delivery address and coordinates sent to `/api/geocode/*`). Add a term to `PERSONAL_QUERY_TERMS` when a new URL carries user data.
- XHR/fetch breadcrumbs keep the path but drop the query entirely (the SDK's filter does not reach breadcrumbs, and Replay reads the same ones).
- Server frames carry source context lines, so never hardcode a secret in a route file (`app/api/webhooks/callback/route.ts` currently does - move it to an env var).

## Manual setup

1. **GitHub secret** - `SENTRY_AUTH_TOKEN` must exist in both the `demo` and `prod` GitHub environments (an Organization Auth Token with release + source-map scopes). Without it the build still succeeds but uploads nothing.
2. **Alerts** - create the three rules below in Sentry (Alerts -> Create Alert). They are not created by this repo.
3. **Suspect commits (optional)** - connect the GitHub integration (Settings -> Integrations -> GitHub) and grant it `TaskCoper/hoatheomua-fe`. The plugin then needs `release: { setCommits: { repo: 'TaskCoper/hoatheomua-fe', commit: <sha> } }` in `next.config.ts`; the default `auto` mode cannot work because the Docker build has no `.git`. Not configured, not tested.
4. **Replay quota** - check Settings -> Subscription for the Replay quota and on-demand budget. Only replays that are sent count: 1% of sessions plus every session with a (non-filtered) error; sessions without an error are recorded in memory and sent nothing. Tuning lives in `instrumentation-client.ts` (`replaysSessionSampleRate`, `isAutomatedVisitor`, `isNoisyForReplay`).

### Alert rules (production only)

Set **Environment: production** on every rule so demo traffic never pages anyone. Pick the same notification target for all three.

| Rule                 | Type         | Condition                                                                                                                                                                                                                                                          |
| -------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| New production issue | Issue alert  | When: _A new issue is created_. Action interval 30 min. Outage-type failures (`api-proxy-upstream-unavailable` + error code) arrive through this rule, one issue per failure mode.                                                                                 |
| Regression           | Issue alert  | When: _The issue changes state from resolved to unresolved_.                                                                                                                                                                                                       |
| Error spike          | Metric alert | Dataset _Errors_, query `event.type:error`, `count()` over 15 min. Start with warning > 10, critical > 20, resolved < 5 - there is no traffic baseline yet, so re-tune after a week (or switch to _Anomaly detection_, medium sensitivity, once there is history). |

## Verify after the first deploy

- Releases shows the commit SHA, with a `production` and a `demo` environment.
- A new error shows a readable stack trace (source maps), the release, the environment, and `user.id` when signed in.
- An error session has a Replay with masked text and blocked images. The repo has no test page: to check this, temporarily add a button that throws an `Error` in its click handler (not `captureMessage`, not an API 4xx, not a server-only error) and remove it afterwards. Wait ~10 s after the page loads, then stay on the page for ~15 s: replays shorter than ~5 s are held back and lost if you leave first.
- A sampled trace shows the browser request, the Next `/api/[...path]` transaction and (if the backend runs Sentry) the backend span under one trace id.

## Local builds

The build plugin auto-loads `.env.sentry-build-plugin` and lets it override the environment, so a local `pnpm build` uploads source maps and creates a release named after your local `HEAD` in the real project. To build without uploading, build from a copy that does not contain that file.
