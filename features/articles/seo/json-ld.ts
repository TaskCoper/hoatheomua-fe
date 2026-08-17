import type { Locale } from '@/lib/i18n/routing'
import { decodeImageViewport } from '@/lib/image-viewport'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { buildBreadcrumbList, inLanguage, ORGANIZATION_ID, SITE_URL, WEBSITE_ID } from '@/shared/seo'
import { getFirstParagraphTextFromHtml } from '@/shared/utils'
import { Article } from '../types'
import { NEWS_LIST_COPY, NEWS_OG_IMAGE_URL } from './config'
import { getNewsItemUrl, getNewsListPath, getNewsListUrl } from './url'

const newsArticleEntity = (locale: Locale, article: Article) => {
  const url = getNewsItemUrl(locale, article.slug)
  return {
    '@type': 'NewsArticle' as const,
    '@id': `${url}#article`,
    url,
    mainEntityOfPage: url,
    headline: article.title,
    description: getFirstParagraphTextFromHtml(article.description),
    image: decodeImageViewport(article.pictureUrl).src || NEWS_OG_IMAGE_URL,
    datePublished: article.createdAt,
    inLanguage: inLanguage(locale),
    author: { '@type': 'Person', name: article.user.userFullName },
    publisher: { '@id': ORGANIZATION_ID },
    ...(article.categories && article.categories.length > 0
      ? { keywords: article.categories.map((cat) => cat.categoryName).join(', ') }
      : {})
  }
}

export const buildNewsCollectionJsonLd = (locale: Locale, items: Article[], pageIndex: number = DEFAULT_PAGE_INDEX) => {
  const copy = NEWS_LIST_COPY[locale]
  const isFirstPage = pageIndex <= DEFAULT_PAGE_INDEX
  // Page 2+ is its own indexable URL, so its graph must describe `?page=N`
  // rather than re-declaring the page-1 entity under a different address.
  const query = isFirstPage ? '' : `?page=${pageIndex}`
  const path = `${getNewsListPath(locale)}${query}`
  const url = `${getNewsListUrl(locale)}${query}`
  const listUrl = getNewsListUrl(locale)
  const breadcrumb = buildBreadcrumbList(locale, `${SITE_URL}${path}#breadcrumb`, [
    { name: copy.breadcrumb, url: listUrl }
  ])

  // Positions continue across pages (page 2 starts at 11), so the list reads as
  // one ranked archive instead of N lists that all start at 1.
  const startPosition = (pageIndex - DEFAULT_PAGE_INDEX) * DEFAULT_PAGE_SIZE

  const itemList =
    items.length > 0
      ? {
          '@type': 'ItemList' as const,
          '@id': `${SITE_URL}${path}#itemlist`,
          numberOfItems: items.length,
          itemListElement: items.map((article, index) => ({
            '@type': 'ListItem' as const,
            position: startPosition + index + 1,
            url: getNewsItemUrl(locale, article.slug),
            item: newsArticleEntity(locale, article)
          }))
        }
      : null

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${SITE_URL}${path}#webpage`,
        url,
        name: isFirstPage ? `${copy.title} - Hoa Theo Mùa` : `${copy.title} - ${copy.pageLabel} ${pageIndex}`,
        description: copy.description,
        inLanguage: inLanguage(locale),
        isPartOf: { '@id': WEBSITE_ID },
        about: { '@id': ORGANIZATION_ID },
        primaryImageOfPage: { '@type': 'ImageObject', url: NEWS_OG_IMAGE_URL },
        ...(itemList ? { mainEntity: { '@id': `${SITE_URL}${path}#itemlist` } } : {})
      },
      breadcrumb,
      ...(itemList ? [itemList] : [])
    ]
  }
}

export const buildNewsArticleJsonLd = (locale: Locale, article: Article) => {
  const copy = NEWS_LIST_COPY[locale]
  const articleUrl = getNewsItemUrl(locale, article.slug)
  const listUrl = getNewsListUrl(locale)
  const breadcrumbId = `${SITE_URL}${getNewsListPath(locale)}/${article.slug}#breadcrumb`

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        ...newsArticleEntity(locale, article),
        dateModified: article.createdAt,
        articleSection: article.categories.map((cat) => cat.categoryName).join(', '),
        isPartOf: { '@id': WEBSITE_ID }
      },
      buildBreadcrumbList(locale, breadcrumbId, [
        { name: copy.breadcrumb, url: listUrl },
        { name: article.title, url: articleUrl }
      ])
    ]
  }
}
