import { ARTICLES_CACHE_TAG } from '@/features/articles/queries.server'
import { CATEGORIES_CACHE_TAG } from '@/features/categories/queries.server'
import { PRODUCTS_CACHE_TAG } from '@/features/products/queries.server'
import { RECRUITMENT_CACHE_TAG } from '@/features/recruitment/queries.server'
import { routing } from '@/lib/i18n/routing'
import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'

/**
 * On-demand revalidation webhook.
 *
 * The storefront caches backend data in two layers:
 *   1. `'use cache'` wraps every backend read, tagged via `cacheTag`
 *      (e.g. `products`, `articles`, `configs:products`) with lifetimes from
 *      `lib/cache-life.ts`.
 *
 *      KNOWN LIMITATION on Vercel: with no `cacheHandlers.default` configured,
 *      `'use cache'` resolves to Next's in-memory `DefaultCacheHandler`, whose
 *      LRU *and* tags manifest are per-process. `revalidateTag` below therefore
 *      only purges the instance that happens to serve this webhook; other warm
 *      instances keep their own copy until `cacheLife.revalidate` expires. This
 *      is why `revalidatePath` (step 2) is the load-bearing half of the purge -
 *      it goes through the shared route cache, so the rebuilt HTML is correct
 *      even when a sibling instance still holds a stale data entry.
 *      Cache entries also do not survive a deploy: the cache key includes the
 *      build id.
 *      The fix, when it is worth the cost, is a shared handler - either
 *      `'use cache: remote'` (needs `cacheComponents: true`, which currently
 *      conflicts with every `revalidate`/`dynamicParams` route export) or a
 *      custom `cacheHandlers.default`. Required either way when self-hosting
 *      behind more than one instance.
 *   2. Route-segment **ISR** caches the rendered HTML of each page.
 * A real content change must purge BOTH: the tag (so the next render reads fresh
 * data) and the page paths (so the cached HTML is rebuilt). Each admin mutation
 * therefore maps to a set of `tags` + a set of `paths` — see `planForEntity`.
 *
 * Authentication: `x-revalidate-secret` header must match `REVALIDATE_SECRET`.
 * The endpoint rejects everything if the env var is unset.
 *
 * Body: { entity, ...fields } - see EntityBodySchema below for the contract.
 * Each path expands to one `revalidatePath(...)` call per supported locale
 * (vi + en), so a single webhook call refreshes both language variants.
 *
 * Returns { revalidated: true, paths, routePatterns, tags } on success, or a 4xx
 * with a reason.
 *
 * curl example:
 *   curl -X POST $SITE/api/revalidate \
 *     -H "x-revalidate-secret: $REVALIDATE_SECRET" \
 *     -H "content-type: application/json" \
 *     -d '{"entity":"product","id":"12345"}'
 */

// A single product changed (price/stock/pin/order/POS sync). `id` is the
// storefront product id used in the /products/{id} URL.
const ProductBody = z.object({ entity: z.literal('product'), id: z.string().min(1) })
// Catalog-wide product change (bulk sync, mass price/stock edit) not tied to one
// detail page.
const ProductListBody = z.object({ entity: z.literal('productList') })
// A product category changed (create/update/delete/reorder, or product↔category
// assignment). Also covers "campaign"/occasion categories.
const CategoryBody = z.object({ entity: z.literal('category') })
// A news article changed. `slug` is the article's public slug used in the
// /news/{slug} URL (NOT the admin's numeric id). It is optional on purpose: an
// admin that posts its numeric id instead still gets the `articles` tag purged
// (so every article re-reads fresh within the 30s ISR window) rather than being
// rejected outright with `invalid-body`, which would purge nothing for an hour.
const NewsBody = z.object({ entity: z.literal('news'), slug: z.string().min(1).optional() })
// News-list-wide change (new/deleted article, blog taxonomy edit) that should
// refresh the listing but isn't tied to one article's page.
const NewsListBody = z.object({ entity: z.literal('newsList') })
// A public config (home content) changed. `group` is the config group name
// (products, banners, feedbacks, company, contact, b2bServices, ...). `key` is
// optional and informational.
const ConfigBody = z.object({
  entity: z.literal('config'),
  group: z.string().min(1),
  key: z.string().min(1).optional()
})
// A recruitment job description changed. `slug` optionally targets the detail
// page; omit it for list-wide changes.
const RecruitmentBody = z.object({ entity: z.literal('recruitment'), slug: z.string().min(1).optional() })
// The company address changed (shown on the contact page + JSON-LD).
const CompanyAddressBody = z.object({ entity: z.literal('companyAddress') })
// Manual "refresh the home page" escape hatch.
const HomeBody = z.object({ entity: z.literal('home') })

const EntityBodySchema = z.discriminatedUnion('entity', [
  ProductBody,
  ProductListBody,
  CategoryBody,
  NewsBody,
  NewsListBody,
  ConfigBody,
  RecruitmentBody,
  CompanyAddressBody,
  HomeBody
])

type EntityBody = z.infer<typeof EntityBodySchema>

// Cache tag for the config group. Mirrors `configs:${group}` produced inside the
// public-configs / featured / mainline / occasions / company query loaders.
const configTag = (group: string) => `configs:${group}`

