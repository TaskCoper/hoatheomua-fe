import { ARTICLES_CACHE_TAG } from '@/features/articles/queries.server'
import { CATEGORIES_CACHE_TAG } from '@/features/categories/queries.server'
import { PRODUCTS_CACHE_TAG } from '@/features/products/queries.server'
import { RECRUITMENT_CACHE_TAG } from '@/features/recruitment/queries.server'
import { routing } from '@/lib/i18n/routing'
import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'

/**
 * On-demand revalidation webhook. Full contract: docs/revalidate-webhook.vi.md
 *
 * Two cache layers must both be purged per mutation: `revalidateTag` for the
 * `'use cache'` data reads, `revalidatePath` for the ISR'd page HTML — see
 * `planForEntity` for the entity → (tags, paths) mapping.
 *
 * curl -X POST $SITE/api/revalidate \
 *   -H "x-revalidate-secret: $REVALIDATE_SECRET" -H "content-type: application/json" \
 *   -d '{"entity":"product","id":"12345"}'
 */

// `id` is the storefront product id (/products/{id}), not an admin id.
const ProductBody = z.object({ entity: z.literal('product'), id: z.string().min(1) })
const ProductListBody = z.object({ entity: z.literal('productList') })
// Also covers "campaign"/occasion categories.
const CategoryBody = z.object({ entity: z.literal('category') })
// `slug` is the public slug (/news/{slug}), not the admin's numeric id.
const NewsBody = z.object({ entity: z.literal('news'), slug: z.string().min(1) })
const NewsListBody = z.object({ entity: z.literal('newsList') })
// `group` matches a CONFIG_GROUP_PATHS key; `key` is informational only.
const ConfigBody = z.object({
  entity: z.literal('config'),
  group: z.string().min(1),
  key: z.string().min(1).optional()
})
// `slug` omitted = list-wide change.
const RecruitmentBody = z.object({ entity: z.literal('recruitment'), slug: z.string().min(1).optional() })
const CompanyAddressBody = z.object({ entity: z.literal('companyAddress') })
// Manual escape hatch to refresh the home page.
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

// Mirrors `configs:${group}` produced by the public-configs/featured/mainline/
// occasions/company query loaders.
const configTag = (group: string) => `configs:${group}`

// Which pages bake in a given config group's data. A group not listed here
// (e.g. `ahamove`, feeding the dynamic checkout) only needs its tag purged.
const CONFIG_GROUP_PATHS: Record<string, string[]> = {
  products: ['/', '/products'],
  banners: ['/'],
  feedbacks: ['/'],
  company: ['/', '/contact'],
  contact: ['/contact', '/b2b'],
  b2bServices: ['/b2b']
}

/** Maps one admin mutation to the tags to purge and the (locale-agnostic) paths to rebuild. */
const planForEntity = (body: EntityBody): { basePaths: string[]; tags: string[] } => {
  switch (body.entity) {
    case 'product':
      // Home's occasions/featured/mainline grids also show products, but their
      // own short ISR window covers them once the `products` tag is purged.
      return { basePaths: [`/products/${body.id}`, '/products', '/'], tags: [PRODUCTS_CACHE_TAG] }
    case 'productList':
      return { basePaths: ['/products', '/'], tags: [PRODUCTS_CACHE_TAG] }
    case 'category':
      // Membership drives which products appear per grid — purge both.
      return { basePaths: ['/products', '/'], tags: [CATEGORIES_CACHE_TAG, PRODUCTS_CACHE_TAG] }
    case 'news':
      return { basePaths: [`/news/${body.slug}`, '/news'], tags: [ARTICLES_CACHE_TAG] }
    case 'newsList':
      return { basePaths: ['/news'], tags: [ARTICLES_CACHE_TAG] }
    case 'config':
      return { basePaths: CONFIG_GROUP_PATHS[body.group] ?? [], tags: [configTag(body.group)] }
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

/** Expands locale-agnostic base paths into concrete per-locale paths. */
const expandPaths = (basePaths: string[]): string[] => {
  const paths = routing.locales.flatMap((locale) => {
    const prefix = locale === routing.defaultLocale ? '' : `/${locale}`
    return basePaths.map((base) => (base === '/' ? prefix || '/' : `${prefix}${base}`))
  })
  return Array.from(new Set(paths))
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

  const { basePaths, tags } = planForEntity(parsed.data)

  const paths = expandPaths(basePaths)
  for (const path of paths) {
    revalidatePath(path, 'page')
  }

  for (const tag of tags) {
    revalidateTag(tag, { expire: 0 })
  }

  return Response.json({ revalidated: true, paths, tags })
}
