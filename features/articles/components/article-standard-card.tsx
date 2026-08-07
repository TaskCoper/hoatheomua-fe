'use client'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { Article } from '@/features/articles/types'
import { useDynamicLineClamp } from '@/hooks/use-dynamic-line-clamp'
import { formatDate } from '@/lib/date'
import { Link } from '@/lib/i18n/navigation'
import { getFirstParagraphTextFromHtml } from '@/shared/utils'
import { FlowerIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion, type Variants } from 'motion/react'
import Image, { type StaticImageData } from 'next/image'

const cardItem: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.92 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 160, damping: 16 } }
}

interface ArticleStandardCardProps {
  item: Article
  image: StaticImageData
  locale: string
}

export function ArticleStandardCard({ item, image, locale }: ArticleStandardCardProps) {
  const { ref: descriptionRef, style: descriptionStyle } = useDynamicLineClamp<HTMLDivElement>()

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

          <span className='absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-card/90 px-2 py-0.5 text-[0.625rem] font-medium text-primary ring-1 ring-foreground/5 backdrop-blur-sm'>
            <HugeiconsIcon icon={FlowerIcon} className='size-3 shrink-0' />
            {item.categories.map((cat) => cat.categoryName).join(', ')}
          </span>
        </div>
        <div className='flex flex-1 flex-col gap-1.5 p-4 sm:p-5'>
          <p className='text-[0.625rem] font-semibold text-muted-foreground'>
            {formatDate(item.createdAt, 'dateLong', { locale })}
          </p>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <h3 className='line-clamp-2 font-title text-base font-bold leading-snug text-primary transition group-hover:text-foreground lg:text-lg'>
                  {item.title}
                </h3>
              </TooltipTrigger>

              <TooltipContent
                className='max-w-[220px] rounded-2xl border border-border/50 bg-white px-3 py-2 text-xs font-medium text-primary shadow-[0_0.45rem_1.4rem_rgb(81_108_108/12%)] backdrop-blur-sm'
                iconClassName=' bg-white fill-white'
              >
                {item.title}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div ref={descriptionRef} className='min-h-[3.75rem] flex-1 text-xs leading-relaxed text-foreground'>
            <p style={descriptionStyle}>{getFirstParagraphTextFromHtml(item.description)}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
