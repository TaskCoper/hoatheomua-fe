'use client'

import { Spinner } from '@/components/ui/spinner'
import { useDownloadImage } from '@/hooks/use-download-image'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { cn } from '@/shared/utils'
import { Download01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

interface DownloadImageButtonProps {
  src: string | null
  filename?: string
  className?: string
  iconClassName?: string
}

export default function DownloadImageButton({
  src,
  filename = 'image',
  className,
  iconClassName
}: DownloadImageButtonProps) {
  const { t } = useTranslation()
  const { downloadImage, isDownloading } = useDownloadImage()

  if (!src) return null

  return (
    <button
      type='button'
      onClick={(event) => {
        event.stopPropagation()
        downloadImage(src, filename)
      }}
      disabled={isDownloading}
      aria-label={t('common.button.download')}
      title={t('common.button.download')}
      className={cn(
        'flex size-9 cursor-pointer items-center justify-center rounded-full bg-white/70 text-primary shadow-[0_0.25rem_0.75rem_rgb(28_43_43/10%)] backdrop-blur-md transition-colors hover:bg-white disabled:pointer-events-none disabled:opacity-60',
        className
      )}
    >
      {isDownloading ? (
        <Spinner className='size-4' />
      ) : (
        <HugeiconsIcon icon={Download01Icon} className={cn('size-4', iconClassName)} strokeWidth={2} />
      )}
    </button>
  )
}
