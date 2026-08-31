// Same-origin proxy to the upstream API. Strips `Domain=` from Set-Cookie so the
// browser binds the upstream's HttpOnly auth cookies to this host.

const DEFAULT_UPSTREAM = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, '')

// Prefix-based routing: `/api/<prefix>/...` is stripped and forwarded to the
// matching upstream. Anything else falls through to the default upstream.
const PREFIXED_UPSTREAMS: Record<string, string | undefined> = {
  taskcoper: process.env.NEXT_PUBLIC_TASKCOPER_API_BASE_URL?.replace(/\/+$/, '')
}

const HOP_BY_HOP = new Set(['host', 'connection', 'content-length', 'transfer-encoding'])

async function proxy(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params
  const [firstSegment, ...rest] = path

  const prefixedUpstream = PREFIXED_UPSTREAMS[firstSegment]
  const upstreamBaseUrl = prefixedUpstream ?? DEFAULT_UPSTREAM
  const forwardedPath = prefixedUpstream ? rest : path

  if (!upstreamBaseUrl) {
    return new Response('Upstream API base URL is not configured', { status: 500 })
  }

  const { search } = new URL(req.url)
  const targetUrl = `${upstreamBaseUrl}/${forwardedPath.join('/')}${search}`

  const forwardHeaders = new Headers()
  req.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase()

    if (!HOP_BY_HOP.has(lowerKey) && lowerKey !== 'accept-encoding') {
      forwardHeaders.set(key, value)
    }
  })

  const hasBody = req.method !== 'GET' && req.method !== 'HEAD'

  const upstream = await fetch(targetUrl, {
    method: req.method,
    headers: forwardHeaders,
    body: hasBody ? await req.arrayBuffer() : undefined,
    redirect: 'manual'
  })

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
