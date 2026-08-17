'use client'

import ViewportImage from '@/shared/components/viewport-image'
import { cn } from '@/shared/utils'
import { motion } from 'motion/react'

type Props = {
  src: string | null
  alt: string
  className?: string
  /** Aspect ratio helper - defaults to a wide editorial band. */
  ratio?: string
}

/**
 * Full-width rounded photo band used between long text passages to reset the
 * visual rhythm. Renders nothing when the service gallery has no image to give.
 */
export default function ServiceImageDivider({ src, alt, className, ratio = 'aspect-[16/7]' }: Props) {
  if (!src) return null

  return (
    <motion.figure
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ type: 'spring', stiffness: 120, damping: 22 }}
      className={cn(
        'relative w-full overflow-hidden rounded-[1.75rem] rounded-tl-[0.5625rem] bg-muted shadow-lg shadow-primary/10 ring-1 ring-primary/10',
        ratio,
        className
      )}
    >
      <ViewportImage src={src} alt={alt} className='object-cover' sizes='(min-width: 1024px) 48rem, 100vw' />
      <span
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent'
      />
    </motion.figure>
  )
}
