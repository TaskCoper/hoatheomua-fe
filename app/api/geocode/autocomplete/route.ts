import { z } from 'zod'

const VIETMAP_BASE_URL = 'https://maps.vietmap.vn/api'
const MAX_RESULTS = 8

const QuerySchema = z.object({
  text: z.string().trim().min(2),
  // `lat,lng` - optional proximity hint passed straight through to VietMap.
  focus: z
    .string()
    .trim()
    .regex(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/)
    .optional(),
  ward: z.string().trim().optional(),
  city: z.string().trim().optional()
})

const BoundarySchema = z.object({
  name: z.string().optional().default(''),
  full_name: z.string().optional().default('')
})

const AutocompleteResultSchema = z.object({
  ref_id: z.string(),
  name: z.string().optional().default(''),
  address: z.string().optional().default(''),
  display: z.string().optional().default(''),
  boundaries: z.array(BoundarySchema).optional().default([])
})

const COMBINING_MARKS = /[̀-ͯ]/g
const ADMIN_PREFIX = /^(phuong|xa|thi tran|quan|huyen|thi xa|thanh pho|tinh)\s+/

const normalize = (value: string) =>
  value.normalize('NFD').replace(COMBINING_MARKS, '').toLowerCase().replace(/\s+/g, ' ').trim()

// Strips the admin-level prefix (e.g. "Phường", "Thành phố") so a bare name
// like "Sài Gòn" still matches an address string of "Phường Sài Gòn, …".
const adminCoreName = (value: string) => normalize(value).replace(ADMIN_PREFIX, '').trim()

// Matches a ward/city against a result's structured admin boundaries rather than
// its free-text `address` string. `boundaries` carries each admin level as a
// discrete { name, full_name }, so this survives abbreviations (e.g. "TP. HCM")
// and address strings that omit the ward - which the old substring match on
// `address` silently dropped.
const boundaryMatchesCore = (boundaries: { name: string; full_name: string }[], core: string): boolean =>
  boundaries.some((boundary) => {
    const name = adminCoreName(boundary.name)
    const fullName = adminCoreName(boundary.full_name)
    return name === core || fullName === core || name.includes(core) || fullName.includes(core)
  })

export async function GET(req: Request) {
  const apikey = process.env.VIETMAP_API_KEY
  if (!apikey) {
    return Response.json({ results: [], reason: 'server-not-configured' }, { status: 503 })
  }

  const { searchParams } = new URL(req.url)
  const parsed = QuerySchema.safeParse({
    text: searchParams.get('text') ?? '',
    focus: searchParams.get('focus') ?? undefined,
    ward: searchParams.get('ward') ?? undefined,
    city: searchParams.get('city') ?? undefined
  })

  if (!parsed.success) {
    return Response.json({ results: [], reason: 'invalid-query' }, { status: 400 })
  }

  const { text, focus, ward, city } = parsed.data

  try {
    const url = new URL(`${VIETMAP_BASE_URL}/autocomplete/v4`)
    url.searchParams.set('apikey', apikey)
    url.searchParams.set('text', text)
    url.searchParams.set('display_type', '1')
    if (focus) url.searchParams.set('focus', focus)

    const res = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!res.ok) {
      return Response.json({ results: [], reason: 'autocomplete-upstream-error' }, { status: 502 })
    }

    const results = z
      .array(AutocompleteResultSchema)
      .catch([])
      .parse(await res.json())

    const wardCore = ward ? adminCoreName(ward) : null
    const cityCore = city ? adminCoreName(city) : null

    const matching = results.filter((result) => {
      if (!wardCore && !cityCore) return true
      const boundaries = result.boundaries ?? []
      return (
        (!wardCore || boundaryMatchesCore(boundaries, wardCore)) &&
        (!cityCore || boundaryMatchesCore(boundaries, cityCore))
      )
    })

    return Response.json({
      results: matching.slice(0, MAX_RESULTS).map((result) => ({
        refId: result.ref_id,
        name: result.name,
        address: result.address,
        display: result.display
      }))
    })
  } catch {
    return Response.json({ results: [], reason: 'upstream-unreachable' }, { status: 502 })
  }
}
