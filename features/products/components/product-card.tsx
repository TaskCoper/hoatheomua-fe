'use client'

import { Badge } from '@/components/ui/badge'
import ProductTitle from '@/features/products/components/product-title'
import { PRODUCT_CARD_MEDIA_HEIGHT } from '@/features/products/constants'
import type { ProductDetail } from '@/features/products/types'
import { formatVnd } from '@/lib/currency'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link } from '@/lib/i18n/navigation'
import { cn } from '@/shared/utils'
import { FlowerIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion, type Variants } from 'motion/react'
import Image from 'next/image'

const cardItem: Variants = {
  hidden: { opacity: 0, y: 50, scale: 0.92 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 160, damping: 16 }
  }
}

export default function ProductCard({
  product,
  eager = false,
  isActive = false,
  onHoverStart
}: {
  product: ProductDetail
  eager?: boolean
  isActive?: boolean
  onHoverStart?: () => void
}) {
  const { t } = useTranslation()
  const name = product.productName ?? ''
  const retail = product.price ?? 0
  const oldPrice = product.oldPrice ?? 0
  const hasDiscount = oldPrice > retail
  const discountPercent = hasDiscount ? Math.round(((oldPrice - retail) / oldPrice) * 100) : 0
  const avatar = product.coverImage
  const isOutOfStock = (product.sellableQuantity ?? 0) <= 0

  return (
    <motion.article
      variants={cardItem}
      whileHover={{ y: -10, scale: 1.025 }}
      transition={{ type: 'spring', stiffness: 240, damping: 18 }}
      onHoverStart={onHoverStart}
      className='group relative'
    >
      {isActive ? (
        <div
          aria-hidden='true'
          className='pointer-events-none absolute inset-0 hidden translate-x-1.5 translate-y-1.5 rounded-4xl border border-primary fine-pointer:block'
        />
      ) : null}

      <div className='relative z-10 flex h-full flex-col overflow-hidden rounded-3xl bg-card shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] ring-1 ring-foreground/5 hover:shadow-[0_1.2rem_3rem_rgb(81_108_108/18%)]'>
        <Link
          href={`/products/${product.id}`}
          className={cn(
            'relative isolate flex shrink-0 items-center justify-center overflow-hidden bg-secondary/40',
            PRODUCT_CARD_MEDIA_HEIGHT
          )}
        >
          {avatar ? (
            <Image
              src={avatar}
              alt={name}
              fill
              loading={eager ? 'eager' : 'lazy'}
              priority={eager}
              sizes='(min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 360px) 50vw, 100vw'
              quality={65}
              className='object-cover transition-transform duration-700 ease-out group-hover:scale-105'
            />
          ) : (
            <>
              <div
                aria-hidden='true'
                className='spin-loop absolute inset-3 rounded-2xl border border-dashed border-primary/15 sm:inset-2 lg:inset-3'
                style={{ ['--spin-duration' as string]: '30s' }}
              />

              {/* Keep the bob and the hover spring on separate elements: a CSS
                  animation on `transform` outranks motion's inline transform. */}
              <div className='card-bob flex items-center justify-center'>
                <motion.div
                  whileHover={{ scale: 1.15, rotate: -6 }}
                  transition={{ type: 'spring', stiffness: 240, damping: 16 }}
                  className='flex items-center justify-center'
                >
                  <div
                    aria-hidden='true'
                    className='flex h-32 w-32 items-center justify-center rounded-full bg-primary/10 text-primary sm:h-36 sm:w-36 lg:h-40 lg:w-40'
                  >
                    <HugeiconsIcon icon={FlowerIcon} className='size-12' />
                  </div>
                </motion.div>
              </div>
            </>
          )}

          {hasDiscount ? (
            <motion.span
              whileHover={{ scale: 1.1, rotate: -3 }}
              transition={{ type: 'spring', stiffness: 360, damping: 14 }}
              className='absolute left-3 top-3 inline-flex'
            >
              <Badge
                variant='destructive'
                className='bg-rose-500 px-2.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wider text-white shadow-sm hover:bg-rose-500'
              >
                -{discountPercent}%
              </Badge>
            </motion.span>
          ) : null}

          {isOutOfStock ? (
            <span className='absolute right-2 top-2 inline-flex'>
              <Badge
                variant='secondary'
                className='bg-rose-500 px-2 py-0.5 text-[0.625rem] font-semibold text-background shadow-sm backdrop-blur-sm'
              >
                {t('products.card.outOfStock')}
              </Badge>
            </span>
          ) : null}
        </Link>

        <div className='flex flex-1 flex-col gap-1.5 p-3 sm:p-4'>
          <ProductTitle name={name} />

          <div className='mt-auto -space-y-0.5 pt-1'>
            {hasDiscount ? (
              <p className='text-[0.625rem] text-muted-foreground line-through'>{formatVnd(oldPrice)}</p>
            ) : (
              <p className='text-xs font-medium text-muted-foreground'>{t('products.card.priceFrom')}</p>
            )}
            <p className='font-title text-sm font-bold text-primary sm:text-base'>{formatVnd(retail)}</p>
          </div>
        </div>
      </div>
    </motion.article>
  )
}