// Which storefront pages a config group is baked into. A group not listed here
// only needs its data tag purged (e.g. `ahamove`, which feeds the dynamic,
// non-ISR checkout). Paths are locale-agnostic bases; `expandPaths` adds the
// per-locale prefix.
const CONFIG_GROUP_PATHS: Record<string, string[]> = {
  // products.occasions / .featured / .mainline / .signature — the collection
  // cards shown on the home page nav and the /products page.
  products: ['/', '/products'],
  // The banner collection is prefetched in the `(public)` layout and dehydrated
  // into every page beneath it, so a banner edit is not a home-only change:
  // /products renders `BANNER_SLOTS.products` and each product detail page
  // renders `BANNER_SLOTS.product` (see CONFIG_GROUP_ROUTE_PATTERNS).
  banners: ['/', '/products'],
  feedbacks: ['/'],
  company: ['/', '/contact'],
  contact: ['/contact', '/b2b'],
  b2bServices: ['/b2b']
}

// Route *patterns* (as opposed to concrete paths) a config group is baked into.
// `revalidatePath(pattern, 'page')` purges every generated entry of a dynamic
// route in one call, which is the only way to reach an unbounded id set. These
// deliberately bypass `expandPaths`: `[locale]` is a real route segment, so the
// single pattern already covers vi + en - prefixing it would yield the
// nonexistent `/vi/[locale]/products/[id]`.
const PRODUCT_DETAIL_ROUTE = '/[locale]/products/[id]'

const CONFIG_GROUP_ROUTE_PATTERNS: Record<string, string[]> = {
  // `products.signature` decides whether a detail page links out to a dedicated
  // signature landing page - read server-side in products/[id]/page.tsx.
  products: [PRODUCT_DETAIL_ROUTE],
  banners: [PRODUCT_DETAIL_ROUTE]
}

/**
 * Maps one admin mutation to the cache tags to purge and the (locale-agnostic)
 * page paths to rebuild. See docs/revalidate-webhook.vi.md for the full contract.
 *
 * `routePatterns` is the dynamic-route escape hatch - see
 * CONFIG_GROUP_ROUTE_PATTERNS. It is left off entities that already name their
 * one affected detail page concretely (product, news, recruitment).
 */
const planForEntity = (body: EntityBody): { basePaths: string[]; tags: string[]; routePatterns?: string[] } => {
  switch (body.entity) {
    case 'product':
      // Shows up on its own detail page, the /products grid, and the home page.
      // The occasions/featured/mainline detail grids also show products; the
      // `products` tag purge freshens their data on the next render, and their
      // short (5 min) ISR rebuilds the HTML.
      return { basePaths: [`/products/${body.id}`, '/products', '/'], tags: [PRODUCTS_CACHE_TAG] }
    case 'productList':
      return { basePaths: ['/products', '/'], tags: [PRODUCTS_CACHE_TAG] }
    case 'category':
      // Category membership drives which products appear in each grid, so purge
      // both the category tree and the product lists.
      return { basePaths: ['/products', '/'], tags: [CATEGORIES_CACHE_TAG, PRODUCTS_CACHE_TAG] }
    case 'news':
      return {
        basePaths: body.slug ? [`/news/${body.slug}`, '/news'] : ['/news'],
        tags: [ARTICLES_CACHE_TAG]
      }
    case 'newsList':
      return { basePaths: ['/news'], tags: [ARTICLES_CACHE_TAG] }
    case 'config':
      return {
        basePaths: CONFIG_GROUP_PATHS[body.group] ?? [],
        routePatterns: CONFIG_GROUP_ROUTE_PATTERNS[body.group] ?? [],
        tags: [configTag(body.group)]
      }
    case 'recruitment':
      // With a slug, purge that job's detail data (+ its ISR HTML) via the
      // per-slug tag; without one it's a list-wide change, so the broad tag only.
      return {
        basePaths: body.slug ? [`/recruitment/${body.slug}`, '/recruitment'] : ['/recruitment'],
        tags: [RECRUITMENT_CACHE_TAG]
      }
    case 'companyAddress':
      return { basePaths: ['/contact'], tags: ['company-address'] }
    case 'home':
      // Escape hatch: the home page renders products, category sections, and the
      // config-driven collection cards — refresh all of them.
      return { basePaths: ['/'], tags: [PRODUCTS_CACHE_TAG, CATEGORIES_CACHE_TAG, configTag('products')] }
  }
}

const expandPaths = (basePaths: string[]): string[] => {
  const paths = routing.locales.flatMap((locale) =>
    basePaths.map((base) => (base === '/' ? `/${locale}` : `/${locale}${base}`))
  )
  // Under `localePrefix: 'as-needed'` the default locale is served without a
  // prefix, so its Full Route Cache entry can be keyed by the bare request path
  // (e.g. `/news/<slug>`). Purge that variant too — a no-op where unmatched.
  const defaultLocalePaths = basePaths
  return Array.from(new Set([...paths, ...defaultLocalePaths]))
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

  console.log('JSON: ', json)

  const parsed = EntityBodySchema.safeParse(json)
  if (!parsed.success) {
    return Response.json({ revalidated: false, reason: 'invalid-body', issues: parsed.error.issues }, { status: 400 })
  }

  const { basePaths, tags, routePatterns = [] } = planForEntity(parsed.data)

  const paths = expandPaths(basePaths)
  for (const path of paths) {
    revalidatePath(path)
  }

  // Not locale-expanded on purpose - `[locale]` is part of the pattern itself.
  // `'page'` is required: without it Next treats the literal `[locale]` string
  // as a path segment and the purge silently matches nothing.
  for (const pattern of routePatterns) {
    revalidatePath(pattern, 'page')
  }

  for (const tag of tags) {
    revalidateTag(tag, { expire: 0 })
  }

  console.log('basePaths: ', basePaths)
  console.log('routePatterns: ', routePatterns)
  console.log('tags: ', tags)

  return Response.json({ revalidated: true, paths, routePatterns, tags })
}
