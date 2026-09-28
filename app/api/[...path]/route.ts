// Same-origin proxy to the upstream API. Strips `Domain=` from Set-Cookie so the
// browser binds the upstream's HttpOnly auth cookies to this host.

import { apiErrorJson } from '@/lib/api-envelope'
import { SERVER_API_BASE_URL, SERVER_TASKCOPER_API_BASE_URL } from '@/lib/api-upstream'

const DEFAULT_UPSTREAM = SERVER_API_BASE_URL

// Prefix-based routing: `/api/<prefix>/...` is stripped and forwarded to the
// matching upstream. Anything else falls through to the default upstream.
const PREFIXED_UPSTREAMS: Record<string, string | undefined> = {
  taskcoper: SERVER_TASKCOPER_API_BASE_URL
}

const HOP_BY_HOP = new Set(['host', 'connection', 'content-length', 'transfer-encoding'])

const TIMEOUT_CODES = new Set(['ETIMEDOUT', 'UND_ERR_CONNECT_TIMEOUT', 'UND_ERR_HEADERS_TIMEOUT'])

// A thrown fetch means the request never got a response from the backend (DNS,
// connect timeout, reset), so the backend has no trace of it - log it here and
// answer with a gateway status in the backend's error envelope instead of
// letting Next.js turn it into an opaque 500.
const upstreamUnavailable = (method: string, target: string, error: unknown) => {
  const cause = (error as { cause?: { code?: string } }).cause
  const code = cause?.code ?? (error instanceof Error ? error.name : 'UnknownError')
  const status = TIMEOUT_CODES.has(code) ? 504 : 502

  console.error(`[API-PROXY] ${method} ${target} failed: ${code}`)

  return apiErrorJson({
    status,
    detail: 'Không thể kết nối tới máy chủ. Vui lòng thử lại.',
    messageCode: 'UpstreamUnavailable'
  })
}

async function proxy(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params
  const [firstSegment, ...rest] = path

  const prefixedUpstream = PREFIXED_UPSTREAMS[firstSegment]
  const upstreamBaseUrl = prefixedUpstream ?? DEFAULT_UPSTREAM
  const forwardedPath = prefixedUpstream ? rest : path

  if (!upstreamBaseUrl) {
    return apiErrorJson({
      status: 500,
      detail: 'Địa chỉ máy chủ API chưa được cấu hình.',
      messageCode: 'UpstreamNotConfigured'
    })
  }

  const { search } = new URL(req.url)
  const targetPath = `${upstreamBaseUrl}/${forwardedPath.join('/')}`
  const targetUrl = `${targetPath}${search}`

  const forwardHeaders = new Headers()
  req.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase()

    if (!HOP_BY_HOP.has(lowerKey) && lowerKey !== 'accept-encoding') {
      forwardHeaders.set(key, value)
    }
  })

  const hasBody = req.method !== 'GET' && req.method !== 'HEAD'
  const body = hasBody ? await req.arrayBuffer() : undefined

  let upstream: Response
  try {
    upstream = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body,
      redirect: 'manual'
    })
  } catch (error) {
    // Query string left out of the log: it can carry user input.
    return upstreamUnavailable(req.method, targetPath, error)
  }

  const STRIP_RESPONSE_HEADERS = new Set(['set-cookie', 'content-encoding', 'content-length', 'transfer-encoding'])

  const responseHeaders = new Headers()
  upstream.headers.forEach((value, key) => {
    if (!STRIP_RESPONSE_HEADERS.has(key.toLowerCase())) responseHeaders.append(key, value)
  })
  for (const cookie of upstream.headers.getSetCookie()) {
    responseHeaders.append('set-cookie', cookie.replace(/;\s*Domain=[^;]+/gi, ''))
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders
  })
}

export { proxy as DELETE, proxy as GET, proxy as HEAD, proxy as OPTIONS, proxy as PATCH, proxy as POST, proxy as PUT }
