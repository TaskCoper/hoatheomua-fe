'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { Product } from '@/features/products/types'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link } from '@/lib/i18n/navigation'
import { FavouriteIcon, FlowerIcon } from '@hugeicons/core-free-icons'
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

const vndFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
})

const formatVnd = (value: number) => vndFormatter.format(value)

export default function ProductCard({ product, eager = false }: { product: Product; eager?: boolean }) {
  const { t } = useTranslation()
  const retail = product.prices?.retail ?? 0
  const oldPrice = product.prices?.old ?? 0
  const hasDiscount = oldPrice > retail
  const discountPercent = hasDiscount ? Math.round(((oldPrice - retail) / oldPrice) * 100) : 0
  const avatar = product.images?.avatar

  return (
    <motion.article
      variants={cardItem}
      whileHover={{ y: -10, scale: 1.025 }}
      transition={{ type: 'spring', stiffness: 240, damping: 18 }}
      className='group relative flex flex-col overflow-hidden rounded-3xl bg-card shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] ring-1 ring-foreground/5 hover:shadow-[0_1.2rem_3rem_rgb(81_108_108/18%)]'
    >
      <Link
        href={`/products/${product.id}`}
        className='relative isolate flex h-44 items-center justify-center overflow-hidden bg-secondary/40 sm:h-48 lg:h-56'
      >
        {avatar ? (
          <Image
            src={avatar}
            alt={product.name}
            fill
            loading={eager ? 'eager' : 'lazy'}
            priority={eager}
            sizes='(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw'
            quality={65}
            className='object-cover transition-transform duration-700 ease-out group-hover:scale-105'
          />
        ) : (
          <>
            <motion.div
              aria-hidden='true'
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              className='absolute inset-3 rounded-2xl border border-dashed border-primary/15 sm:inset-2 lg:inset-3'
            />

            <motion.div
              animate={{ y: [0, -6, 0], rotate: [0, -2, 0, 2, 0] }}
              whileHover={{ scale: 1.15, rotate: -6 }}
              transition={{
                y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
                rotate: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
                scale: { type: 'spring', stiffness: 240, damping: 16 }
              }}
              className='flex items-center justify-center'
            >
              <div
                aria-hidden='true'
                className='flex h-32 w-32 items-center justify-center rounded-full bg-primary/10 text-primary sm:h-36 sm:w-36 lg:h-40 lg:w-40'
              >
                <HugeiconsIcon icon={FlowerIcon} className='size-12' />
              </div>
            </motion.div>
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

        <motion.div
          whileHover={{ scale: 1.15, rotate: -8 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 380, damping: 12 }}
          className='absolute right-3 top-3'
        >
          <Button
            type='button'
            variant='outline'
            size='icon-sm'
            className='rounded-full bg-card/95 text-foreground shadow-sm hover:text-rose-500'
            aria-label={t('products.card.addToFavorites', { name: product.name })}
            onClick={(event) => event.preventDefault()}
          >
            <HugeiconsIcon icon={FavouriteIcon} className='size-4' />
          </Button>
        </motion.div>
      </Link>

      <div className='flex flex-1 flex-col gap-1.5 p-4 sm:p-3 md:p-4 lg:p-5'>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <h2 className='font-title text-base font-bold leading-tight text-primary line-clamp-2 sm:text-base md:text-lg truncate'>
                {product.name}
              </h2>
            </TooltipTrigger>

            <TooltipContent
              className='max-w-[220px] rounded-2xl border border-border/50 bg-white px-3 py-2 text-xs font-medium text-primary shadow-[0_0.45rem_1.4rem_rgb(81_108_108/12%)] backdrop-blur-sm'
              iconClassName=' bg-white fill-white'
            >
              {product.name}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className='mt-1 -space-y-0.5'>
          {hasDiscount ? (
            <p className='text-[0.625rem] text-muted-foreground line-through'>{formatVnd(oldPrice)}</p>
          ) : (
            <p className='text-xs font-medium text-muted-foreground'>{t('products.card.priceFrom')}</p>
          )}
          <p className='font-title text-sm font-bold text-primary sm:text-base'>{formatVnd(retail)}</p>
        </div>
      </div>
    </motion.article>
  )
}
