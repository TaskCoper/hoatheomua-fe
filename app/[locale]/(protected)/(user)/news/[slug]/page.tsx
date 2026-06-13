import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { fetchNewsItem, fetchNewsList, formatNewsDate } from '@/lib/news'
import { FallingPetals } from '@/components/falling-petals'
// import heroImage from '@/public/images/flower.png'
import heroImage from '@/public/images/bg-news.png'
// 1. Sửa hàm generateMetadata (Thêm await params)
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ locale: string; slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params // <-- Thêm dòng này để giải nén Promise
  const article = await fetchNewsItem(slug)

  return {
    title: `${article.title} - Hoa Theo Mùa`,
    description: article.summary
  }
}

// 2. Sửa hàm NewsDetailPage chính (Thêm await params)
export default async function NewsDetailPage({ 
  params 
}: { 
  params: Promise<{ locale: string; slug: string }> 
}) {
  const { slug, locale } = await params // <-- Thêm dòng này để giải nén Promise
  
  const article = await fetchNewsItem(slug)
  const related = (await fetchNewsList()).filter((item) => item.slug !== slug).slice(0, 3)

  return (
    <div className='relative w-full overflow-hidden'>
      <FallingPetals />
      
      <div className='mx-auto w-full max-w-5xl px-4 pb-12 pt-8 space-y-8'>
        {/* Header */}
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='space-y-3'>
            <p className='text-sm font-bold uppercase tracking-wider text-primary'>{article.category}</p>
            <h1 className='text-4xl font-bold leading-tight text-foreground sm:text-5xl'>
              {article.title}
            </h1>
            <div className='flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-2'>
              <span>{formatNewsDate(article.publishedAt, locale)}</span>
              <span>•</span>
              <span>{article.author}</span>
              <span>•</span>
              <span>{article.readTime}</span>
            </div>
          </div>
          <Button variant='outline' asChild className='w-fit'>
            <Link href='/news'>← Trở về tin tức</Link>
          </Button>
        </div>

        {/* Featured Image */}
        <div className='relative overflow-hidden rounded-3xl bg-muted h-96 sm:h-[500px]'>
          <Image
            src={heroImage}
            alt={article.title}
            className='h-full w-full object-cover'
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

          {/* Render HTML Content */}
          <div 
            className='news-rich-text-content'
            dangerouslySetInnerHTML={{ __html: article.content }} 
          />

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
        <section className='pt-8 border-t border-border'>
          <h2 className='text-2xl font-bold text-foreground mb-6'>Bài viết liên quan</h2>
          <div className='grid gap-6 sm:grid-cols-3'>
            {related.map((item) => (
              <Link
                key={item.id}
                href={`/news/${item.slug}`}
                className='news-card-link group overflow-hidden rounded-2xl border border-border/50 bg-card/70 backdrop-blur transition hover:border-primary/50 hover:bg-card hover:shadow-lg'
              >
                <div className='aspect-video relative overflow-hidden bg-muted'>
                  <Image
                    src={heroImage}
                    alt={item.title}
                    className='h-full w-full scale-100 object-cover transform-gpu transition-transform duration-1000 ease-out will-change-transform group-hover:scale-110'
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
      </div>
    </div>
  )
}