'use client'

import { Button } from '@/components/ui/button'
import { useGetNewsInfinite } from '@/features/news/hooks/use-get-news-infinite'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link } from '@/lib/i18n/navigation'
import { formatNewsDate, type NewsItem } from '@/lib/news-shared'
import image2 from '@/public/images/2.png'
import image3 from '@/public/images/3.png'
import image5 from '@/public/images/5.png'
import image6 from '@/public/images/6.png'
import image7 from '@/public/images/7.png'
import image8 from '@/public/images/8.png'
import bgNews1 from '@/public/images/bg-news-1.png'
import heroImage from '@/public/images/flower.png'
import leftBranch from '@/public/images/left-branch.png'
import rightBranch from '@/public/images/right-branch.png'
import { ArrowRight02Icon, Calendar03Icon, FlowerIcon, NewsIcon, SparklesIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion, type Variants } from 'motion/react'
import Image, { type StaticImageData } from 'next/image'
import { useEffect, useMemo, useRef } from 'react'
import FloatingPetals from '../../_components/floating-petals'
import { SparkleDivider } from '../../_components/sparkle-dividier'

const NEWS_IMAGES = [heroImage, bgNews1, image2, image3, image5, image6, image7, image8]

const TOPIC_KEYS = [
  'news.topics.fresh',
  'news.topics.care',
  'news.topics.creative',
  'news.topics.decor',
  'news.topics.autumn',
  'news.topics.wedding',
  'news.topics.love',
  'news.topics.nature'
] as const

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } }
}

const containerStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } }
}

const cardStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
}

const cardItem: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.92 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 160, damping: 16 } }
}

const flowerCircle: Variants = {
  hidden: { opacity: 0, scale: 0.7, rotate: -6 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { type: 'spring', stiffness: 130, damping: 16, mass: 0.9 }
  }
}

const stampPop: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.6 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 280, damping: 14, delay: 0.45 }
  }
}

const CURATED_RESERVED = 4

const getNewsImage = (index: number) => NEWS_IMAGES[index % NEWS_IMAGES.length]

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
    <motion.div
      variants={cardItem}
      whileHover={{ y: -10, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 240, damping: 18 }}
      className='h-full'
    >
      <Link
        href={`/news/${item.slug}`}
        className={`news-card-link group relative isolate flex h-full overflow-hidden rounded-3xl bg-card shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] ring-1 ring-foreground/5 transition hover:shadow-[0_1.2rem_3rem_rgb(81_108_108/18%)] ${className}`}
      >
        <Image
          src={item.pictureUrl || image}
          alt={item.title}
          fill
          className='scale-100 object-cover object-center transform-gpu transition-transform duration-1000 ease-out will-change-transform group-hover:scale-110'
          sizes='(min-width:1024px) 560px, 100vw'
        />
        <span
          aria-hidden='true'
          className='absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/30 to-primary/5'
        />
        <div className='relative z-10 mt-auto flex w-full flex-col gap-2.5 p-5 text-primary-foreground sm:p-6'>
          <div className='flex flex-wrap items-center gap-2 text-[0.625rem] font-semibold uppercase tracking-widest text-primary-foreground/90'>
            <span className='inline-flex items-center gap-1 rounded-full bg-primary-foreground/15 px-2.5 py-1 ring-1 ring-primary-foreground/25 backdrop-blur'>
              <HugeiconsIcon icon={FlowerIcon} className='size-3' />
              {item.category}
            </span>
            <span className='h-1 w-1 rounded-full bg-primary-foreground/60' />
            <span>{formatNewsDate(item.publishedAt, locale)}</span>
          </div>
          <h3 className={`line-clamp-3 font-title font-bold leading-tight text-primary-foreground ${titleClassName}`}>
            {item.title}
          </h3>
          <p className='line-clamp-2 text-xs leading-6 text-primary-foreground/90 sm:text-sm'>{item.summary}</p>
        </div>
      </Link>
    </motion.div>
  )
}

