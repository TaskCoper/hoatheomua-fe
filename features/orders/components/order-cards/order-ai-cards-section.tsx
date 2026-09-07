'use client'

import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { AiMagicIcon } from '@hugeicons/core-free-icons'
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

  if (cards.length === 0) return null

  return (
    <OrderSectionCard
      icon={AiMagicIcon}
      title={t('orders.cards.heading')}
    >
      <ul className='divide-y divide-border/60'>
        {cards.map((card) => (
          <OrderAiCardRow key={card.id} card={card} onAddVersion={addVersion} onApplyVersion={applyVersion} />
        ))}
      </ul>
    </OrderSectionCard>
  )
}
