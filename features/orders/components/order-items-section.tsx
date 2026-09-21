'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { cn } from '@/shared/utils'
import { ArrowDown01Icon, Mail01Icon, PackageIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useMemo } from 'react'
import { groupOrderAiCards } from '../cards/order-card-data'
import { useOrderAiCards } from '../hooks/use-order-ai-cards'
import type { OrderItem } from '../types'
import OrderAiCardRow from './order-cards/order-ai-card-row'
import { OrderLineItem } from './order-line-item'
import OrderSectionCard from './order-section-card'

interface OrderItemsSectionProps {
  items: OrderItem[]
  canDesignCards: boolean
}

const TOGGLE_SLOT = 'flex shrink-0 justify-end min-w-[4.25rem] sm:min-w-[7.5rem]'

export default function OrderItemsSection({ items, canDesignCards }: OrderItemsSectionProps) {
  const { t } = useTranslation()
  const { cards } = useOrderAiCards(items)

  const cardsByItem = useMemo(() => {
    const groups = groupOrderAiCards(items, cards)
    return new Map(groups.map((group) => [group.orderDetailsId, group]))
  }, [items, cards])

  const openByDefault = useMemo(() => Array.from(cardsByItem.keys()), [cardsByItem])
  const hasCards = cardsByItem.size > 0

  if (items.length === 0) return null

  return (
    <OrderSectionCard
      icon={PackageIcon}
      title={t('orders.checkout.productsHeading')}
      aside={t('orders.checkout.lineCount', { count: items.length })}
    >
      <Accordion type='multiple' defaultValue={openByDefault}>
        {items.map((item) => {
          const group = cardsByItem.get(item.orderDetailsId)
          const line = <OrderLineItem item={item} as='div' size='md' showLineTotal className='min-w-0 flex-1' />

          if (!group) {
            return (
              <div
                key={item.orderDetailsId}
                className='flex items-center gap-2 border-b border-foreground/10 py-3 last:border-b-0 sm:py-4'
              >
                {line}
                {hasCards ? <span aria-hidden='true' className={TOGGLE_SLOT} /> : null}
              </div>
            )
          }

          const isPartial = group.carded < group.quantity

          const pillLabel = isPartial
            ? t('orders.cards.cardedShort', { carded: group.carded, quantity: group.quantity })
            : t('orders.cards.cardCount', { count: group.carded })
          const ariaLabel = isPartial
            ? t('orders.cards.itemCarded', { carded: group.carded, quantity: group.quantity })
            : t('orders.cards.cardCount', { count: group.carded })

          return (
            <AccordionItem
              key={item.orderDetailsId}
              value={item.orderDetailsId}
              className='group/line data-[state=open]:border-b-transparent'
            >
              <div className='-mx-2 rounded-2xl p-3 transition-colors group-data-[state=open]/line:bg-secondary/15'>
                <div className='flex items-center gap-2'>
                  {line}

                  <div className={TOGGLE_SLOT}>
                    <AccordionTrigger
                      hideChevron
                      aria-label={ariaLabel}
                      className={cn(
                        'h-8 flex-none items-center justify-center gap-1.5 rounded-full px-2.5 py-0 font-sans text-xs font-semibold ring-1 transition-colors',
                        'bg-primary/5 text-primary ring-primary/15 hover:bg-primary/10 hover:text-primary sm:text-xs',
                        'data-[state=open]:bg-secondary/60 data-[state=open]:text-secondary-foreground data-[state=open]:ring-primary/10'
                      )}
                    >
                      <HugeiconsIcon icon={Mail01Icon} strokeWidth={2} className='size-3.5 shrink-0' />
                      <span className='hidden sm:inline'>{pillLabel}</span>
                      <span className='sm:hidden'>
                        {isPartial ? `${group.carded}/${group.quantity}` : group.carded}
                      </span>
                      <HugeiconsIcon
                        icon={ArrowDown01Icon}
                        strokeWidth={2}
                        className='size-3.5 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180'
                      />
                    </AccordionTrigger>
                  </div>
                </div>

                <AccordionContent className='pt-0 pb-0'>
                  <ul className='space-y-0.5 rounded-2xl bg-card p-1.5 ring-1 ring-primary/5 sm:ml-[5.75rem]'>
                    {group.cards.map((card) => (
                      <OrderAiCardRow
                        key={card.id}
                        card={card}
                        label={t('orders.cards.cardIndex', { index: card.unit })}
                        canDesign={canDesignCards}
                      />
                    ))}
                  </ul>
                </AccordionContent>
              </div>
            </AccordionItem>
          )
        })}
      </Accordion>
    </OrderSectionCard>
  )
}
