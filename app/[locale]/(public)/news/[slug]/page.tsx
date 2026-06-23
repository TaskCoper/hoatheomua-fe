import { FallingPetals } from '@/components/falling-petals'
import { Button } from '@/components/ui/button'
import { Link } from '@/lib/i18n/navigation'
import type { Locale } from '@/lib/i18n/routing'
import { fetchNewsItem, fetchNewsList, formatNewsDate, type NewsItem } from '@/lib/news'
import heroImage from '@/public/images/bg-news.png'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { cache } from 'react'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hoatheomua.net'
const DEFAULT_ARTICLE_OG_IMAGE = `${SITE_URL}/images/bg-news-1.png`

const articleUrl = (locale: Locale, slug: string) =>
  locale === 'vi' ? `${SITE_URL}/news/${slug}` : `${SITE_URL}/en/news/${slug}`

const articlePath = (locale: Locale, slug: string) => (locale === 'vi' ? `/news/${slug}` : `/en/news/${slug}`)

const safeFetchArticle = cache(async (slug: string) => {
  try {
    return await fetchNewsItem(slug)
  } catch {
    return null
  }
})

const buildNewsItemQueryKey = (slug: string) => ['news', 'item', slug] as const

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: Locale; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const article = await safeFetchArticle(slug)
  const t = await getTranslations()

  if (!article) {
    return { title: t('news.notFoundTitle') ?? 'Article not found' }
  }

  const url = articleUrl(locale, slug)
  const path = articlePath(locale, slug)
  const ogImage = article.pictureUrl || DEFAULT_ARTICLE_OG_IMAGE
  const ogLocale = locale === 'vi' ? 'vi_VN' : 'en_US'

  return {
    title: `${article.title}${t('news.titleSuffix')}`,
    description: article.summary,
    alternates: {
      canonical: path,
      languages: {
        vi: `/news/${slug}`,
        en: `/en/news/${slug}`,
        'x-default': `/news/${slug}`
      }
    },
    openGraph: {
      type: 'article',
      siteName: 'Hoa Theo Mùa',
      title: article.title,
      description: article.summary,
      url,
      locale: ogLocale,
      alternateLocale: locale === 'vi' ? ['en_US'] : ['vi_VN'],
      publishedTime: article.publishedAt,
      authors: [article.author],
      tags: article.tags,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: article.title
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.summary,
      images: [ogImage]
    }
  }
}

const buildArticleJsonLd = (locale: Locale, article: NewsItem) => {
  const url = articleUrl(locale, article.slug)
  const path = articlePath(locale, article.slug)
  const inLanguage = locale === 'vi' ? 'vi-VN' : 'en-US'
  const image = article.pictureUrl || DEFAULT_ARTICLE_OG_IMAGE

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'NewsArticle',
        '@id': `${url}#article`,
        url,
        mainEntityOfPage: url,
        headline: article.title,
        description: article.summary,
        image,
        datePublished: article.publishedAt,
        dateModified: article.publishedAt,
        inLanguage,
        articleSection: article.category,
        author: { '@type': 'Person', name: article.author },
        publisher: { '@id': `${SITE_URL}/#organization` },
        isPartOf: { '@id': `${SITE_URL}/#website` },
        ...(article.tags && article.tags.length > 0 ? { keywords: article.tags.join(', ') } : {})
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
            item: locale === 'vi' ? `${SITE_URL}/news` : `${SITE_URL}/en/news`
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: article.title,
            item: url
          }
        ]
      }
    ]
  }
}

export default async function NewsDetailPage({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { slug, locale } = await params
  const queryClient = new QueryClient()
  const queryKey = buildNewsItemQueryKey(slug)

  await queryClient.prefetchQuery({
    queryKey,
    queryFn: () => safeFetchArticle(slug)
  })

  const article = queryClient.getQueryData<NewsItem | null>(queryKey)

  if (!article) {
    notFound()
  }

  let related: NewsItem[] = []
  try {
    related = (await fetchNewsList()).filter((item) => item.slug !== slug).slice(0, 3)
  } catch (error) {
    console.error('[SSR] related news fetch failed:', error)
  }

  const t = await getTranslations()
  const jsonLd = buildArticleJsonLd(locale, article)

  return (
    <>
      <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <div className='relative w-full overflow-hidden'>
          <FallingPetals />
          <div className='mx-auto w-full max-w-5xl px-4 pb-12 pt-8 space-y-8'>
            {/* Header */}
            <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
              <div className='space-y-3'>
                <p className='text-sm font-bold uppercase tracking-wider text-primary'>{article.category}</p>
                <h1 className='text-4xl font-bold leading-tight text-foreground sm:text-5xl'>{article.title}</h1>
                <div className='flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-2'>
                  <span>{formatNewsDate(article.publishedAt, locale)}</span>
                  <span>•</span>
                  <span>{article.author}</span>
                  <span>•</span>
                  <span>{article.readTime}</span>
                </div>
              </div>
              <Button variant='outline' asChild className='w-fit'>
                <Link href='/news'>{t('news.backToNews')}</Link>
              </Button>
            </div>

            {/* Featured Image */}
            <div className='relative overflow-hidden rounded-3xl bg-muted h-96 sm:h-[500px]'>
              <Image
                src={article.pictureUrl || heroImage}
                alt={article.title}
                fill
                className='object-cover'
                sizes='(min-width:1024px) 800px, 100vw'
                priority
              />
            </div>

            {/* Main Content */}
            <article className='prose prose-sm max-w-none text-base leading-8 text-foreground dark:prose-invert prose-headings:text-foreground prose-p:text-foreground/90'>
              {/* Summary / Sapo */}
              <div className='rounded-2xl border border-border/50 bg-primary/5 p-6 sm:p-8 italic text-lg not-prose mb-8'>
                <p className='text-foreground/90'>{article.summary}</p>
              </div>

              {/* Render Rich Text Content HTML */}
              <div className='news-rich-text-content' dangerouslySetInnerHTML={{ __html: article.content }} />

              {/* Tags */}
              <div className='flex flex-wrap gap-2 pt-6 mt-8 border-t border-border not-prose'>
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className='rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/20'
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </article>

            {/* Related Articles */}
            {related.length > 0 ? (
              <section className='pt-8 border-t border-border'>
                <h2 className='text-2xl font-bold text-foreground mb-6'>{t('news.relatedHeading')}</h2>
                <div className='grid gap-6 sm:grid-cols-3'>
                  {related.map((item) => (
                    <Link
                      key={item.id}
                      href={`/news/${item.slug}`}
                      className='news-card-link group overflow-hidden rounded-2xl border border-border/50 bg-card/70 backdrop-blur transition hover:border-primary/50 hover:bg-card hover:shadow-lg'
                    >
                      <div className='aspect-video relative overflow-hidden bg-muted'>
                        <Image
                          src={item.pictureUrl || heroImage}
                          alt={item.title}
                          fill
                          className='scale-100 object-cover transform-gpu transition-transform duration-1000 ease-out will-change-transform group-hover:scale-110'
                          sizes='(min-width:1024px) 350px, 100vw'
                        />
                      </div>
                      <div className='space-y-3 p-4'>
                        <span className='inline-block rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary'>
                          {item.category}
                        </span>
                        <h3 className='line-clamp-2 font-semibold text-foreground transition group-hover:text-primary'>
                          {item.title}
                        </h3>
                        <p className='text-xs text-muted-foreground'>{formatNewsDate(item.publishedAt, locale)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </HydrationBoundary>
    </>
  )
}
