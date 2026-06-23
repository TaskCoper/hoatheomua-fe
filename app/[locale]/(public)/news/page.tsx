import {
  buildNewsInfiniteKey,
  NEWS_INFINITE_DEFAULT_PAGE_SIZE
} from '@/features/news/hooks/use-get-news-infinite'
import type { Locale } from '@/lib/i18n/routing'
import { fetchNewsPage, type NewsItem, type NewsPageResult } from '@/lib/news'
import { dehydrate, HydrationBoundary, QueryClient, type InfiniteData } from '@tanstack/react-query'
import type { Metadata } from 'next'
import NewsContent from './_components/news-content'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hoatheomua.net'
const DEFAULT_NEWS_OG_IMAGE = `${SITE_URL}/images/bg-news-1.png`

const NEWS_META: Record<
  Locale,
  { title: string; description: string; keywords: string[]; ogLocale: string; ogAlt: string }
> = {
  vi: {
    title: 'Tin Tức & Cảm Hứng Hoa',
    description:
      'Cập nhật tin tức, mẹo chăm hoa và cảm hứng cắm hoa theo mùa từ Hoa Theo Mùa — từ bí quyết giữ hoa tươi lâu, ý tưởng decor đến những câu chuyện đẹp về 12 mùa hoa Hà Nội.',
    keywords: [
      'tin tức hoa tươi',
      'cách chăm sóc hoa',
      'mẹo cắm hoa',
      'cảm hứng hoa theo mùa',
      'blog hoa Hoa Theo Mùa',
      'ý tưởng decor hoa',
      '12 mùa hoa Hà Nội',
      'cẩm nang hoa tươi'
    ],
    ogLocale: 'vi_VN',
    ogAlt: 'Tin tức và cảm hứng hoa từ Hoa Theo Mùa'
  },
  en: {
    title: 'Flower Stories & Inspiration',
    description:
      'Seasonal flower stories, care tips and arrangement ideas from Hoa Theo Mùa — keep blooms fresh longer, find decor inspiration and explore the 12 flower seasons of Hanoi.',
    keywords: [
      'flower news',
      'flower care tips',
      'flower arrangement ideas',
      'seasonal flower inspiration',
      'Hoa Theo Mùa blog',
      'floral decor ideas',
      'Hanoi flower seasons',
      'florist journal Vietnam'
    ],
    ogLocale: 'en_US',
    ogAlt: 'Hoa Theo Mùa — Flower stories and inspiration'
  }
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params
  const meta = NEWS_META[locale] ?? NEWS_META.vi
  const path = locale === 'vi' ? '/news' : '/en/news'

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    alternates: {
      canonical: path,
      languages: {
        vi: '/news',
        en: '/en/news',
        'x-default': '/news'
      }
    },
    openGraph: {
      type: 'website',
      siteName: 'Hoa Theo Mùa',
      title: meta.title,
      description: meta.description,
      url: path,
      locale: meta.ogLocale,
      alternateLocale: locale === 'vi' ? ['en_US'] : ['vi_VN'],
      images: [
        {
          url: '/images/bg-news-1.png',
          width: 1200,
          height: 630,
          alt: meta.ogAlt
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      images: ['/images/bg-news-1.png']
    }
  }
}

const newsUrl = (locale: Locale, slug: string) =>
  locale === 'vi' ? `${SITE_URL}/news/${slug}` : `${SITE_URL}/en/news/${slug}`

const buildNewsJsonLd = (locale: Locale, items: NewsItem[]) => {
  const meta = NEWS_META[locale] ?? NEWS_META.vi
  const path = locale === 'vi' ? '/news' : '/en/news'
  const inLanguage = locale === 'vi' ? 'vi-VN' : 'en-US'

  const itemList =
    items.length > 0
      ? {
          '@type': 'ItemList',
          '@id': `${SITE_URL}${path}#itemlist`,
          numberOfItems: items.length,
          itemListElement: items.map((article, index) => {
            const url = newsUrl(locale, article.slug)
            const image = article.pictureUrl || DEFAULT_NEWS_OG_IMAGE

            return {
              '@type': 'ListItem',
              position: index + 1,
              url,
              item: {
                '@type': 'NewsArticle',
                '@id': `${url}#article`,
                url,
                mainEntityOfPage: url,
                headline: article.title,
                description: article.summary,
                image,
                datePublished: article.publishedAt,
                inLanguage,
                author: { '@type': 'Person', name: article.author },
                publisher: { '@id': `${SITE_URL}/#organization` },
                ...(article.tags && article.tags.length > 0 ? { keywords: article.tags.join(', ') } : {})
              }
            }
          })
        }
      : null

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${SITE_URL}${path}#webpage`,
        url: `${SITE_URL}${path}`,
        name: `${meta.title} — Hoa Theo Mùa`,
        description: meta.description,
        inLanguage,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@id': `${SITE_URL}/#organization` },
        primaryImageOfPage: { '@type': 'ImageObject', url: DEFAULT_NEWS_OG_IMAGE },
        ...(itemList ? { mainEntity: { '@id': `${SITE_URL}${path}#itemlist` } } : {})
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${SITE_URL}${path}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: locale === 'vi' ? 'Trang chủ' : 'Home',
            item: `${SITE_URL}/`
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: locale === 'vi' ? 'Tin tức' : 'News',
            item: `${SITE_URL}${path}`
          }
        ]
      },
      ...(itemList ? [itemList] : [])
    ]
  }
}

export default async function NewsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const queryClient = new QueryClient()
  const queryKey = buildNewsInfiniteKey({ pageSize: NEWS_INFINITE_DEFAULT_PAGE_SIZE })

  try {
    await queryClient.prefetchInfiniteQuery({
      queryKey,
      queryFn: ({ pageParam }) => fetchNewsPage(pageParam as number, NEWS_INFINITE_DEFAULT_PAGE_SIZE),
      initialPageParam: 1,
      getNextPageParam: (lastPage: NewsPageResult) =>
        lastPage.hasNextPage ? lastPage.pageIndex + 1 : undefined,
      pages: 1
    })
  } catch (error) {
    console.error('[SSR] news list prefetch failed:', error)
  }

  const cached = queryClient.getQueryData<InfiniteData<NewsPageResult, number>>(queryKey)
  const initialNews = cached?.pages.flatMap((page) => page.items) ?? []

  const jsonLd = buildNewsJsonLd(locale, initialNews)

  return (
    <>
      <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <NewsContent locale={locale} />
      </HydrationBoundary>
    </>
  )
}
