'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { formatStudioPrice } from '@/features/studio/studio-data'
import type { StudioProduct } from '@/features/studio/types'
import { cn } from '@/shared/utils'
import { SparklesIcon, Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

const microLabelClass = 'text-[0.625rem] font-medium text-muted-foreground'

interface StudioProductDialogProps {
  products: StudioProduct[]
  /** Ids already used by other slots - still listed, but not selectable twice. */
  takenIds: string[]
  selectedId?: string
  slot: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (id: string) => void
}

export default function StudioProductDialog({
  products,
  takenIds,
  selectedId,
  slot,
  open,
  onOpenChange,
  onSelect
}: StudioProductDialogProps) {
  const t = useTranslations('studio.compose.bouquet')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        position='top-center'
        className='w-[calc(100%-1.5rem)] gap-0 rounded-3xl bg-background p-0 sm:max-w-2xl'
      >
        <DialogHeader className='px-6 pb-2 pr-14 pt-6 text-left sm:px-8 sm:pr-16 sm:pt-8'>
          <DialogTitle className='text-pretty font-title text-2xl font-bold leading-tight text-primary'>
            {t('dialogTitle', { slot })}
          </DialogTitle>
          <DialogDescription className='text-xs leading-relaxed text-muted-foreground'>
            {t('dialogNote')}
          </DialogDescription>
        </DialogHeader>

        <div className='max-h-[60dvh] overflow-y-auto px-6 pb-6 pt-6 sm:px-8 sm:pb-8'>
          <ul role='radiogroup' aria-label={t('dialogTitle', { slot })} className='flex flex-col gap-8'>
            {products.map((item) => {
              const selected = item.id === selectedId
              const taken = !selected && takenIds.includes(item.id)

              return (
                <li key={item.id}>
                  <button
                    type='button'
                    role='radio'
                    aria-checked={selected}
                    disabled={taken}
                    onClick={() => {
                      onSelect(item.id)
                      onOpenChange(false)
                    }}
                    className={cn(
                      'group grid w-full gap-4 text-left transition-opacity duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:grid-cols-[minmax(0,4rem)_1fr]',
                      taken ? 'cursor-not-allowed opacity-45' : 'cursor-pointer'
                    )}
                  >
                    <span
                      className={cn(
                        'relative block aspect-square overflow-hidden rounded-full bg-secondary/40 ring-1 transition-[box-shadow,--tw-ring-color] duration-300',
                        selected
                          ? 'ring-primary shadow-[0_0_0_0.125rem_var(--color-background),0_0_0_0.25rem_var(--color-primary)]'
                          : 'ring-foreground/5'
                      )}
                    >
                      <Image
                        src={item.imageUrl}
                        alt=''
                        fill
                        sizes='(min-width: 640px) 4rem, 100vw'
                        className={cn(
                          'transition-transform duration-500',
                          item.imageFit === 'cover' ? 'object-cover' : 'object-contain p-1.5',
                          !taken && 'group-hover:scale-105'
                        )}
                      />
                    </span>

                    <span className='min-w-0'>
                      <span className={cn(microLabelClass, 'flex items-center gap-1.5')}>
                        {formatStudioPrice(item.priceAmount)}
                        {selected ? (
                          <HugeiconsIcon icon={Tick02Icon} className='size-3 text-primary' strokeWidth={2.5} />
                        ) : null}
                        {taken ? <span>· {t('alreadyUsed')}</span> : null}
                      </span>
                      <span
                        className={cn(
                          'block text-pretty font-title text-lg font-bold leading-snug text-primary transition-colors',
                          !taken && 'group-hover:text-primary/75'
                        )}
                      >
                        {item.name}
                      </span>
                      <span className='block text-xs leading-relaxed text-muted-foreground'>{item.note}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>

          <p className='mt-8 flex items-start gap-2.5 text-xs leading-relaxed text-muted-foreground'>
            <HugeiconsIcon icon={SparklesIcon} className='mt-0.5 size-3.5 shrink-0 text-primary' />
            {t('dialogFootnote')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
