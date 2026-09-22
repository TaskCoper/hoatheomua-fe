'use client'

import StudioImage from '@/features/studio/components/studio-image'
import { formatStudioPrice, studioSummaryLabelClass } from '@/features/studio/studio-data'
import type { StudioOption, StudioProduct, StudioTrim } from '@/features/studio/types'
import { cn } from '@/shared/utils'

export interface StudioSummaryItem {
  id: string
  name: string
  note: string | null
  imageUrl: string | null
}

export interface StudioSummaryChoice {
  label: string
  items: StudioSummaryItem[]
}

export const toStudioSummaryOptions = (option: StudioOption | null | undefined): StudioSummaryItem[] =>
  option ? [{ id: option.id, name: option.name, note: null, imageUrl: option.imageUrl }] : []

export const toStudioSummaryTrims = (trim: StudioTrim | null | undefined): StudioSummaryItem[] =>
  trim
    ? [
        {
          id: trim.id,
          name: trim.name,
          note: trim.priceAmount ? formatStudioPrice(trim.priceAmount) : null,
          imageUrl: trim.imageUrl
        }
      ]
    : []

export const toStudioSummaryProducts = (products: StudioProduct[]): StudioSummaryItem[] =>
  products.map((product) => ({
    id: product.id,
    name: product.name,
    note: product.priceAmount ? formatStudioPrice(product.priceAmount) : null,
    imageUrl: product.imageUrl
  }))

export default function StudioSummaryChoices({
  choices,
  className
}: {
  choices: StudioSummaryChoice[]
  className?: string
}) {
  const tiles = choices.flatMap((choice) => choice.items.map((item) => ({ label: choice.label, item })))
  if (tiles.length === 0) return null

  return (
    <ul className={cn('grid sm:grid-cols-2', className)}>
      {tiles.map(({ label, item }, index) => (
        <li
          key={`${label}-${item.id}`}
          className={cn(
            'flex items-center gap-3.5 py-3.5 first:pt-0 sm:py-4',
            index > 0 && 'border-t border-border/70',
            index === 1 && 'sm:border-t-0',
            index % 2 === 1 && 'sm:border-l sm:border-border/70 sm:pl-5',
            index < 2 && 'sm:pt-0'
          )}
        >
          <span className='relative size-14 shrink-0 overflow-hidden rounded-full bg-secondary/40 ring-1 ring-foreground/5'>
            <StudioImage
              src={item.imageUrl}
              alt=''
              fill
              sizes='3.5rem'
              loading='lazy'
              className='object-cover'
              pendingIconClassName='size-5'
            />
          </span>

          <span className='min-w-0'>
            <span className={cn('block', studioSummaryLabelClass)}>{label}</span>
            <span className='line-clamp-2 block text-pretty font-title text-base font-bold leading-snug text-primary'>
              {item.name}
            </span>
            {item.note ? (
              <span className='block text-xs font-medium leading-snug text-muted-foreground'>{item.note}</span>
            ) : null}
          </span>
        </li>
      ))}
    </ul>
  )
}
