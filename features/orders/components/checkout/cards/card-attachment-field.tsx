'use client'

import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import PreviewImage from '@/shared/components/preview-image'
import { MAX_UPLOAD_IMAGE_SIZE } from '@/shared/constants'
import { Delete02Icon, ImageAdd02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useRef, type ChangeEvent } from 'react'
import { toast } from 'sonner'
import { useObjectUrl } from '../../../hooks/use-object-url'

const MAX_UPLOAD_IMAGE_MB = MAX_UPLOAD_IMAGE_SIZE / (1024 * 1024)

interface CardAttachmentFieldProps {
  value: File | null
  onChange: (attachedImage: File | null) => void
}

export default function CardAttachmentField({ value, onChange }: CardAttachmentFieldProps) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const previewUrl = useObjectUrl(value)

  const handlePick = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    // Cleared straight away, so picking the same file again still fires a change.
    event.target.value = ''
    if (!file) return

    // Checked on pick, so a bad file is caught while it can still be swapped.
    if (!file.type.startsWith('image/')) {
      toast.error(t('orders.checkout.cards.attachmentInvalidType'))
      return
    }

    if (file.size > MAX_UPLOAD_IMAGE_SIZE) {
      toast.error(t('orders.checkout.cards.attachmentTooLarge', { max: MAX_UPLOAD_IMAGE_MB }))
      return
    }

    onChange(file)
  }

  return (
    <div className='space-y-1.5'>
      <p className='text-sm font-medium'>
        {t('orders.checkout.cards.attachment')}
        <span className='ml-1 font-normal text-muted-foreground'>({t('common.ui.optional')})</span>
      </p>

      <input ref={inputRef} type='file' accept='image/*' className='hidden' onChange={handlePick} />

      {value ? (
        <div className='flex items-center gap-3 rounded-2xl border border-border/60 bg-background/60 p-2'>
          <PreviewImage
            src={previewUrl}
            alt={value.name}
            sizes='64px'
            unoptimized
            className='size-14 shrink-0 rounded-xl border border-border'
          />

          <div className='min-w-0 flex-1'>
            <p className='truncate text-xs font-medium'>{value.name}</p>
            <p className='truncate text-xs text-muted-foreground'>{t('orders.checkout.cards.attachmentHint')}</p>
          </div>

          <div className='flex shrink-0 gap-1'>
            <Button type='button' variant='outline' size='sm' onClick={() => inputRef.current?.click()}>
              {t('orders.checkout.cards.attachmentReplace')}
            </Button>
            <Button
              type='button'
              variant='ghost'
              size='icon-sm'
              className='rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
              onClick={() => onChange(null)}
              aria-label={t('orders.checkout.cards.attachmentRemove')}
            >
              <HugeiconsIcon icon={Delete02Icon} className='size-4' />
            </Button>
          </div>
        </div>
      ) : (
        <button
          type='button'
          onClick={() => inputRef.current?.click()}
          className='flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-5 text-xs text-muted-foreground transition-colors hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/30'
        >
          <HugeiconsIcon icon={ImageAdd02Icon} strokeWidth={1.75} className='size-4 text-primary' />
          {t('orders.checkout.cards.attachmentAdd', { max: MAX_UPLOAD_IMAGE_MB })}
        </button>
      )}
    </div>
  )
}
