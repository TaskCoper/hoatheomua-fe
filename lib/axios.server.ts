import 'server-only'

import type { AxiosRequestConfig } from 'axios'
import { cookies } from 'next/headers'

/**
 * Merge incoming request cookies into an axios config so a Server Component or
 * `*.server.ts` fetcher can call an authenticated endpoint as the current user.
 *
 * Server-only by virtue of importing `next/headers` - client modules that try
 * to pull this in fail at build time.
 */
export async function withForwardedCookies(config: AxiosRequestConfig = {}): Promise<AxiosRequestConfig> {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join('; ')

  if (!cookieHeader) {
    return config
  }

  return {
    ...config,
    headers: {
      ...(config.headers ?? {}),
      cookie: cookieHeader
    }
  }
}