function StandardNewsCard({
  item,
  image,
  locale
}: {
  item: NewsItem
  image: StaticImageData
  locale: string
}) {
  return (
    <motion.div
      variants={cardItem}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 240, damping: 18 }}
      className='h-full'
    >
      <Link
        href={`/news/${item.slug}`}
        className='news-card-link group flex h-full flex-col overflow-hidden rounded-3xl bg-card shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] ring-1 ring-foreground/5 transition hover:shadow-[0_1.2rem_3rem_rgb(81_108_108/18%)]'
      >
        <div className='relative aspect-[4/3] overflow-hidden bg-secondary/40'>
          <Image
            src={item.pictureUrl || image}
            alt={item.title}
            fill
            className='scale-100 object-cover object-center transform-gpu transition-transform duration-1000 ease-out will-change-transform group-hover:scale-110'
            sizes='(min-width:1024px) 320px, 100vw'
          />
          <motion.div
            aria-hidden='true'
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            className='pointer-events-none absolute inset-3 rounded-2xl border border-dashed border-primary-foreground/30'
          />
          <span className='absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-card/90 px-2 py-0.5 text-[0.625rem] font-medium text-primary ring-1 ring-foreground/5 backdrop-blur-sm'>
            <HugeiconsIcon icon={FlowerIcon} className='size-3 shrink-0' />
            {item.category}
          </span>
        </div>
        <div className='flex flex-1 flex-col gap-1.5 p-4 sm:p-5'>
          <p className='text-[0.625rem] font-semibold uppercase tracking-widest text-muted-foreground'>
            {formatNewsDate(item.publishedAt, locale)} · {item.readTime}
          </p>
          <h3 className='line-clamp-2 font-title text-base font-bold leading-snug text-primary transition group-hover:text-foreground lg:text-lg'>
            {item.title}
          </h3>
          <p className='line-clamp-2 flex-1 text-xs leading-relaxed text-foreground'>{item.summary}</p>
        </div>
      </Link>
    </motion.div>
  )
}

function NewsCardSkeleton() {
  return (
    <div className='flex h-full flex-col overflow-hidden rounded-3xl bg-card shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] ring-1 ring-foreground/5'>
      <div className='aspect-[4/3] animate-pulse bg-secondary/40' />
      <div className='flex flex-1 flex-col gap-2 p-4 sm:p-5'>
        <div className='h-3 w-24 animate-pulse rounded-full bg-secondary/50' />
        <div className='h-4 w-3/4 animate-pulse rounded-full bg-secondary/60' />
        <div className='h-3 w-full animate-pulse rounded-full bg-secondary/40' />
        <div className='h-3 w-2/3 animate-pulse rounded-full bg-secondary/40' />
      </div>
    </div>
  )
}

