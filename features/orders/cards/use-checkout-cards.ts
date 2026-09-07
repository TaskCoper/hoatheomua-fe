'use client'

import { useCallback, useEffect } from 'react'
import { useFieldArray, type Control } from 'react-hook-form'
import { useGeneratedCards } from '../hooks/use-generated-cards'
import type { CheckoutFormValues } from '../validations'
import type { CheckoutCard } from './types'

interface UseCheckoutCardsArgs {
  control: Control<CheckoutFormValues>
  lineIds: string[]
}

export const useCheckoutCards = ({ control, lineIds }: UseCheckoutCardsArgs) => {
  const { fields, append, update, remove } = useFieldArray({ control, name: 'cards' })
  const { generatedCards } = useGeneratedCards()

  // Dropping a line from the cart has to drop its cards too
  useEffect(() => {
    const orphaned = fields.reduce<number[]>(
      (indexes, card, index) =>
        card.type !== 'standard' && !lineIds.includes(card.lineId) ? [...indexes, index] : indexes,
      []
    )

    if (orphaned.length > 0) remove(orphaned)
  }, [fields, lineIds, remove])

  const saveCard = useCallback(
    (card: CheckoutCard, editingIndex: number | null) => {
      if (editingIndex === null) {
        append(card)
        return
      }
      update(editingIndex, card)
    },
    [append, update]
  )

  return { cards: fields, generatedCards, saveCard, removeCard: remove }
}
