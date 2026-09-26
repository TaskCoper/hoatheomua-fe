import { isFeatureEnabled } from '@/shared/feature-flags'
import { z } from 'zod'

/**
 * Nhanh.vn Open API v3 webhooks callback.
 *
 * Authentication: Nhanh sends the app's verify token in the `Authorization`
 * header (raw value, no "Bearer" prefix). Requests whose header does not match
 * VERIFY_TOKEN are rejected with 401.
 *
 * Contract (per Nhanh.vn v3 docs):
 *   POST application/json
 *   { event: string, businessId?: number, data?: unknown }
 *
 * Events: webhooksEnabled, appUninstalled, productAdd, productUpdate,
 * productDelete, inventoryChange, orderAdd, orderUpdate, orderDelete.
 *
 * Nhanh requires HTTP 200 to consider delivery successful. Failing responses
 * are retried up to 3 times, and repeated failures lower the app's priority
 * or disable webhooks entirely - so we ack fast and defer heavy work.
 */

const VERIFY_TOKEN = 'X7mK2qP9aL4vN8rT1cJ5wH3yUz6BfD0e'

const WebhookEvent = z.enum([
  'webhooksEnabled',
  'appUninstalled',
  'productAdd',
  'productUpdate',
  'productDelete',
  'inventoryChange',
  'orderAdd',
  'orderUpdate',
  'orderDelete'
])

const WebhookBodySchema = z.object({
  event: WebhookEvent,
  businessId: z.number().int().optional(),
  data: z.unknown().optional()
})

export async function POST(req: Request) {
  const rawBody = await req.clone().text()
  console.log('[nhanh-webhook:in]', {
    url: req.url,
    headers: Object.fromEntries(req.headers),
    body: rawBody
  })

  if (req.headers.get('authorization') !== VERIFY_TOKEN) {
    return Response.json({ ok: false, reason: 'unauthorized' }, { status: 401 })
  }

  let json: unknown
  try {
    json = await req.json()
  } catch {
    return Response.json({ ok: false, reason: 'invalid-json' }, { status: 400 })
  }

  const parsed = WebhookBodySchema.safeParse(json)
  if (!parsed.success) {
    return Response.json({ ok: false, reason: 'invalid-body', issues: parsed.error.issues }, { status: 400 })
  }

  const { event, businessId, data } = parsed.data

  // Verification ping - Nhanh sends this when webhooks are enabled and when
  // periodically checking the callback URL. Ack without side effects.
  if (event === 'webhooksEnabled') {
    return Response.json({ ok: true })
  }

  // External services are switched off (see shared/feature-flags), so order and
  // inventory events are acked and dropped rather than acted on. Nhanh still
  // needs its 200, or it retries and eventually disables the webhook.
  if (!isFeatureEnabled('externalServices')) {
    console.log('[nhanh-webhook:skipped]', { event, businessId })
    return Response.json({ ok: true })
  }

  // TODO: enqueue for async processing (order/product/inventory handlers).
  // Do not do heavy work inline - Nhanh throttles slow callbacks.
  console.log('[nhanh-webhook]', { event, businessId, data })

  return Response.json({ ok: true })
}
