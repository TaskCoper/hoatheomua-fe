import { FallingPetals } from '@/components/falling-petals'
import SanitizedHtml from '@/components/sanitized-html'
import { Button } from '@/components/ui/button'
import { getArticlesQuery } from '@/features/articles/queries'
import { getAllArticleSlugs, getArticle } from '@/features/articles/queries.server'
import { buildNewsArticleJsonLd, generateNewsDetailMetadata } from '@/features/articles/seo'
import { Article } from '@/features/articles/types'
import { formatDate } from '@/lib/date'
import { Link } from '@/lib/i18n/navigation'
import type { Locale } from '@/lib/i18n/routing'
import { routing } from '@/lib/i18n/routing'
import { getQueryClient } from '@/lib/react-query-client'
import heroImage from '@/public/images/bg-news.png'
import { JsonLd } from '@/shared/seo'
import { getFirstParagraphTextFromHtml } from '@/shared/utils'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import { notFound } from 'next/navigation'

const RELATED_FETCH_SIZE = 4
const RELATED_RENDER_SIZE = 3

export const revalidate = 3600
export const dynamicParams = true

export async function generateStaticParams() {
  const slugs = await getAllArticleSlugs()

  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })))
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: Locale; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  let article: Awaited<ReturnType<typeof getArticle>> | null = null
  try {
    article = await getArticle({ identifier: slug, locale })
  } catch (error) {
    console.error('[SSR] news article metadata fetch failed:', error)
    article = null
  }
  const t = await getTranslations()

  return generateNewsDetailMetadata({
    locale,
    slug,
    article,
    notFoundTitle: t('news.notFoundTitle') ?? 'Article not found',
    titleSuffix: t('news.titleSuffix')
  })
}

export default async function NewsDetailPage({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { slug, locale } = await params

  let article: Awaited<ReturnType<typeof getArticle>> | null = null
  try {
    article = await getArticle({ identifier: slug, locale })
  } catch (error) {
    console.error('[SSR] news article fetch failed:', error)
    article = null
  }

  if (!article) {
    notFound()
  }

  let related: Article[] = []
  try {
    const qc = getQueryClient()
    const page = await qc.fetchQuery(getArticlesQuery({ pageIndex: 1, pageSize: RELATED_FETCH_SIZE, locale }))

    related = page.value.items.filter((item) => item.slug !== slug).slice(0, RELATED_RENDER_SIZE)
  } catch (error) {
    console.error('[SSR] related news fetch failed:', error)
  }

  const t = await getTranslations()

  return (
    <>
      <JsonLd data={buildNewsArticleJsonLd(locale, article)} />

      <div className='relative w-full overflow-hidden'>
        <FallingPetals />
        <div className='mx-auto w-full max-w-5xl px-4 pb-12 pt-8 space-y-8'>
          {/* Header */}
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='space-y-3'>
              <p className='text-sm font-bold uppercase tracking-wider text-primary'>
                {article.categories.map((cat) => cat.categoryName).join(', ')}
              </p>
              <h1 className='text-4xl font-bold leading-tight text-foreground sm:text-5xl'>{article.title}</h1>
              <div className='flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-2'>
                <span>{formatDate(article.createdAt, 'dateLong', { locale })}</span>
                <span>•</span>
                <span>{article.user.userFullName}</span>
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
              <p className='text-foreground/90'>{getFirstParagraphTextFromHtml(article.description)}</p>
            </div>

            {/* Render Rich Text Content HTML */}
            <SanitizedHtml html={article.description} />

            {/* Tags */}
            <div className='flex flex-wrap gap-2 pt-6 mt-8 border-t border-border not-prose'>
              {article.categories.map((cat) => (
                <span
                  key={cat.categoryName}
                  className='rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/20'
                >
                  {cat.categoryName}
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
                        {item.categories.map((cat) => cat.categoryName).join(', ')}
                      </span>
                      <h3 className='line-clamp-2 font-semibold text-foreground transition group-hover:text-primary'>
                        {item.title}
                      </h3>
                      <p className='text-xs text-muted-foreground'>
                        {formatDate(item.createdAt, 'dateLong', { locale })}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </>
  )
}
