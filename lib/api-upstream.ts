// Upstream API base URLs for server-side calls (Route Handlers, Server Components).
//
// In Docker the FE reaches the gateway directly over the compose network via the
// `*_INTERNAL_BASE_URL` vars (set only in the Dockerfile's runtime stage), instead
// of looping out through the internet and Cloudflare back to the same host - that
// hairpin failed with ETIMEDOUT / EAI_AGAIN whenever the host's outbound network
// flapped. The public URL stays as the fallback for `pnpm build` and local dev,
// where the internal hostname does not resolve.

const trimTrailingSlash = (url?: string) => url?.replace(/\/+$/, '') || undefined

export const SERVER_API_BASE_URL = trimTrailingSlash(
  process.env.API_INTERNAL_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL
)

export const SERVER_TASKCOPER_API_BASE_URL = trimTrailingSlash(
  process.env.TASKCOPER_API_INTERNAL_BASE_URL || process.env.NEXT_PUBLIC_TASKCOPER_API_BASE_URL
)
