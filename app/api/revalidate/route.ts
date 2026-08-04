import { PRODUCTS_CACHE_TAG } from '@/features/products/queries.server'
import { routing } from '@/lib/i18n/routing'
import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'

/**
 * On-demand revalidation webhook.
 *
 * Authentication: `x-revalidate-secret` header must match `REVALIDATE_SECRET`.
 * The endpoint rejects everything if the env var is unset.
 *
 * Body: { entity, id?, slug? } - see EntityBodySchema below for the contract.
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
// For catalog-wide changes (a new product, a bulk price/stock edit) that should
// refresh the listing but aren't tied to one product's detail page.
const ProductListBody = z.object({ entity: z.literal('productList') })
const NewsBody = z.object({ entity: z.literal('news'), slug: z.string().min(1) })
const NewsListBody = z.object({ entity: z.literal('newsList') })
const HomeBody = z.object({ entity: z.literal('home') })

const EntityBodySchema = z.union([ProductBody, ProductListBody, NewsBody, NewsListBody, HomeBody])

const pathsForEntity = (body: z.infer<typeof EntityBodySchema>): string[] => {
  return routing.locales.flatMap((locale) => {
    const prefix = locale === routing.defaultLocale ? '' : `/${locale}`
    switch (body.entity) {
      case 'product':
        // The same product shows up in three places: its own detail page, the
        // /products listing grid, and the home page (signature bouquets). Refresh
        // all three so none of them keeps showing the old version.
        return [`${prefix}/products/${body.id}`, `${prefix}/products`, prefix || '/']
      case 'productList':
        return [`${prefix}/products`, prefix || '/']
      case 'news':
        return [`${prefix}/news/${body.slug}`, `${prefix}/news`]
      case 'newsList':
        return [`${prefix}/news`]
      case 'home':
        return [prefix || '/']
    }
  })
}

// Which entities actually change product data. These are the ones that need the
// shared product cache purged (see below), not just the page HTML rebuilt.
const touchesProductData = (entity: z.infer<typeof EntityBodySchema>['entity']) =>
  entity === 'product' || entity === 'productList' || entity === 'home'

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

  // revalidatePath above rebuilds the HTML, but the product data has its own cache
  // layer (unstable_cache, tagged 'products'). If we don't clear that too, the
  // rebuilt page can just re-read the stale products. The tag isn't language-
  // specific, so one purge covers both vi and en.
  const tags: string[] = []
  if (touchesProductData(parsed.data.entity)) {
    // Next 16's revalidateTag takes a second arg for how long stale data may still
    // be served; 'max' is the documented drop-in for the old immediate purge.
    // (updateTag would read cleaner but only works inside Server Actions, not here.)
    revalidateTag(PRODUCTS_CACHE_TAG, 'max')
    tags.push(PRODUCTS_CACHE_TAG)
  }

  return Response.json({ revalidated: true, paths, tags })
}
