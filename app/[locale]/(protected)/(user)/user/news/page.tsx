import Image, { type StaticImageData } from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { FallingPetals } from '@/components/falling-petals'
import { fetchNewsList, formatNewsDate, type NewsItem } from '@/lib/news'
import image2 from '@/public/images/2.png'
import image3 from '@/public/images/3.png'
import image5 from '@/public/images/5.png'
import image6 from '@/public/images/6.png'
import image7 from '@/public/images/7.png'
import image8 from '@/public/images/8.png'
import bgNews1 from '@/public/images/bg-news-1.png'
import heroImage from '@/public/images/flower.png'

export const metadata: Metadata = {
  title: 'Tin tức - Hoa Theo Mùa',
  description: 'Tin tức về hoa tươi, cắm hoa và xu hướng hoa dành cho bạn.'
}

const newsImages = [heroImage, bgNews1, image2, image3, image5, image6, image7, image8]

function getNewsImage(index: number) {
  return newsImages[index % newsImages.length]
}

function OverlayNewsCard({
  item,
  image,
  locale,
  className = '',
  titleClassName = 'text-xl sm:text-2xl'
}: {
  item: NewsItem
  image: StaticImageData
  locale: string
  className?: string
  titleClassName?: string
}) {
  return (
    <Link
      href={`/user/news/${item.slug}`}
      className={`news-card-link group relative isolate flex overflow-hidden rounded-2xl border border-border/50 bg-muted shadow-sm transition hover:border-primary/50 hover:shadow-lg ${className}`}
    >
      <Image
        src={image}
        alt={item.title}
        fill
        className='scale-100 object-cover object-center transform-gpu transition-transform duration-1000 ease-out will-change-transform group-hover:scale-110'
        sizes='(min-width:1024px) 560px, 100vw'
      />
      <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10' />
      <div className='relative z-10 mt-auto flex w-full flex-col gap-3 p-5 text-white sm:p-6'>
        <div className='flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/90'>
          <span className='rounded-full bg-white/18 px-2.5 py-1 text-white shadow-sm backdrop-blur'>
            {item.category}
          </span>
          <span className='h-1 w-1 rounded-full bg-white/60' />
          <span>{formatNewsDate(item.publishedAt, locale)}</span>
        </div>
        <h3 className={`line-clamp-3 font-bold leading-tight text-white drop-shadow-sm ${titleClassName}`}>{item.title}</h3>
        <p className='line-clamp-2 text-sm leading-6 text-white/85'>{item.summary}</p>
      </div>
    </Link>
  )
}

function StandardNewsCard({ item, image, locale }: { item: NewsItem; image: StaticImageData; locale: string }) {
  return (
    <Link
      href={`/user/news/${item.slug}`}
      className='news-card-link group overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-sm backdrop-blur transition hover:border-primary/50 hover:bg-card hover:shadow-lg'
    >
      <div className='relative aspect-[4/3] overflow-hidden bg-muted'>
        <Image
          src={image}
          alt={item.title}
          fill
          className='scale-100 object-cover object-center transform-gpu transition-transform duration-1000 ease-out will-change-transform group-hover:scale-110'
          sizes='(min-width:1024px) 320px, 100vw'
        />
      </div>
      <div className='space-y-3 p-4'>
        <div className='flex items-center justify-between gap-3 text-xs text-muted-foreground'>
          <span className='font-semibold text-primary'>{item.category}</span>
          <span>{item.readTime}</span>
        </div>
        <h3 className='line-clamp-2 text-base font-bold leading-snug text-foreground transition group-hover:text-primary'>
          {item.title}
        </h3>
        <p className='line-clamp-2 text-sm leading-6 text-muted-foreground'>{item.summary}</p>
        <p className='text-xs text-muted-foreground'>{formatNewsDate(item.publishedAt, locale)}</p>
      </div>
    </Link>
  )
}

