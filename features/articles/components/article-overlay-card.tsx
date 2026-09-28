'use client'

import type { Article } from '@/features/articles/types'
import { formatDate } from '@/lib/date'
import { Link } from '@/lib/i18n/navigation'
import ViewportImage from '@/shared/components/viewport-image'
import { getFirstParagraphTextFromHtml } from '@/shared/utils'
import { FlowerIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion, type Variants } from 'motion/react'
import { type StaticImageData } from 'next/image'

const cardItem: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.92 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 160, damping: 16 } }
}

interface ArticleOverlayCardProps {
  item: Article
  image: StaticImageData
  locale: string
  className?: string
  titleClassName?: string
}

export function ArticleOverlayCard({
  item,
  image,
  locale,
  className = '',
  titleClassName = 'text-xl sm:text-2xl'
}: ArticleOverlayCardProps) {
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
        <ViewportImage
          src={item.pictureUrl || image}
          alt={item.title}
          className='scale-100 object-cover object-center transform-gpu transition-transform duration-1000 ease-out will-change-transform group-hover:scale-110'
          sizes='(min-width:1024px) 560px, 100vw'
        />
        <span
          aria-hidden='true'
          className='absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/30 to-primary/5'
        />
        <div className='relative z-10 mt-auto flex w-full flex-col gap-2.5 p-5 text-primary-foreground sm:p-6'>
          <div className='flex flex-wrap items-center gap-2 text-[0.625rem] font-semibold text-primary-foreground/90'>
            <span className='inline-flex items-center gap-1 rounded-full bg-primary-foreground/15 px-2 py-0.5 ring-1 ring-primary-foreground/25 backdrop-blur'>
              <HugeiconsIcon icon={FlowerIcon} className='size-3' />
              {item.categories.map((cat) => cat.categoryName).join(', ')}
            </span>
            <span className='h-1 w-1 rounded-full bg-primary-foreground/60' />
            <span>{formatDate(item.createdAt, 'dateLong', { locale })}</span>
          </div>

          <h3 className={`line-clamp-2 font-title leading-tight font-bold text-primary-foreground ${titleClassName}`}>
            {item.title}
          </h3>
          <p className='line-clamp-2 text-xs text-primary-foreground/90 sm:text-sm'>
            {getFirstParagraphTextFromHtml(item.description)}
          </p>
        </div>
      </Link>
    </motion.div>
  )
}
