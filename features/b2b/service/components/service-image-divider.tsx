'use client'

import ViewportImage from '@/shared/components/viewport-image'
import { cn } from '@/shared/utils'
import { motion } from 'motion/react'
import { useState } from 'react'

type Props = {
  src: string | null
  alt: string
  className?: string
  /** Aspect ratio helper - defaults to a wide editorial band. */
  ratio?: string
}

/**
 * Full-width rounded photo band used between long text passages to reset the
 * visual rhythm. Renders nothing when the service gallery has no image to give,
 * or when the image fails to load.
 */
export default function ServiceImageDivider({ src, alt, className, ratio = 'aspect-[16/7]' }: Props) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ type: 'spring', stiffness: 120, damping: 22 }}
      className='relative w-full'
    >
      <span
        aria-hidden='true'
        className='absolute -bottom-1.5 -right-1.5 left-4 top-4 rounded-[2rem] rounded-tl-[0.75rem] ring-2 ring-primary'
      />
      <figure
        className={cn(
          'relative w-full overflow-hidden rounded-[1.75rem] rounded-tl-[0.5625rem] shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)]',
          ratio,
          className
        )}
      >
        <ViewportImage
          src={src}
          alt={alt}
          className='object-cover'
          sizes='(min-width: 1024px) 48rem, 100vw'
          onError={() => setFailed(true)}
        />
        <span
          aria-hidden='true'
          className='pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent'
        />
      </figure>
    </motion.div>
  )
}