export default async function NewsPage({ params }: { params: { locale: string } }) {
  const news = await fetchNewsList()
  const [featured, ...rest] = news
  const sideStories = [rest[0] ?? featured, rest[1] ?? featured].filter(Boolean)
  const overlayStories = news.slice(0, 4)
  const wideStory = news[3] ?? featured
  const compactStories = news.slice(1, 5)

  return (
    <div className='relative w-full overflow-hidden'>
      <FallingPetals />

      <div className='mx-auto w-full max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8'>
        <section className='mb-12 grid gap-0 overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-background/50 to-background/80 p-8 backdrop-blur-sm sm:grid-cols-[1fr_0.7fr] lg:p-10'>
          <div className='flex max-w-xl flex-col justify-center space-y-6'>
            <div className='space-y-3'>
              <p className='text-sm font-bold uppercase tracking-widest text-primary'>Chào mừng bạn</p>
              <h1 className='text-4xl font-bold leading-tight text-foreground sm:text-5xl'>
                Câu chuyện hoa <span className='text-primary'>truyền cảm hứng</span>, kiến thức và giải pháp
              </h1>
            </div>
            <p className='text-base leading-7 text-muted-foreground'>
              Cập nhật những bài viết được biên tập chi tiết về hoa tươi, cách chăm sóc, phong cách cắm hoa và xu
              hướng mới nhất từ Hoa Theo Mùa.
            </p>
            <div className='flex flex-col gap-3 sm:flex-row'>
              <Button asChild className='rounded-full px-6 py-2'>
                <Link href='#latest'>Khám phá tin tức</Link>
              </Button>
              <Button variant='outline' asChild className='rounded-full px-6 py-2'>
                <Link href='/contact'>Liên hệ tư vấn</Link>
              </Button>
            </div>
          </div>

          <div className='relative -mb-8 -mr-8 hidden items-stretch justify-end sm:flex lg:-mb-10 lg:-mr-10'>
            <div className='relative h-full w-full overflow-hidden rounded-tl-3xl'>
              <Image src={bgNews1} alt='News Hero' className='h-full w-full object-cover' sizes='350px' priority />
            </div>
          </div>
        </section>

        {featured ? (
          <section id='latest' className='mb-16 space-y-8'>
            <div className='flex items-center justify-between gap-4'>
              <h2 className='text-3xl font-bold text-foreground'>Tin tức mới nhất</h2>
              <Button variant='ghost' asChild className='text-primary hover:bg-primary/10 hover:text-primary'>
                <Link href='#latest'>Xem tất cả</Link>
              </Button>
            </div>

            <div className='grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.45fr)_minmax(0,0.9fr)] lg:items-stretch'>
              {sideStories[0] ? (
                <StandardNewsCard item={sideStories[0]} image={getNewsImage(2)} locale={params.locale} />
              ) : null}

              <OverlayNewsCard
                item={featured}
                image={getNewsImage(0)}
                locale={params.locale}
                className='min-h-[430px] lg:min-h-[520px]'
                titleClassName='text-3xl sm:text-4xl'
              />

              {sideStories[1] ? (
                <StandardNewsCard item={sideStories[1]} image={getNewsImage(3)} locale={params.locale} />
              ) : null}
            </div>
          </section>
        ) : null}

        <section className='mb-16 space-y-8'>
          <div className='flex items-center justify-between gap-4'>
            <h2 className='text-3xl font-bold text-foreground'>Bài viết nổi bật</h2>
            <p className='hidden max-w-md text-sm leading-6 text-muted-foreground sm:block'>
              Chọn nhanh những chủ đề đang được quan tâm, toàn bộ nội dung hiển thị trực tiếp trên ảnh.
            </p>
          </div>

          <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
            {overlayStories.map((item, index) => (
              <OverlayNewsCard
                key={item.id}
                item={item}
                image={getNewsImage(index + 4)}
                locale={params.locale}
                className='min-h-[320px]'
                titleClassName='text-xl'
              />
            ))}
          </div>
        </section>

        {wideStory ? (
          <section className='mb-16 space-y-8'>
            <h2 className='text-3xl font-bold text-foreground'>Tiêu điểm trong tuần</h2>

            <Link
              href={`/user/news/${wideStory.slug}`}
              className='news-card-link group grid overflow-hidden rounded-3xl border border-border/50 bg-card/80 shadow-sm backdrop-blur transition hover:border-primary/50 hover:bg-card hover:shadow-xl lg:grid-cols-[1.15fr_0.85fr]'
            >
              <div className='relative min-h-[280px] overflow-hidden bg-muted sm:min-h-[360px]'>
                <Image
                  src={getNewsImage(6)}
                  alt={wideStory.title}
                  fill
                  className='scale-100 object-cover object-center transform-gpu transition-transform duration-1000 ease-out will-change-transform group-hover:scale-110'
                  sizes='(min-width:1024px) 720px, 100vw'
                />
              </div>
              <div className='flex flex-col justify-center gap-5 p-6 sm:p-8 lg:p-10'>
                <div className='flex flex-wrap items-center gap-3'>
                  <span className='rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary'>
                    {wideStory.category}
                  </span>
                  <span className='text-sm text-muted-foreground'>
                    {formatNewsDate(wideStory.publishedAt, params.locale)}
                  </span>
                </div>
                <h3 className='text-3xl font-bold leading-tight text-foreground transition group-hover:text-primary sm:text-4xl'>
                  {wideStory.title}
                </h3>
                <p className='text-base leading-8 text-muted-foreground'>{wideStory.summary}</p>
                <div className='flex items-center justify-between gap-4 border-t border-border/70 pt-5 text-sm'>
                  <span className='font-medium text-foreground'>{wideStory.author}</span>
                  <span className='rounded-full bg-secondary/20 px-3 py-1 text-secondary-foreground'>
                    {wideStory.readTime}
                  </span>
                </div>
              </div>
            </Link>
          </section>
        ) : null}

        <section className='mb-16 space-y-8'>
          <h2 className='text-3xl font-bold text-foreground'>Các bài viết khác</h2>

          <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
            {compactStories.map((item, index) => (
              <StandardNewsCard key={item.id} item={item} image={getNewsImage(index + 1)} locale={params.locale} />
            ))}
          </div>
        </section>

        <section className='space-y-8 rounded-2xl border border-border/50 bg-card/50 p-8 backdrop-blur'>
          <h2 className='text-2xl font-bold text-foreground'>Chủ đề phổ biến</h2>
          <div className='flex flex-wrap gap-3'>
            {['Hoa tươi', 'Chăm sóc', 'Sáng tạo', 'Trang trí', 'Thu', 'Cưới', 'Tình yêu', 'Thiên nhiên'].map((tag) => (
              <button
                key={tag}
                className='rounded-full border border-border/80 bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary hover:bg-primary hover:text-primary-foreground'
              >
                #{tag}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
