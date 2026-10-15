# Storefront phone accounts

Registration and sign-in use v2 phone/password only. Registration now requires a six-digit Zalo OTP before creating the account and issuing a session. The sign-in form rejects email addresses. Email verification, resend-code and email password-recovery clients/forms are removed. Old `/verify-sent` links redirect to the localized sign-in page without forwarding their query parameters. Forgotten-password pages request a Zalo OTP and submit it together with the new password to the v2 reset endpoint.

Current identity/profile reads use v2; phone profiles cannot edit their login number or email. Existing eligible sessions remain usable, but there is no email sign-in on this frontend. Existing email/profile data is not deleted and backend v1 compatibility is preserved. Storefront eligibility still comes from the backend; no UI redirects users to email verification. Recruitment remains unavailable for phone accounts.

Password changes require the current password through v2 and clear the session after success. Profile image uploads for phone accounts remain unavailable because the Taskcoper storage API requires email verification.

The API proxy must forward v2 and session cookies; refresh/logout remain v1. Related rules: shared User Authentication BR-37–49.

## Stability fixes

- Dashboard now lives under the localized, authenticated customer layout; it no longer breaks the production build by missing a root layout.
- `pnpm dev` binds to localhost. Mixing a 127.0.0.1 bind with Next's localhost-normalized i18n rewrites caused the observed Vietnamese redirect loop; matching the hostname resolves it without changing public localized URLs.
- The proxy does not redirect guest auth pages based solely on cookie presence. AuthGuard waits for `/me`; the shared query treats 401 as no session, allowing login even when old cookies are expired/revoked.
- Profile names enforce the API's 50-character limit. Password reuse is rejected before submission; an incorrect current password is attached to that field using the backend error code.
- The single-package pnpm workspace is declared explicitly, and `pnpm check` includes `verify:phone-auth` regression checks.

## Validation (2026-09-28)

- Full production build (`next build --webpack`) and standalone asset packaging passed, prerendering 64 pages with a disposable local API fixture.
- `pnpm check` passed: ESLint (0 errors; 21 existing warnings), TypeScript, i18n validation, 336 image-viewport assertions and 18 phone-auth regression checks.
- 15 HTTP checks against the standalone production server passed: Vietnamese/English auth pages, stale-cookie sign-in, localized protected routes/dashboard, canonical Vietnamese routing and old verification links with their email query removed.
- Browser checks passed with a local mock API: Vietnamese login, editing profile while phone stays readonly, wrong-current-password rejection, password change clearing the session, login with the new password, English registration signing in immediately without OTP, stale/revoked cookies returning to sign-in, support-only password recovery, and old email verification redirects. Profile updates exclude phone/email and password changes send only current/new password.
- Local execution used the available Node 23.7 runtime; the deployment/CI contract remains Node 24 (`.nvmrc` and Dockerfile). pnpm reports the local engine mismatch. The default Node 22.11 runtime cannot run the existing TypeScript verification script; use the project's Node 24 for normal development.

No real account/database, payment or shipping provider was changed. These tests exercise frontend integration with a local fixture, not a deployment against the live backend. Publishing source changes does not deploy the application or apply database migrations.

## Zalo OTP extension (2026-10-15)

Request `/api/v2/users/request_phone_otp` with phoneNumber/purpose; retain challengeId only in component memory. Registration submits challengeId/code plus the original form; recovery submits phoneNumber/challengeId/code/newPassword to `/api/v2/users/reset_phone_password`. Resend replaces the challenge and resets the code. Back/edit discards the challenge, while preserving the per-phone server cooldown. Reset success clears cached session state and offers sign-in. Codes expire in five minutes; resend waits 60 seconds. All provider keys and the OTP secret are backend-only. Deploy with the matching taskcoper-be change; there is no schema migration.

The older validation section describes the pre-OTP release, not this extension.
