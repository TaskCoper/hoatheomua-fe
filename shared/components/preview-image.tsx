'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/shared/utils'
import { Image01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Image from 'next/image'
import { useState } from 'react'

interface PreviewImageProps {
  src: string | null
  alt: string
  sizes: string
  className?: string
}

export default function PreviewImage({ src, alt, sizes, className }: PreviewImageProps) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(src ? 'loading' : 'error')

  return (
    <span className={cn('relative block overflow-hidden bg-secondary/40', className)}>
      {src && status !== 'error' ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          className={cn(
            'object-cover transition-opacity duration-200',
            status === 'ready' ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={() => setStatus('ready')}
          onError={() => setStatus('error')}
        />
      ) : null}

      {status === 'loading' ? <Skeleton className='absolute inset-0 rounded-none' /> : null}

      {status === 'error' ? (
        <span className='absolute inset-0 grid place-items-center text-muted-foreground/60'>
          <HugeiconsIcon icon={Image01Icon} className='size-5' strokeWidth={1.5} />
        </span>
      ) : null}
    </span>
  )
}
