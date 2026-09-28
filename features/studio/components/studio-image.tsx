'use client'

import { cn } from '@/shared/utils'
import { FlowerIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslations } from 'next-intl'
import Image, { type ImageProps } from 'next/image'

export function StudioImagePending({
  className,
  iconClassName,
  label
}: {
  className?: string
  iconClassName?: string
  label?: string
}) {
  const t = useTranslations('studio')

  return (
    <div
      role='img'
      aria-label={label ?? t('imagePending')}
      className={cn(
        'absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-secondary/40 text-primary/40',
        className
      )}
    >
      <HugeiconsIcon icon={FlowerIcon} className={cn('size-8 animate-pulse', iconClassName)} />
      {label ? <span className='px-2 text-center text-[0.625rem] font-medium leading-tight'>{label}</span> : null}
    </div>
  )
}

type StudioImageProps = Omit<ImageProps, 'src' | 'alt'> & {
  src: string | null | undefined
  alt: string
  pendingLabel?: string
  pendingClassName?: string
  pendingIconClassName?: string
}

export default function StudioImage({
  src,
  alt,
  pendingLabel,
  pendingClassName,
  pendingIconClassName,
  ...props
}: StudioImageProps) {
  if (!src)
    return <StudioImagePending className={pendingClassName} iconClassName={pendingIconClassName} label={pendingLabel} />

  return <Image src={src} alt={alt} {...props} />
}
