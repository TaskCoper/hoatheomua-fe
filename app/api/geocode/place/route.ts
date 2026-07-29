import { z } from 'zod'

/**
 * VietMap Place v4 proxy — resolves an autocomplete suggestion's `ref_id` to
 * `lat`/`lng` + a formatted label. Called once per user selection, never per
 * keystroke. `ref_id` is opaque and passed through verbatim. Since the
 * ref_id came from Autocomplete v4's `display_type=1`, the resolved `display`
 * reflects the new 2-level (ward, city) format.
 *
 * Response: { result: { latitude, longitude, mapId, display } | null }
 * `result` is null when the ref_id has no match (a data-quality signal, not
 * an error). Upstream/config failures return a 4xx/5xx with a short reason.
 */

const VIETMAP_BASE_URL = 'https://maps.vietmap.vn/api'

const QuerySchema = z.object({
  refId: z.string().trim().min(1)
})

const PlaceSchema = z.object({
  display: z.string().optional(),
  lat: z.number(),
  lng: z.number()
})

export async function GET(req: Request) {
  const apikey = process.env.VIETMAP_API_KEY
  if (!apikey) {
    return Response.json({ result: null, reason: 'server-not-configured' }, { status: 503 })
  }

  const { searchParams } = new URL(req.url)
  const parsed = QuerySchema.safeParse({ refId: searchParams.get('refId') ?? '' })

  if (!parsed.success) {
    return Response.json({ result: null, reason: 'invalid-query' }, { status: 400 })
  }

  const { refId } = parsed.data

  try {
    const url = new URL(`${VIETMAP_BASE_URL}/place/v4`)
    url.searchParams.set('apikey', apikey)
    url.searchParams.set('refid', refId)

    const res = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!res.ok) {
      return Response.json({ result: null, reason: 'place-upstream-error' }, { status: 502 })
    }

    const place = PlaceSchema.safeParse(await res.json())
    if (!place.success) {
      return Response.json({ result: null })
    }

    return Response.json({
      result: {
        latitude: place.data.lat,
        longitude: place.data.lng,
        mapId: refId,
        display: place.data.display || ''
      }
    })
  } catch {
    return Response.json({ result: null, reason: 'upstream-unreachable' }, { status: 502 })
  }
}
