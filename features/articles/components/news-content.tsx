'use client'

import { ArticleOverlayCard } from '@/features/articles/components/article-overlay-card'
import { ArticlePagination } from '@/features/articles/components/article-pagination'
import { ArticleStandardCard } from '@/features/articles/components/article-standard-card'
import { useGetArticles } from '@/features/articles/hooks/use-get-articles'
import { formatDate } from '@/lib/date'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link } from '@/lib/i18n/navigation'
import image2 from '@/public/images/2.webp'
import image3 from '@/public/images/3.webp'
import image5 from '@/public/images/5.webp'
import image6 from '@/public/images/6.webp'
import image7 from '@/public/images/7.webp'
import image8 from '@/public/images/8.webp'
import bgNews1 from '@/public/images/bg-news-1.png'
import heroImage from '@/public/images/flower.png'
import leftBranch from '@/public/images/left-branch.png'
import rightBranch from '@/public/images/right-branch.png'
import { getFirstParagraphTextFromHtml } from '@/shared/utils'
import { ArrowRight02Icon, FlowerIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion, type Variants } from 'motion/react'
import Image from 'next/image'
import { useQueryStates } from 'nuqs'
import FloatingPetals from '../../../app/[locale]/(public)/_components/floating-petals'
import { SparkleDivider } from '../../../app/[locale]/(public)/_components/sparkle-dividier'
import { newsSearchParsers } from '../search-params'

const NEWS_IMAGES = [heroImage, bgNews1, image2, image3, image5, image6, image7, image8]

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } }
}

const cardStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
}

const CURATED_RESERVED = 4

const getNewsImage = (index: number) => NEWS_IMAGES[index % NEWS_IMAGES.length]

export default function NewsContent({ locale }: { locale: string }) {
  const { t } = useTranslation()
  const [{ page: pageIndex }, setSearch] = useQueryStates(newsSearchParsers)
  const { articles, isFetchingArticles } = useGetArticles({ pageIndex })

  const items = articles.value.items
  const hasNextPage = articles.value.hasNextPage
  const hasPreviousPage = articles.value.hasPreviousPage
  const totalPages = Math.max(1, Math.ceil(articles.value.totalCount / articles.value.pageSize))

  const featured = items[0]
  const sideStories = [items[1], items[2]].filter(Boolean) as typeof items
  const overlayStories = items.slice(0, CURATED_RESERVED)
  const wideStory = items[3] ?? featured
  const otherStories = items.slice(CURATED_RESERVED)

  return (
    <div className='relative w-full overflow-hidden mb-20'>
      <FloatingPetals />

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
              <ArticleStandardCard item={sideStories[0]} image={getNewsImage(2)} locale={locale} />
            ) : null}

            <ArticleOverlayCard
              item={featured}
              image={getNewsImage(0)}
              locale={locale}
              className='min-h-[430px] lg:min-h-[520px]'
              titleClassName='text-3xl sm:text-4xl'
            />

            {sideStories[1] ? (
              <ArticleStandardCard item={sideStories[1]} image={getNewsImage(3)} locale={locale} />
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
              <ArticleOverlayCard
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
                    {wideStory.categories.map((cat) => cat.categoryName).join(', ')}
                  </span>
                  <span className='text-xs text-muted-foreground sm:text-sm'>
                    {formatDate(wideStory.createdAt, 'dateLong', { locale })}
                  </span>
                </div>
                <h3 className='font-title text-2xl font-bold leading-tight text-primary transition group-hover:text-foreground sm:text-3xl lg:text-4xl'>
                  {wideStory.title}
                </h3>
                <p className='text-sm leading-relaxed text-foreground sm:text-base line-clamp-6'>
                  {getFirstParagraphTextFromHtml(wideStory.description)}
                </p>
                <div className='flex items-center justify-between gap-4 border-t border-secondary/60 pt-4 text-xs sm:text-sm'>
                  <span className='font-semibold text-foreground'>{wideStory.user.userFullName}</span>
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
            key={pageIndex}
            initial='hidden'
            animate='visible'
            variants={cardStagger}
            className='mx-auto mt-6 grid w-full max-w-7xl gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4'
          >
            {otherStories.map((item, index) => (
              <ArticleStandardCard key={item.id} item={item} image={getNewsImage(index + 1)} locale={locale} />
            ))}
          </motion.div>
        </section>
      ) : null}

      <ArticlePagination
        pageIndex={pageIndex}
        totalPages={totalPages}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        isFetching={isFetchingArticles}
        onPageChange={(next) => setSearch({ page: next })}
        scrollAnchor='#latest'
      />
    </div>
  )
}