export default function NewsContent({ locale }: { locale: string }) {
  const { t } = useTranslation()
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetNewsInfinite()

  const news = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data])

  const featured = news[0]
  const sideStories = [news[1], news[2]].filter(Boolean) as NewsItem[]
  const overlayStories = news.slice(0, 4)
  const wideStory = news[3] ?? featured
  const otherStories = news.slice(CURATED_RESERVED)

  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = sentinelRef.current
    if (!node) return
    if (!hasNextPage || isFetchingNextPage) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          fetchNextPage()
        }
      },
      { rootMargin: '200px' }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  return (
    <div className='relative w-full overflow-hidden'>
      <FloatingPetals />

      <motion.section
        initial='hidden'
        animate='visible'
        variants={containerStagger}
        className='relative isolate px-4 pt-6 sm:pt-8 md:pt-10'
      >
        <div className='mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-10'>
          <motion.div variants={fadeUp} className='space-y-4 lg:col-span-7'>
            <div className='inline-flex items-center gap-2 rounded-full bg-secondary/60 px-3 py-1.5 ring-1 ring-primary/10'>
              <motion.span
                animate={{ rotate: [0, 14, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className='inline-flex'
              >
                <HugeiconsIcon icon={NewsIcon} className='size-3.5 text-primary' />
              </motion.span>
              <p className='text-[0.625rem] font-bold uppercase tracking-widest text-primary sm:text-xs'>
                {t('news.heroEyebrow')}
              </p>
            </div>

            <motion.h1
              variants={fadeUp}
              className='font-title text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl'
            >
              {t('news.heroTitlePart1')}{' '}
              <span className='relative inline-block text-primary'>
                {t('news.heroTitleEmphasis')}
                <motion.span
                  aria-hidden='true'
                  animate={{ rotate: [0, 18, -6, 0], scale: [1, 1.15, 1] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  className='absolute -right-5 -top-3 inline-flex'
                >
                  <HugeiconsIcon icon={SparklesIcon} className='size-5 text-secondary' />
                </motion.span>
              </span>
              {t('news.heroTitlePart2')}
            </motion.h1>

            <motion.p variants={fadeUp} className='max-w-xl text-sm leading-relaxed text-foreground sm:text-base'>
              {t('news.heroDescription')}
            </motion.p>

            <motion.div variants={fadeUp} className='flex flex-col gap-3 sm:flex-row'>
              <Button asChild className='rounded-full px-5 py-2 shadow-sm'>
                <Link href='#latest'>{t('news.exploreCta')}</Link>
              </Button>
              <Button variant='outline' asChild className='rounded-full px-5 py-2'>
                <Link href='/contact'>{t('news.contactCta')}</Link>
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            variants={flowerCircle}
            className='relative hidden items-center justify-center lg:col-span-5 lg:flex'
          >
            <div
              aria-hidden='true'
              className='absolute inset-0 m-auto h-60 w-60 rounded-full bg-secondary/40 blur-3xl lg:h-72 lg:w-72'
            />

            <div className='relative flex flex-col items-center'>
              <motion.div
                animate={{ y: [0, -14, 0], rotate: [0, 1.2, 0, -1.2, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                className='relative grid size-72 place-items-center overflow-hidden rounded-full bg-card shadow-[0_1.2rem_3rem_rgb(81_108_108/14%)] ring-1 ring-foreground/5 lg:size-80'
              >
                <motion.div
                  aria-hidden='true'
                  animate={{ rotate: 360 }}
                  transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                  className='absolute inset-3 rounded-full border border-dashed border-primary/20'
                />

                <Image
                  src={bgNews1}
                  alt={t('news.heroImageAlt')}
                  fill
                  className='object-cover object-center opacity-90'
                  sizes='20rem'
                  priority
                  quality={70}
                />
                <span
                  aria-hidden='true'
                  className='absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent'
                />
              </motion.div>

              <motion.div
                variants={stampPop}
                whileHover={{ y: -4, scale: 1.08 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 320, damping: 14 }}
                className='relative z-10 -mt-3 flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-primary-foreground shadow-md'
              >
                <motion.span
                  animate={{ rotate: [0, 12, -12, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className='inline-flex'
                >
                  <HugeiconsIcon icon={Calendar03Icon} className='size-3.5' />
                </motion.span>
                <span className='whitespace-nowrap text-[0.625rem] font-semibold leading-4 sm:text-xs'>
                  {t('news.metaTitle')}
                </span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {featured ? (
        <section id='latest' className='relative mt-8 px-4 sm:mt-10 md:mt-12 lg:mt-14'>
          <motion.div
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            className='mx-auto w-full max-w-7xl space-y-0.5 sm:space-y-1 md:space-y-1.5 lg:space-y-2'
          >
            <div className='flex items-center justify-start gap-3 sm:justify-center'>
              <SparkleDivider
                className='hidden min-w-0 max-w-96 flex-1 sm:flex'
                iconClassName='sm:size-5 md:size-6 lg:size-7'
                color='#516c6c'
              />

              <h2 className='shrink-0 text-center font-title text-2xl font-bold md:text-3xl lg:text-4xl'>
                {t('news.latestHeading')}
              </h2>

              <SparkleDivider
                className='hidden min-w-0 max-w-96 flex-1 sm:flex'
                iconClassName='sm:size-5 md:size-6 lg:size-7'
                direction='rtl'
                color='#516c6c'
              />
            </div>

            <p className='mx-auto max-w-full text-left text-xs leading-relaxed text-foreground sm:max-w-200 sm:text-center sm:text-sm'>
              {t('news.featuredDescription')}
            </p>
          </motion.div>

          <Image
            src={leftBranch}
            alt={t('news.heroImageAlt')}
            className='wind-wiggle-left pointer-events-none absolute -left-8 top-12 hidden h-56 w-auto opacity-25 lg:block'
            aria-hidden='true'
          />

          <motion.div
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true, margin: '-60px' }}
            variants={cardStagger}
            className='mx-auto mt-6 grid w-full max-w-7xl gap-4 sm:gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.45fr)_minmax(0,0.9fr)] lg:items-stretch'
          >
            {sideStories[0] ? (
              <StandardNewsCard item={sideStories[0]} image={getNewsImage(2)} locale={locale} />
            ) : null}

            <OverlayNewsCard
              item={featured}
              image={getNewsImage(0)}
              locale={locale}
              className='min-h-[430px] lg:min-h-[520px]'
              titleClassName='text-3xl sm:text-4xl'
            />

            {sideStories[1] ? (
              <StandardNewsCard item={sideStories[1]} image={getNewsImage(3)} locale={locale} />
            ) : null}
          </motion.div>
        </section>
      ) : null}

      {overlayStories.length > 0 ? (
        <section className='relative mt-8 px-4 sm:mt-10 md:mt-12 lg:mt-14'>
          <motion.div
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            className='mx-auto w-full max-w-7xl space-y-0.5 sm:space-y-1 md:space-y-1.5 lg:space-y-2'
          >
            <div className='flex items-center justify-start gap-3 sm:justify-center'>
              <SparkleDivider
                className='hidden min-w-0 max-w-96 flex-1 sm:flex'
                iconClassName='sm:size-5 md:size-6 lg:size-7'
                color='#516c6c'
              />

              <h2 className='shrink-0 text-center font-title text-2xl font-bold md:text-3xl lg:text-4xl'>
                {t('news.featuredHeading')}
              </h2>

              <SparkleDivider
                className='hidden min-w-0 max-w-96 flex-1 sm:flex'
                iconClassName='sm:size-5 md:size-6 lg:size-7'
                direction='rtl'
                color='#516c6c'
              />
            </div>

            <p className='mx-auto max-w-full text-left text-xs leading-relaxed text-foreground sm:max-w-200 sm:text-center sm:text-sm'>
              {t('news.featuredDescription')}
            </p>
          </motion.div>

          <Image
            src={rightBranch}
            alt={t('news.heroImageAlt')}
            className='wind-wiggle-right pointer-events-none absolute -right-8 bottom-12 hidden h-52 w-auto opacity-25 lg:block'
            aria-hidden='true'
          />

          <motion.div
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true, margin: '-60px' }}
            variants={cardStagger}
            className='mx-auto mt-6 grid w-full max-w-7xl gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4'
          >
            {overlayStories.map((item, index) => (
              <OverlayNewsCard
                key={item.id}
                item={item}
                image={getNewsImage(index + 4)}
                locale={locale}
                className='min-h-[340px]'
                titleClassName='text-xl'
              />
            ))}
          </motion.div>
        </section>
      ) : null}

      {wideStory ? (
        <section className='relative mt-8 px-4 sm:mt-10 md:mt-12 lg:mt-14'>
          <motion.div
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            className='mx-auto w-full max-w-7xl space-y-0.5 sm:space-y-1 md:space-y-1.5 lg:space-y-2'
          >
            <div className='flex items-center justify-start gap-3 sm:justify-center'>
              <SparkleDivider
                className='hidden min-w-0 max-w-96 flex-1 sm:flex'
                iconClassName='sm:size-5 md:size-6 lg:size-7'
                color='#516c6c'
              />

              <h2 className='shrink-0 text-center font-title text-2xl font-bold md:text-3xl lg:text-4xl'>
                {t('news.weekHighlightHeading')}
              </h2>

              <SparkleDivider
                className='hidden min-w-0 max-w-96 flex-1 sm:flex'
                iconClassName='sm:size-5 md:size-6 lg:size-7'
                direction='rtl'
                color='#516c6c'
              />
            </div>
          </motion.div>

          <motion.div
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeUp}
            whileHover={{ y: -6 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
            className='mx-auto mt-6 w-full max-w-7xl'
          >
            <Link
              href={`/news/${wideStory.slug}`}
              className='news-card-link group grid overflow-hidden rounded-3xl bg-card shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] ring-1 ring-foreground/5 transition hover:shadow-[0_1.2rem_3rem_rgb(81_108_108/18%)] lg:grid-cols-[1.15fr_0.85fr]'
            >
              <div className='relative min-h-[280px] overflow-hidden bg-secondary/40 sm:min-h-[360px]'>
                <Image
                  src={wideStory.pictureUrl || getNewsImage(6)}
                  alt={wideStory.title}
                  fill
                  className='scale-100 object-cover object-center transform-gpu transition-transform duration-1000 ease-out will-change-transform group-hover:scale-110'
                  sizes='(min-width:1024px) 720px, 100vw'
                />
                <motion.div
                  aria-hidden='true'
                  animate={{ rotate: 360 }}
                  transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                  className='pointer-events-none absolute inset-4 rounded-3xl border border-dashed border-primary-foreground/25'
                />
                <span
                  aria-hidden='true'
                  className='absolute inset-0 bg-gradient-to-tr from-primary/40 via-transparent to-transparent'
                />
              </div>
              <div className='flex flex-col justify-center gap-4 p-6 sm:p-8 lg:p-10'>
                <div className='flex flex-wrap items-center gap-3'>
                  <span className='inline-flex items-center gap-1.5 rounded-full bg-secondary/60 px-3 py-1 text-[0.625rem] font-bold uppercase tracking-widest text-primary ring-1 ring-primary/10'>
                    <HugeiconsIcon icon={FlowerIcon} className='size-3' />
                    {wideStory.category}
                  </span>
                  <span className='text-xs text-muted-foreground sm:text-sm'>
                    {formatNewsDate(wideStory.publishedAt, locale)}
                  </span>
                </div>
                <h3 className='font-title text-2xl font-bold leading-tight text-primary transition group-hover:text-foreground sm:text-3xl lg:text-4xl'>
                  {wideStory.title}
                </h3>
                <p className='text-sm leading-relaxed text-foreground sm:text-base'>{wideStory.summary}</p>
                <div className='flex items-center justify-between gap-4 border-t border-secondary/60 pt-4 text-xs sm:text-sm'>
                  <span className='font-semibold text-foreground'>{wideStory.author}</span>
                  <motion.span
                    whileHover={{ x: 4 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 16 }}
                    className='inline-flex items-center gap-1 font-semibold text-primary'
                  >
                    {t('news.exploreCta')}
                    <motion.span
                      className='inline-flex'
                      animate={{ x: [0, 6, 0] }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <HugeiconsIcon icon={ArrowRight02Icon} className='size-3.5' />
                    </motion.span>
                  </motion.span>
                </div>
              </div>
            </Link>
          </motion.div>
        </section>
      ) : null}

      {otherStories.length > 0 ? (
        <section className='relative mt-8 px-4 sm:mt-10 md:mt-12 lg:mt-14'>
          <motion.div
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            className='mx-auto w-full max-w-7xl space-y-0.5 sm:space-y-1 md:space-y-1.5 lg:space-y-2'
          >
            <div className='flex items-center justify-start gap-3 sm:justify-center'>
              <SparkleDivider
                className='hidden min-w-0 max-w-96 flex-1 sm:flex'
                iconClassName='sm:size-5 md:size-6 lg:size-7'
                color='#516c6c'
              />

              <h2 className='shrink-0 text-center font-title text-2xl font-bold md:text-3xl lg:text-4xl'>
                {t('news.otherArticlesHeading')}
              </h2>

              <SparkleDivider
                className='hidden min-w-0 max-w-96 flex-1 sm:flex'
                iconClassName='sm:size-5 md:size-6 lg:size-7'
                direction='rtl'
                color='#516c6c'
              />
            </div>
          </motion.div>

          <motion.div
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true, margin: '-60px' }}
            variants={cardStagger}
            className='mx-auto mt-6 grid w-full max-w-7xl gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4'
          >
            {otherStories.map((item, index) => (
              <StandardNewsCard key={item.id} item={item} image={getNewsImage(index + 1)} locale={locale} />
            ))}
            {isFetchingNextPage
              ? Array.from({ length: 4 }).map((_, i) => <NewsCardSkeleton key={`skeleton-${i}`} />)
              : null}
          </motion.div>

          <div ref={sentinelRef} aria-hidden='true' className='h-1 w-full' />
        </section>
      ) : null}

      <section className='mt-8 px-4 pb-12 sm:mt-10 md:mt-12 lg:mt-14 lg:pb-16'>
        <motion.div
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          className='mx-auto w-full max-w-7xl overflow-hidden rounded-3xl bg-card p-6 shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] ring-1 ring-foreground/5 sm:p-8 lg:p-10'
        >
          <div className='flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between'>
            <h2 className='font-title text-xl font-bold text-primary sm:text-2xl lg:text-3xl'>
              {t('news.popularTopicsHeading')}
            </h2>
            <span className='inline-flex items-center gap-1.5 text-[0.625rem] font-semibold uppercase tracking-widest text-muted-foreground'>
              <motion.span
                animate={{ rotate: [0, 18, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className='inline-flex'
              >
                <HugeiconsIcon icon={SparklesIcon} className='size-3.5 text-secondary' />
              </motion.span>
              {t('news.seeAll')}
            </span>
          </div>

          <motion.div
            variants={cardStagger}
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true, margin: '-40px' }}
            className='mt-5 flex flex-wrap gap-2.5'
          >
            {TOPIC_KEYS.map((topicKey) => {
              const label = t(topicKey)
              return (
                <motion.button
                  key={topicKey}
                  type='button'
                  variants={cardItem}
                  whileHover={{ y: -4, scale: 1.06 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 14 }}
                  className='group inline-flex items-center gap-1.5 rounded-full bg-secondary/50 px-3.5 py-1.5 text-xs font-semibold text-primary ring-1 ring-primary/10 transition-colors hover:bg-primary hover:text-primary-foreground'
                >
                  <HugeiconsIcon icon={FlowerIcon} className='size-3 shrink-0' />
                  <span>#{label}</span>
                </motion.button>
              )
            })}
          </motion.div>
        </motion.div>
      </section>
    </div>
  )
}
