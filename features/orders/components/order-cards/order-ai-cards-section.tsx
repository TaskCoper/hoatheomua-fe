'use client'

import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { AiMagicIcon } from '@hugeicons/core-free-icons'
import { useMemo } from 'react'
import { groupOrderAiCards } from '../../cards/order-card-data'
import { useOrderAiCards } from '../../hooks/use-order-ai-cards'
import type { OrderItem } from '../../types'
import OrderSectionCard from '../order-section-card'
import OrderAiCardRow from './order-ai-card-row'

interface OrderAiCardsSectionProps {
  items: OrderItem[]
}

export default function OrderAiCardsSection({ items }: OrderAiCardsSectionProps) {
  const { t } = useTranslation()
  const { cards, addVersion, applyVersion } = useOrderAiCards(items)

  // An item bought more than once carries a card per unit, so the cards sit under their item.
  const groups = useMemo(() => groupOrderAiCards(items, cards), [items, cards])

  if (groups.length === 0) return null

  return (
    <OrderSectionCard icon={AiMagicIcon} title={t('orders.cards.heading')}>
      <div className='divide-y divide-border/60'>
        {groups.map((group) => (
          <section key={group.orderDetailsId} className='py-4 first:pt-0 last:pb-0'>
            <header className='flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5'>
              <h3 className='min-w-0 font-title text-sm font-bold leading-tight text-primary'>{group.productName}</h3>
              <span className='shrink-0 text-xs text-muted-foreground tabular-nums'>
                {t('orders.cards.itemCarded', { carded: group.carded, quantity: group.quantity })}
              </span>
            </header>

            <ul className='mt-2 divide-y divide-dashed divide-border/60'>
              {group.cards.map((card, index) => (
                <OrderAiCardRow
                  key={card.id}
                  card={card}
                  label={t('orders.cards.cardIndex', { index: index + 1 })}
                  onAddVersion={addVersion}
                  onApplyVersion={applyVersion}
                />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </OrderSectionCard>
  )
}
