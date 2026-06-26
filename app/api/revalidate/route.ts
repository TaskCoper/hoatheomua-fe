import { routing } from '@/lib/i18n/routing'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

/**
 * On-demand revalidation webhook.
 *
 * Authentication: `x-revalidate-secret` header must match `REVALIDATE_SECRET`.
 * The endpoint rejects everything if the env var is unset.
 *
 * Body: { entity, id?, slug? } — see EntityBodySchema below for the contract.
 * Each entity expands to one `revalidatePath(...)` call per supported locale
 * (vi + en), so a single webhook call refreshes both language variants.
 *
 * Returns { revalidated: true, paths } on success, or a 4xx with a short reason.
 *
 * curl example:
 *   curl -X POST $SITE/api/revalidate \
 *     -H "x-revalidate-secret: $REVALIDATE_SECRET" \
 *     -H "content-type: application/json" \
 *     -d '{"entity":"product","id":"12345"}'
 */

const ProductBody = z.object({ entity: z.literal('product'), id: z.string().min(1) })
const NewsBody = z.object({ entity: z.literal('news'), slug: z.string().min(1) })
const NewsListBody = z.object({ entity: z.literal('newsList') })
const HomeBody = z.object({ entity: z.literal('home') })

const EntityBodySchema = z.union([ProductBody, NewsBody, NewsListBody, HomeBody])

const pathsForEntity = (body: z.infer<typeof EntityBodySchema>): string[] => {
  return routing.locales.flatMap((locale) => {
    const prefix = locale === routing.defaultLocale ? '' : `/${locale}`
    switch (body.entity) {
      case 'product':
        // Product detail also lives on the home page (signature bouquets) so
        // invalidate both to keep the home grid fresh.
        return [`${prefix}/products/${body.id}`, prefix || '/']
      case 'news':
        return [`${prefix}/news/${body.slug}`, `${prefix}/news`]
      case 'newsList':
        return [`${prefix}/news`]
      case 'home':
        return [prefix || '/']
    }
  })
}

export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET
  if (!secret) {
    return Response.json({ revalidated: false, reason: 'server-not-configured' }, { status: 503 })
  }

  if (req.headers.get('x-revalidate-secret') !== secret) {
    return Response.json({ revalidated: false, reason: 'unauthorized' }, { status: 401 })
  }

  let json: unknown
  try {
    json = await req.json()
  } catch {
    return Response.json({ revalidated: false, reason: 'invalid-json' }, { status: 400 })
  }

  const parsed = EntityBodySchema.safeParse(json)
  if (!parsed.success) {
    return Response.json({ revalidated: false, reason: 'invalid-body', issues: parsed.error.issues }, { status: 400 })
  }

  const paths = pathsForEntity(parsed.data)
  for (const path of paths) {
    revalidatePath(path, 'page')
  }

  return Response.json({ revalidated: true, paths })
}
