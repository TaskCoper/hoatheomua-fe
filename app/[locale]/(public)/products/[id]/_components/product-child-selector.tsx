'use client'

import type { ProductDetail } from '@/features/products/types'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { cn } from '@/shared/utils'
import { FlowerIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion } from 'motion/react'
import Image from 'next/image'

interface ProductChildSelectorProps {
  childs: ProductDetail[]
  activeChildId: number | null
  onChange: (id: number) => void
}

export default function ProductChildSelector({ childs, activeChildId, onChange }: ProductChildSelectorProps) {
  const { t } = useTranslation()

  return (
    <div className='space-y-2'>
      <p className='text-xs font-semibold uppercase tracking-widest text-muted-foreground'>
        {t('products.detail.variants.label')}
      </p>
      <div className='flex flex-wrap gap-2'>
        {childs.map((child) => {
          const isActive = child.id === activeChildId
          const available = child.inventory?.available ?? 0
          const isOutOfStock = available <= 0
          const thumbnail = child.images?.avatar ?? null
          const name = child.name ?? `#${child.id}`

          return (
            <motion.button
              key={child.id}
              type='button'
              whileHover={!isOutOfStock ? { y: -2 } : undefined}
              whileTap={!isOutOfStock ? { scale: 0.97 } : undefined}
              transition={{ type: 'spring', stiffness: 320, damping: 16 }}
              onClick={() => onChange(child.id)}
              aria-pressed={isActive}
              className={cn(
                'group relative flex items-center gap-2 rounded-2xl px-2 py-1.5 text-left ring-1 transition-colors',
                isActive
                  ? 'bg-primary/10 ring-primary'
                  : 'bg-card ring-foreground/10 hover:bg-secondary/40 hover:ring-foreground/20',
                isOutOfStock && 'opacity-60'
              )}
            >
              <span className='relative size-10 shrink-0 overflow-hidden rounded-xl bg-secondary/40 ring-1 ring-foreground/5'>
                {thumbnail ? (
                  <Image src={thumbnail} alt={name} fill sizes='40px' quality={50} className='object-cover' />
                ) : (
                  <span className='grid h-full w-full place-items-center text-primary/40'>
                    <HugeiconsIcon icon={FlowerIcon} className='size-5' />
                  </span>
                )}
              </span>
              <span className='flex flex-col pr-1'>
                <span className='line-clamp-1 text-xs font-semibold text-primary'>{name}</span>
                {isOutOfStock ? (
                  <span className='text-[0.625rem] font-medium text-rose-500'>
                    {t('products.detail.purchase.outOfStock')}
                  </span>
                ) : null}
              </span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
