'use client'

import { useMemo } from 'react'
import { buildOrderAiCards } from '../cards/order-card-data'
import type { OrderItem } from '../types'

/**
 * The cards of a placed order, read off each line's checkout snapshot. The artworks generated
 * for a card are not here - they are fetched per card, once its studio is opened.
 */
export const useOrderAiCards = (items: OrderItem[]) => {
  const cards = useMemo(() => buildOrderAiCards(items), [items])

  return { cards }
}
