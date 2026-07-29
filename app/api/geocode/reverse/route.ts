import { z } from 'zod'

/**
 * VietMap Reverse v4 proxy — resolves a `lat`/`lng` (e.g. from a map pin) to
 * the nearest address. Called once per map pick, never per drag frame. Uses
 * `display_type=1` (new 2-level ward/city boundaries) to stay consistent with
 * the autocomplete/place proxies.
 *
 * Response: { result: { latitude, longitude, mapId, display, addressLine, ward, city } | null }
 * `result` is null when no address is near the point (a data-quality signal,
 * not an error). Upstream/config failures return a 4xx/5xx with a short reason.
 */

const VIETMAP_BASE_URL = 'https://maps.vietmap.vn/api'

// Boundary levels in VietMap responses: 0 = city, 1 = district, 2 = ward.
const BOUNDARY_CITY = 0
const BOUNDARY_WARD = 2

const QuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180)
})

const BoundarySchema = z.object({
  type: z.number(),
  full_name: z.string().optional().default('')
})

const ReverseResultSchema = z.object({
  ref_id: z.string().optional().default(''),
  name: z.string().optional().default(''),
  address: z.string().optional().default(''),
  display: z.string().optional().default(''),
  boundaries: z.array(BoundarySchema).optional().default([])
})

export async function GET(req: Request) {
  const apikey = process.env.VIETMAP_API_KEY
  if (!apikey) {
    return Response.json({ result: null, reason: 'server-not-configured' }, { status: 503 })
  }

  const { searchParams } = new URL(req.url)
  const parsed = QuerySchema.safeParse({
    lat: searchParams.get('lat') ?? '',
    lng: searchParams.get('lng') ?? ''
  })

  if (!parsed.success) {
    return Response.json({ result: null, reason: 'invalid-query' }, { status: 400 })
  }

  const { lat, lng } = parsed.data

  try {
    const url = new URL(`${VIETMAP_BASE_URL}/reverse/v4`)
    url.searchParams.set('apikey', apikey)
    url.searchParams.set('lat', String(lat))
    url.searchParams.set('lng', String(lng))
    url.searchParams.set('display_type', '1')

    const res = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!res.ok) {
      return Response.json({ result: null, reason: 'reverse-upstream-error' }, { status: 502 })
    }

    const results = z
      .array(ReverseResultSchema)
      .catch([])
      .parse(await res.json())
    const first = results[0]

    if (!first) {
      return Response.json({ result: null })
    }

    const ward = first.boundaries.find((boundary) => boundary.type === BOUNDARY_WARD)?.full_name ?? ''
    const city = first.boundaries.find((boundary) => boundary.type === BOUNDARY_CITY)?.full_name ?? ''

    return Response.json({
      result: {
        latitude: lat,
        longitude: lng,
        mapId: first.ref_id,
        display: first.display || first.name || '',
        addressLine: first.name || first.display || '',
        ward,
        city
      }
    })
  } catch {
    return Response.json({ result: null, reason: 'upstream-unreachable' }, { status: 502 })
  }
}
