import { getAllJobSlugs } from '@/features/recruitment/queries.server'
import { routing, type Locale } from '@/lib/i18n/routing'
import { SITE_URL } from '@/shared/seo'
import type { MetadataRoute } from 'next'

const PUBLIC_PATHS = [
  { path: '/', priority: 1, changeFrequency: 'daily' },
  { path: '/products', priority: 0.9, changeFrequency: 'daily' },
  { path: '/news', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/about', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/b2b', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/recruitment', priority: 0.6, changeFrequency: 'weekly' }
] as const satisfies ReadonlyArray<{
  path: string
  priority: number
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
}>

const localePath = (locale: Locale, path: string) => (locale === routing.defaultLocale ? path : `/${locale}${path}`)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticEntries: MetadataRoute.Sitemap = PUBLIC_PATHS.flatMap(({ path, priority, changeFrequency }) =>
    routing.locales.map((locale) => ({
      url: `${SITE_URL}${localePath(locale, path)}`,
      lastModified: now,
      changeFrequency,
      priority,
      alternates: {
        languages: Object.fromEntries(routing.locales.map((l) => [l, `${SITE_URL}${localePath(l, path)}`]))
      }
    }))
  )

  // Every job gets its own indexable URL so crawlers find roles beyond the list's
  // first page (the list only server-renders page 1). Best-effort — if the fetch
  // fails, the static entries above still ship.
  const jobSlugs = await getAllJobSlugs()
  const jobEntries: MetadataRoute.Sitemap = jobSlugs.flatMap((slug) =>
    routing.locales.map((locale) => ({
      url: `${SITE_URL}${localePath(locale, `/recruitment/${slug}`)}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [l, `${SITE_URL}${localePath(l, `/recruitment/${slug}`)}`])
        )
      }
    }))
  )

  return [...staticEntries, ...jobEntries]
}
