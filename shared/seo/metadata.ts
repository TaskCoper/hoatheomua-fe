import type { Locale } from '@/lib/i18n/routing'
import type { Metadata } from 'next'
import { alternateOgLocales, DEFAULT_OG_IMAGE, DEFAULT_OG_IMAGE_DIMENSIONS, ogLocale, SITE_NAME } from './constants'
import type { OgImage, SeoCopy } from './types'
import { localePath } from './url'

export type BuildPageMetadataInput = {
  locale: Locale
  copy: SeoCopy
  /** Path within the site, locale-agnostic, e.g. `/about`. */
  basePath: string
  /** Override the OG image; defaults to the site-wide `DEFAULT_OG_IMAGE`. */
  ogImage?: OgImage
  /**
   * `openGraph.type`. Defaults to `'website'`. Use `'article'` for news details.
   */
  ogType?: 'website' | 'article'
  /** Additional fields merged on top (e.g. `category`, `robots`). */
  extras?: Partial<Metadata>
}

/**
 * Canonical `Metadata` builder for public pages. Handles:
 * - title / description / keywords from `copy`
 * - `alternates.canonical` to the locale-prefixed path
 * - `alternates.languages` with vi / en entries derived from `basePath`
 * - `openGraph` + `twitter` pointing at the same OG image
 */
export const buildPageMetadata = ({
  locale,
  copy,
  basePath,
  ogImage,
  ogType = 'website',
  extras
}: BuildPageMetadataInput): Metadata => {
  const path = localePath(locale, basePath)
  const image = ogImage ?? {
    url: DEFAULT_OG_IMAGE,
    width: DEFAULT_OG_IMAGE_DIMENSIONS.width,
    height: DEFAULT_OG_IMAGE_DIMENSIONS.height,
    alt: copy.ogAlt ?? copy.title
  }

  return {
    title: copy.title,
    description: copy.description,
    keywords: [...copy.keywords],
    alternates: {
      canonical: path,
      languages: {
        vi: basePath,
        en: `/en${basePath}`
      }
    },
    openGraph: {
      type: ogType,
      siteName: SITE_NAME,
      title: copy.title,
      description: copy.description,
      url: path,
      locale: ogLocale(locale),
      alternateLocale: alternateOgLocales(locale),
      images: [image]
    },
    twitter: {
      card: 'summary_large_image',
      title: copy.title,
      description: copy.description,
      images: [image.url]
    },
    ...extras
  }
}
