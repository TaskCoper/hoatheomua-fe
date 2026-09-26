'use client'

import PreviewImage from '@/shared/components/preview-image'
import { cn } from '@/shared/utils'
import type { CardWritingMethod } from '../../cards/types'

interface OrderCardArtworkProps {
  /** A generated artwork, or the card's design while nothing has been generated yet. */
  imageUrl: string | null
  alt: string
  sizes: string
  className?: string
  style?: React.CSSProperties
  /** The words that go on the card - laid over the artwork when there is room for them. */
  message?: string
  writingMethod?: CardWritingMethod
  showWords?: boolean
  /** For callers that hold the preview at the artwork's own shape. */
  onReady?: (size: { naturalWidth: number; naturalHeight: number }) => void
}

export default function OrderCardArtwork({
  imageUrl,
  alt,
  sizes,
  className,
  style,
  message,
  writingMethod,
  showWords,
  onReady
}: OrderCardArtworkProps) {
  return (
    <div style={style} className={cn('relative overflow-hidden bg-secondary/40', className)}>
      <PreviewImage
        src={imageUrl || null}
        alt={alt}
        sizes={sizes}
        className='absolute inset-0 size-full rounded-none'
        onReady={onReady}
      />

      {showWords && message ? (
        <div className='pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent p-3 text-white sm:p-4'>
          <p
            className={cn(
              'line-clamp-4 text-pretty text-sm leading-snug',
              writingMethod === 'handwritten' && 'font-title italic'
            )}
          >
            {message}
          </p>
        </div>
      ) : null}
    </div>
  )
}
