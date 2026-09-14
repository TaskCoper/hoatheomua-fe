'use client'

import { useTranslation } from '@/lib/i18n/dictionary-provider'
import PreviewImage from '@/shared/components/preview-image'
import { cn } from '@/shared/utils'
import type { CardWritingMethod, OrderCardVersion } from '../../cards/types'

interface OrderCardArtworkProps {
  version: OrderCardVersion | null
  writingMethod: CardWritingMethod
  sizes: string
  className?: string
  showWords?: boolean
}

export default function OrderCardArtwork({
  version,
  writingMethod,
  sizes,
  className,
  showWords
}: OrderCardArtworkProps) {
  const { t } = useTranslation()

  return (
    <div className={cn('relative overflow-hidden bg-secondary/40', className)}>
      <PreviewImage
        src={version?.imageUrl ?? null}
        alt={version ? t('orders.cards.previewAlt', { index: version.label }) : t('orders.cards.noVersion')}
        sizes={sizes}
        className='absolute inset-0 size-full rounded-none'
      />

      {showWords && version ? (
        <div className='pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent p-3 text-white sm:p-4'>
          <p
            className={cn(
              'line-clamp-4 text-pretty text-sm leading-snug',
              writingMethod === 'handwritten' && 'font-title italic'
            )}
          >
            {version.content.message}
          </p>
        </div>
      ) : null}
    </div>
  )
}
