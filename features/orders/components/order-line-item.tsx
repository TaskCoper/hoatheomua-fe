'use client'

import { buildProductVariantHref } from '@/features/products/components/product-variant-context'
import { formatVnd } from '@/lib/currency'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link } from '@/lib/i18n/navigation'
import { cn } from '@/shared/utils'
import { FlowerIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Image from 'next/image'
import { normalizeOrderLine, type OrderLineSource } from '../utils/normalize-order-line'

const THUMBNAIL = {
  sm: { box: 'size-14 sm:size-16', icon: 'size-6', sizes: '64px', quality: 60 },
  md: { box: 'size-16 sm:size-20', icon: 'size-7', sizes: '80px', quality: 65 }
} as const

interface OrderLineItemProps {
  item: OrderLineSource
  size?: keyof typeof THUMBNAIL
  showLineTotal?: boolean
  className?: string
}

export function OrderLineItem({ item: source, size = 'sm', showLineTotal = false, className }: OrderLineItemProps) {
  const { t } = useTranslation()
  const thumbnailSize = THUMBNAIL[size]
  const item = normalizeOrderLine(source)

  const parentName = item.parentProductName?.trim()
  // A variant line points at its parent page with the variant preselected, so the
  // customer lands on the same picker they bought from.
  const href =
    item.parentProductId && item.productId
      ? buildProductVariantHref(item.parentProductId, item.productId)
      : item.productId
        ? `/products/${item.productId}`
        : null

  const headline = parentName || item.name
  // Non-variant lines repeat the parent name in `name`; showing it twice reads as a bug.
  const variantName = parentName && item.name !== parentName ? item.name : null

  const thumbnail = (
    <span
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-secondary/30 ring-1',
        thumbnailSize.box,
        href ? 'ring-primary/10' : 'ring-foreground/5'
      )}
    >
      {item.coverImage ? (
        <Image
          src={item.coverImage}
          alt={item.name}
          fill
          sizes={thumbnailSize.sizes}
          quality={thumbnailSize.quality}
          className='object-cover'
        />
      ) : (
        <HugeiconsIcon
          icon={FlowerIcon}
          className={cn(thumbnailSize.icon, href ? 'text-primary/40' : 'text-muted-foreground/50')}
        />
      )}
    </span>
  )

  return (
    <li className={cn('flex items-center gap-3', className)}>
      {/* The thumbnail duplicates the title's link, so it is hidden from the tab
          order and the accessibility tree rather than announced twice. */}
      {href ? (
        <Link href={href} tabIndex={-1} aria-hidden='true' className='shrink-0'>
          {thumbnail}
        </Link>
      ) : (
        thumbnail
      )}

      <div className='min-w-0 flex-1'>
        {href ? (
          <Link
            href={href}
            className='font-title line-clamp-2 text-sm leading-tight font-bold text-primary outline-none hover:text-primary/80 focus-visible:underline'
          >
            {headline}
          </Link>
        ) : (
          <p className='line-clamp-2 text-sm leading-tight font-medium'>{headline}</p>
        )}

        {variantName ? (
          <p className='mt-1 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5'>
            <span className='text-[0.7rem] font-medium text-muted-foreground'>
              {t('orders.list.detail.variantLabel')}
            </span>
            <span className='inline-flex rounded-full bg-secondary/40 px-2 py-0.5 text-[0.7rem] font-semibold text-secondary-foreground ring-1 ring-primary/10'>
              {variantName}
            </span>
          </p>
        ) : null}

        <p className='mt-0.5 text-xs text-muted-foreground'>
          {t('orders.checkout.lineQty', { qty: item.quantity, price: formatVnd(item.price) })}
        </p>
      </div>

      {showLineTotal ? (
        <span className='shrink-0 text-sm font-semibold text-primary'>{formatVnd(item.price * item.quantity)}</span>
      ) : null}
    </li>
  )
}
