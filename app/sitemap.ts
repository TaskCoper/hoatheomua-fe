import { getAllArticleSlugs } from '@/features/articles/queries.server'
import { getAllFeaturedIds } from '@/features/featured/queries.server'
import { getAllMainlineIds } from '@/features/mainline/queries.server'
import { getAllOccasionIds } from '@/features/occasions/queries.server'
import { getAllProductIdsForSitemap } from '@/features/products/queries.server'
import { getAllJobSlugs } from '@/features/recruitment/queries.server'
import { WOMEN_DAY_PATH } from '@/features/women-day-20-10/constants'
import { routing, type Locale } from '@/lib/i18n/routing'
import { SITE_URL } from '@/shared/seo'
import type { MetadataRoute } from 'next'

type ChangeFrequency = MetadataRoute.Sitemap[number]['changeFrequency']

const PUBLIC_PATHS = [
  { path: '/', priority: 1, changeFrequency: 'daily' },
  { path: '/products', priority: 0.9, changeFrequency: 'daily' },
  { path: '/news', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/about', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/b2b', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.7, changeFrequency: 'monthly' },
  { path: WOMEN_DAY_PATH, priority: 0.7, changeFrequency: 'weekly' },
  { path: '/recruitment', priority: 0.6, changeFrequency: 'weekly' }
] as const satisfies ReadonlyArray<{ path: string; priority: number; changeFrequency: ChangeFrequency }>

const localePath = (locale: Locale, path: string) => (locale === routing.defaultLocale ? path : `/${locale}${path}`)

/**
 * One entry per locale for a single path, each carrying the full `hreflang` set.
 * Every group below is the same shape, so it lives here once.
 */
const localizedEntries = (
  paths: string[],
  {
    priority,
    changeFrequency,
    lastModified
  }: { priority: number; changeFrequency: ChangeFrequency; lastModified: Date }
): MetadataRoute.Sitemap =>
  paths.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: `${SITE_URL}${localePath(locale, path)}`,
      lastModified,
      changeFrequency,
      priority,
      alternates: {
        languages: Object.fromEntries(routing.locales.map((l) => [l, `${SITE_URL}${localePath(l, path)}`]))
      }
    }))
  )

/**
 * Sitemaps cap at 50,000 URLs / 50MB. Total here is
 * `(products + articles + jobs + landing pages + static) x 2 locales`; at a few
 * thousand products that lands comfortably inside one file. If the catalogue
 * ever pushes past ~20,000 URLs, split this with `generateSitemaps()` and serve
 * a sitemap index - not before, since the index adds a moving part for nothing.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // Independent upstream reads - none of them depends on another, so a serial
  // await chain here would be pure added latency on a cold sitemap.
  const [productIds, articleSlugs, jobSlugs, occasionIds, featuredIds, mainlineIds] = await Promise.all([
    getAllProductIdsForSitemap(),
    getAllArticleSlugs(),
    getAllJobSlugs(),
    getAllOccasionIds(),
    getAllFeaturedIds(),
    getAllMainlineIds()
  ])

  return [
    ...PUBLIC_PATHS.flatMap(({ path, priority, changeFrequency }) =>
      localizedEntries([path], { priority, changeFrequency, lastModified: now })
    ),

    // The catalogue - the site's largest and most valuable crawl surface, and
    // the one this sitemap previously omitted entirely.
    ...localizedEntries(
      productIds.map((id) => `/products/${id}`),
      { priority: 0.8, changeFrequency: 'daily', lastModified: now }
    ),

    // Config-driven collection landing pages (prebuilt via generateStaticParams).
    ...localizedEntries(
      [
        ...occasionIds.map((id) => `/occasions/${id}`),
        ...featuredIds.map((id) => `/featured/${id}`),
        ...mainlineIds.map((id) => `/mainline/${id}`)
      ],
      { priority: 0.7, changeFrequency: 'weekly', lastModified: now }
    ),

    ...localizedEntries(
      articleSlugs.map((slug) => `/news/${slug}`),
      { priority: 0.6, changeFrequency: 'monthly', lastModified: now }
    ),

    ...localizedEntries(
      jobSlugs.map((slug) => `/recruitment/${slug}`),
      { priority: 0.5, changeFrequency: 'weekly', lastModified: now }
    )
  ]
}
