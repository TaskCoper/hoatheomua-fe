import { ARTICLES_CACHE_TAG } from '@/features/articles/queries.server'
import { CATEGORIES_CACHE_TAG } from '@/features/categories/queries.server'
import { PRODUCTS_CACHE_TAG } from '@/features/products/queries.server'
import { RECRUITMENT_CACHE_TAG } from '@/features/recruitment/queries.server'
import { routing } from '@/lib/i18n/routing'
import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'

/**
 * On-demand revalidation webhook. Auth: `x-revalidate-secret` must match
 * `REVALIDATE_SECRET`.
 *
 * A content change must purge both layers: the data cache tag (so the next
 * render reads fresh) and the ISR route cache (so the HTML is rebuilt). Each
 * entity maps to a set of tags + paths - see `planForEntity`. Paths are expanded
 * per locale, so one call refreshes vi + en.
 *
 * See docs/revalidate-webhook.vi.md for the full contract.
 */

// `id` is the storefront product id from /products/{id}. An array lets a bulk
// admin mutation purge every affected detail page in one call.
const ProductBody = z.object({
  entity: z.literal('product'),
  id: z.union([z.string().min(1), z.array(z.string().min(1)).min(1)])
})
const ProductListBody = z.object({ entity: z.literal('productList') })
const CategoryBody = z.object({ entity: z.literal('category') })
// `slug` is the article's public slug, not the admin's numeric id. Optional on
// purpose: an admin posting its numeric id still gets the `articles` tag purged
// instead of being rejected with `invalid-body`, which would purge nothing.
const NewsBody = z.object({ entity: z.literal('news'), slug: z.string().min(1).optional() })
const NewsListBody = z.object({ entity: z.literal('newsList') })
// `group` is the config group name (products, banners, feedbacks, company,
// contact, b2bServices, ...). `key` is informational.
const ConfigBody = z.object({
  entity: z.literal('config'),
  group: z.string().min(1),
  key: z.string().min(1).optional()
})
// `slug` targets the detail page; omit it for list-wide changes.
const RecruitmentBody = z.object({ entity: z.literal('recruitment'), slug: z.string().min(1).optional() })
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

// Mirrors the `configs:${group}` tag produced inside the config query loaders.
const configTag = (group: string) => `configs:${group}`

// Which storefront pages a config group is baked into. A group not listed here
// only needs its data tag purged (e.g. `ahamove`, which feeds the dynamic,
// non-ISR checkout). Bases are locale-agnostic; `expandPaths` adds the prefix.
const CONFIG_GROUP_PATHS: Record<string, string[]> = {
  products: ['/', '/products'],
  // Banners are prefetched in the `(public)` layout and dehydrated into every
  // page beneath it, so a banner edit is not a home-only change.
  banners: ['/', '/products'],
  feedbacks: ['/'],
  company: ['/', '/contact'],
  contact: ['/contact', '/b2b'],
  b2bServices: ['/b2b']
}

// `revalidatePath(pattern, 'page')` purges every generated entry of a dynamic
// route in one call - the only way to reach an unbounded id set. These bypass
// `expandPaths`: `[locale]` is a real route segment, so the single pattern
// already covers vi + en; prefixing would yield `/vi/[locale]/products/[id]`.
const PRODUCT_DETAIL_ROUTE = '/[locale]/products/[id]'

const CONFIG_GROUP_ROUTE_PATTERNS: Record<string, string[]> = {
  products: [PRODUCT_DETAIL_ROUTE],
  banners: [PRODUCT_DETAIL_ROUTE]
}

/**
 * Maps one admin mutation to the tags to purge and the locale-agnostic page
 * paths to rebuild. `routePatterns` is left off entities that already name
 * their one affected detail page concretely (product, news, recruitment).
 */
const planForEntity = (body: EntityBody): { basePaths: string[]; tags: string[]; routePatterns?: string[] } => {
  switch (body.entity) {
    case 'product': {
      const ids = Array.isArray(body.id) ? body.id : [body.id]

      return {
        basePaths: [...new Set(ids.map((id) => `/products/${id}`)), '/products', '/'],
        tags: [PRODUCTS_CACHE_TAG]
      }
    }
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
      return {
        basePaths: body.slug ? [`/recruitment/${body.slug}`, '/recruitment'] : ['/recruitment'],
        tags: [RECRUITMENT_CACHE_TAG]
      }
    case 'companyAddress':
      return { basePaths: ['/contact'], tags: ['company-address'] }
    case 'home':
      return { basePaths: ['/'], tags: [PRODUCTS_CACHE_TAG, CATEGORIES_CACHE_TAG, configTag('products')] }
  }
}

const expandPaths = (basePaths: string[]): string[] => {
  const paths = routing.locales.flatMap((locale) =>
    basePaths.map((base) => (base === '/' ? `/${locale}` : `/${locale}${base}`))
  )
  // Under `localePrefix: 'as-needed'` the default locale is served without a
  // prefix, so its Full Route Cache entry can be keyed by the bare request path
  // (e.g. `/news/<slug>`). Purge that variant too - a no-op where unmatched.
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
