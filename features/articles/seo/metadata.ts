import type { Locale } from '@/lib/i18n/routing'
import { decodeImageViewport } from '@/lib/image-viewport'
import { DEFAULT_PAGE_INDEX } from '@/shared/constants'
import { buildPageMetadata, DEFAULT_OG_IMAGE_DIMENSIONS, localePath } from '@/shared/seo'
import { getFirstParagraphTextFromHtml } from '@/shared/utils'
import type { Metadata } from 'next'
import { Article } from '../types'
import { NEWS_BASE_PATH, NEWS_LIST_COPY, NEWS_OG_IMAGE_PATH } from './config'

export const generateNewsListMetadata = (locale: Locale, pageIndex: number = DEFAULT_PAGE_INDEX): Metadata => {
  const copy = NEWS_LIST_COPY[locale]
  const isFirstPage = pageIndex <= DEFAULT_PAGE_INDEX
  const suffix = `${copy.pageLabel} ${pageIndex}`

  const base = buildPageMetadata({
    locale,
    copy: isFirstPage ? copy : { ...copy, title: `${copy.title} - ${suffix}` },
    basePath: NEWS_BASE_PATH,
    ogImage: {
      url: NEWS_OG_IMAGE_PATH,
      width: DEFAULT_OG_IMAGE_DIMENSIONS.width,
      height: DEFAULT_OG_IMAGE_DIMENSIONS.height,
      alt: copy.ogAlt ?? copy.title
    }
  })

  if (isFirstPage) return base

  const query = `?page=${pageIndex}`

  return {
    ...base,
    alternates: {
      canonical: `${localePath(locale, NEWS_BASE_PATH)}${query}`,
      languages: {
        vi: `${NEWS_BASE_PATH}${query}`,
        en: `/en${NEWS_BASE_PATH}${query}`
      }
    }
  }
}

type GenerateNewsDetailMetadataInput = {
  locale: Locale
  slug: string
  article: Article | null
  notFoundTitle: string
}

export const generateNewsDetailMetadata = ({
  locale,
  slug,
  article,
  notFoundTitle
}: GenerateNewsDetailMetadataInput): Metadata => {
  if (!article) {
    return { title: notFoundTitle, robots: { index: false, follow: true } }
  }

  const ogImage = article.pictureUrl
    ? { url: decodeImageViewport(article.pictureUrl).src, alt: article.title }
    : {
        url: NEWS_OG_IMAGE_PATH,
        width: DEFAULT_OG_IMAGE_DIMENSIONS.width,
        height: DEFAULT_OG_IMAGE_DIMENSIONS.height,
        alt: article.title
      }

  const base = buildPageMetadata({
    locale,
    copy: {
      title: article.title,
      description: getFirstParagraphTextFromHtml(article.description),
      keywords: article.categories.map((cat) => cat.categoryName)
    },
    basePath: `${NEWS_BASE_PATH}/${slug}`,
    ogType: 'article',
    ogImage
  })

  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      type: 'article',
      publishedTime: article.createdAt,
      authors: [article.user.userFullName],
      tags: article.categories.map((cat) => cat.categoryName)
    }
  }
}
