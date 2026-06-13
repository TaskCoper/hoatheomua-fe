import { FallingPetals } from '@/components/falling-petals'
import { fetchNewsItem, fetchNewsList, formatNewsDate } from '@/lib/news'
import heroImage from '@/public/images/flower.png'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { locale: string; slug: string } }): Promise<Metadata> {
  const article = await fetchNewsItem(params.slug)

  if (!article) {
    return {}
  }

  return {
    title: `${article.title} - Hoa Theo Mùa`,
    description: article.summary
  }
}

export default async function NewsDetailPage({ params }: { params: { locale: string; slug: string } }) {
  const article = await fetchNewsItem(params.slug)

  if (!article) {
    return <div className='mx-auto max-w-3xl px-4 py-12'>Không tìm thấy bài viết.</div>
  }

  const relatedNews = (await fetchNewsList()).filter((item) => item.slug !== article.slug).slice(0, 3)

  return (
    <article className='relative overflow-hidden'>
      <FallingPetals />
      <div className='mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8'>
        <div className='mb-8 flex items-center justify-between gap-4'>
          <Link href='/user/news'>← Trở về tin tức</Link>
          <span className='text-sm text-muted-foreground'>{formatNewsDate(article.publishedAt, params.locale)}</span>
        </div>

        <header className='mb-8 space-y-4'>
          <p className='text-sm font-semibold uppercase tracking-wide text-primary'>{article.category}</p>
          <h1 className='text-4xl font-bold text-foreground'>{article.title}</h1>
          <p className='text-base leading-7 text-muted-foreground'>{article.summary}</p>
        </header>

        <div className='relative mb-10 aspect-[16/9] overflow-hidden rounded-3xl bg-muted shadow-lg'>
          <Image src={heroImage} alt={article.title} fill className='object-cover' />
        </div>

        <div className='prose max-w-none'>
          <p>{article.summary}</p>
        </div>

        {relatedNews.length > 0 ? (
          <section className='mt-16'>
            <h2 className='mb-6 text-2xl font-bold'>Bài viết liên quan</h2>
            <div className='grid gap-4 md:grid-cols-3'>
              {relatedNews.map((item) => (
                <Link key={item.id} href={`/user/news/${item.slug}`} className='block rounded-2xl border p-4'>
                  <h3 className='mb-2 font-semibold'>{item.title}</h3>
                  <p className='text-sm text-muted-foreground'>{item.summary}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </article>
  )
}
