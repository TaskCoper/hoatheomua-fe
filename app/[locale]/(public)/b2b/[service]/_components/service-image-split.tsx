'use client'

import { cn } from '@/shared/utils'
import { motion } from 'motion/react'
import Image from 'next/image'
import type { ReactNode } from 'react'

type Props = {
  src: string | null
  alt: string
  reverse?: boolean
  children: ReactNode
  className?: string
}

/**
 * Editorial image + text split. Alternates side via `reverse`. When the service
 * has no image for this slot, the text simply spans the full width.
 */
export default function ServiceImageSplit({ src, alt, reverse = false, children, className }: Props) {
  if (!src) {
    return <div className={className}>{children}</div>
  }

  return (
    <div className={cn('grid items-center gap-6 md:grid-cols-2 md:gap-10', className)}>
      <motion.div
        initial={{ opacity: 0, x: reverse ? 28 : -28 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ type: 'spring', stiffness: 120, damping: 22 }}
        className={cn('relative', reverse ? 'md:order-2' : 'md:order-1')}
      >
        {/* Mint offset backdrop — mirrors the pinched corner toward the text column. */}
        <span
          aria-hidden='true'
          className={cn(
            'absolute -bottom-2 top-5 rounded-[1.75rem] bg-secondary/50',
            reverse
              ? '-left-2 right-5 rounded-tr-[0.625rem]'
              : '-right-2 left-5 rounded-tl-[0.625rem]'
          )}
        />
        <figure
          className={cn(
            'relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-muted shadow-lg shadow-primary/10 ring-1 ring-primary/10 sm:aspect-[4/3] md:aspect-[4/5]',
            reverse ? 'rounded-tr-[0.5rem]' : 'rounded-tl-[0.5rem]'
          )}
        >
          <Image src={src} alt={alt} fill className='object-cover' sizes='(min-width: 768px) 24rem, 100vw' />
        </figure>
      </motion.div>

      <div className={cn('min-w-0', reverse ? 'md:order-1' : 'md:order-2')}>{children}</div>
    </div>
  )
}
