import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { fetchNewsItem, fetchNewsList, formatNewsDate } from '@/lib/news'
import { FallingPetals } from '@/components/falling-petals'
import heroImage from '@/public/images/flower.png'

export async function generateMetadata({ params }: { params: { locale: string; slug: string } }): Promise<Metadata> {
  const article = await fetchNewsItem(params.slug)

  return {
    title: `${article.title} - Hoa Theo Mùa`,
    description: article.summary
  }
}

export default async function NewsDetailPage({ params }: { params: { locale: string; slug: string } }) {
  const article = await fetchNewsItem(params.slug)
  const related = (await fetchNewsList()).filter((item) => item.slug !== params.slug).slice(0, 3)

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
              <span>{formatNewsDate(article.publishedAt, params.locale)}</span>
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
        <article className='prose prose-sm max-w-none space-y-8 text-base leading-8 text-foreground'>
          {/* Summary */}
          <div className='rounded-2xl border border-border/50 bg-primary/5 p-6 sm:p-8 italic text-lg'>
            <p className='text-foreground/90'>{article.summary}</p>
          </div>

          {/* Quoted Statement */}
          <div className='relative my-8 border-l-4 border-primary pl-6 py-4'>
            <svg className='absolute -top-3 -left-5 text-primary/20' width='40' height='40' viewBox='0 0 40 40' fill='currentColor'>
              <path d='M10 10v20h20V10H10zm8 4h4v12h-4v-12z' />
            </svg>
            <blockquote className='text-xl font-semibold text-foreground italic'>
              &ldquo;Hoa không chỉ là một loại cây, nó là một câu chuyện, một cảm xúc, một cách để nói những điều không thể
              nói bằng lời.&rdquo;
            </blockquote>
            <p className='mt-3 text-sm text-muted-foreground'>— Câu châm ngôn về hoa</p>
          </div>

          {/* Body Content */}
          <div className='space-y-6'>
            {article.content.split('\n\n').map((paragraph, idx) => (
              <div key={idx}>
                <p className='text-foreground/90'>{paragraph}</p>
                
                {/* Insert image every 2-3 paragraphs */}
                {idx === 2 || idx === 5 ? (
                  <div className='my-8 overflow-hidden rounded-2xl bg-muted h-80'>
                    <Image
                      src={heroImage}
                      alt={`Hình minh họa ${idx + 1}`}
                      className='h-full w-full object-cover'
                      sizes='(min-width:1024px) 700px, 100vw'
                    />
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          {/* Second Quote */}
          <div className='relative my-10 rounded-2xl bg-gradient-to-br from-secondary/10 to-secondary/5 p-6 sm:p-8 border border-secondary/20'>
            <div className='flex gap-4'>
              <div className='flex-shrink-0'>
                <svg className='text-secondary' width='32' height='32' viewBox='0 0 32 32' fill='currentColor'>
                  <path d='M8 8v16h16V8H8zm6 3h4v10h-4V11z' />
                </svg>
              </div>
              <div>
                <p className='text-lg font-semibold text-foreground italic'>
                  &ldquo;Cách chăm sóc hoa chính là cách chúng ta chăm sóc đến cái đẹp trong cuộc sống hàng ngày.&rdquo;
                </p>
                <p className='mt-2 text-sm text-muted-foreground'>— Lời cảm hứng từ Hoa Theo Mùa</p>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className='flex flex-wrap gap-2 pt-6 border-t border-border'>
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
                  <p className='text-xs text-muted-foreground'>{formatNewsDate(item.publishedAt, params.locale)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

