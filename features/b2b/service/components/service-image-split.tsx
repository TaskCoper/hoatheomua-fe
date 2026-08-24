'use client'

import ViewportImage from '@/shared/components/viewport-image'
import { cn } from '@/shared/utils'
import { motion } from 'motion/react'
import { useState, type ReactNode } from 'react'

type Props = {
  src: string | null
  alt: string
  reverse?: boolean
  children: ReactNode
  className?: string
}

/**
 * Editorial image + text split. Alternates side via `reverse`. When the service
 * has no image for this slot (or it fails to load), the text simply spans the
 * full width.
 */
export default function ServiceImageSplit({ src, alt, reverse = false, children, className }: Props) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return <div className={className}>{children}</div>
  }

  return (
    // items-stretch on md+ lets the image column match the text column's height -
    // the picture is as tall as the content beside it, never an over-long strip.
    <div className={cn('grid items-center gap-6 md:grid-cols-2 md:items-stretch md:gap-10', className)}>
      <motion.div
        initial={{ opacity: 0, x: reverse ? 28 : -28 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ type: 'spring', stiffness: 120, damping: 22 }}
        className={cn('relative md:h-full', reverse ? 'md:order-2' : 'md:order-1')}
      >
        <span
          aria-hidden='true'
          className={cn(
            'absolute -bottom-1.5 top-4 rounded-[1.75rem] ring-2 ring-primary',
            reverse ? '-left-1.5 right-4 rounded-tr-[0.625rem]' : '-right-1.5 left-4 rounded-tl-[0.625rem]'
          )}
        />
        <figure
          className={cn(
            'relative aspect-[4/5] overflow-hidden rounded-[1.5rem] shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] sm:aspect-[4/3] md:aspect-auto md:h-full md:min-h-[16rem]',
            reverse ? 'rounded-tr-[0.5rem]' : 'rounded-tl-[0.5rem]'
          )}
        >
          <ViewportImage
            src={src}
            alt={alt}
            className='object-cover'
            sizes='(min-width: 768px) 24rem, 100vw'
            onError={() => setFailed(true)}
          />
        </figure>
      </motion.div>

      <div className={cn('min-w-0', reverse ? 'md:order-1' : 'md:order-2')}>{children}</div>
    </div>
  )
}
