import type { Locale } from '@/lib/i18n/routing'
import { buildPageMetadata, DEFAULT_OG_IMAGE_DIMENSIONS } from '@/shared/seo'
import { getFirstParagraphTextFromHtml } from '@/shared/utils'
import type { Metadata } from 'next'
import { Article } from '../types'
import { NEWS_BASE_PATH, NEWS_LIST_COPY, NEWS_OG_IMAGE_PATH } from './config'

export const generateNewsListMetadata = (locale: Locale): Metadata => {
  const copy = NEWS_LIST_COPY[locale]

  return buildPageMetadata({
    locale,
    copy,
    basePath: NEWS_BASE_PATH,
    ogImage: {
      url: NEWS_OG_IMAGE_PATH,
      width: DEFAULT_OG_IMAGE_DIMENSIONS.width,
      height: DEFAULT_OG_IMAGE_DIMENSIONS.height,
      alt: copy.ogAlt ?? copy.title
    }
  })
}

type GenerateNewsDetailMetadataInput = {
  locale: Locale
  slug: string
  article: Article | null
  notFoundTitle: string
  titleSuffix: string
}

export const generateNewsDetailMetadata = ({
  locale,
  slug,
  article,
  notFoundTitle,
  titleSuffix
}: GenerateNewsDetailMetadataInput): Metadata => {
  if (!article) {
    return { title: notFoundTitle, robots: { index: false, follow: true } }
  }

  const ogImage = article.pictureUrl
    ? { url: article.pictureUrl, alt: article.title }
    : {
        url: NEWS_OG_IMAGE_PATH,
        width: DEFAULT_OG_IMAGE_DIMENSIONS.width,
        height: DEFAULT_OG_IMAGE_DIMENSIONS.height,
        alt: article.title
      }

  const base = buildPageMetadata({
    locale,
    copy: {
      title: `${article.title}${titleSuffix}`,
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
