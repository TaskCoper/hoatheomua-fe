'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { AiMagicIcon, PackageIcon } from '@hugeicons/core-free-icons'
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
  /** Only a paid order opens the card studio; before that the cards are read-only. */
  canDesignCards: boolean
}

/** The ordered products, each one unfolding the cards printed for it. */
export default function OrderItemsSection({ items, canDesignCards }: OrderItemsSectionProps) {
  const { t } = useTranslation()
  const { cards } = useOrderAiCards(items)

  // A card belongs to one line, so it is shown under that line rather than in a
  // section of its own - the product name is then the row above it, not a repeat.
  const cardsByItem = useMemo(() => {
    const groups = groupOrderAiCards(items, cards)
    return new Map(groups.map((group) => [group.orderDetailsId, group]))
  }, [items, cards])

  // Cards are the point of the section, so a carded line starts unfolded - the
  // toggle is there to tidy them away, not to go looking for them.
  const openByDefault = useMemo(() => Array.from(cardsByItem.keys()), [cardsByItem])

  // An order with no cards anywhere has no toggle column to line up against, so
  // nothing holds its place either - the totals sit at the edge like every other card.
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

          // Only a carded line folds open; the rest keep the same row without a
          // toggle, so the list stays one rhythm either way.
          if (!group) {
            return (
              <div
                key={item.orderDetailsId}
                className='flex items-center gap-2 border-b border-foreground/10 py-3 last:border-b-0 sm:py-4'
              >
                {line}
                {/* Holds the toggle's place so every line total stays on one column. */}
                {hasCards ? <span aria-hidden='true' className='min-w-[4.5rem] shrink-0 sm:min-w-[7rem]' /> : null}
              </div>
            )
          }

          // A line bought twice and carded twice is "2/2 carded", not "2 cards" - what the
          // customer wants to know is whether every bouquet in the line carries one.
          const isPartial = group.carded < group.quantity
          const cardedLabel = isPartial
            ? t('orders.cards.itemCarded', { carded: group.carded, quantity: group.quantity })
            : t('orders.cards.cardCount', { count: group.carded })

          return (
            <AccordionItem key={item.orderDetailsId} value={item.orderDetailsId}>
              <div className='flex items-center gap-2 py-3 sm:py-4'>
                {line}

                <AccordionTrigger
                  className='min-w-[4.5rem] grow-0 items-center gap-1.5 py-0 sm:min-w-[7rem]'
                  aria-label={cardedLabel}
                >
                  {/* The card count doubles as the affordance: it says these exist and opens them. */}
                  <span className='inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary ring-1 ring-primary/15'>
                    <HugeiconsIcon icon={AiMagicIcon} strokeWidth={2} className='size-3.5 shrink-0' />
                    <span className='hidden tabular-nums sm:inline'>{cardedLabel}</span>
                    <span className='tabular-nums sm:hidden'>
                      {isPartial ? `${group.carded}/${group.quantity}` : group.carded}
                    </span>
                  </span>
                </AccordionTrigger>
              </div>

              <AccordionContent className='pt-0 pb-3 sm:pb-4'>
                <ul className='space-y-1 sm:ml-[5.75rem]'>
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
            </AccordionItem>
          )
        })}
      </Accordion>
    </OrderSectionCard>
  )
}
