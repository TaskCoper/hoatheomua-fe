'use client'

import { useCallback, useEffect, useMemo } from 'react'
import { useFieldArray, type Control } from 'react-hook-form'
import { useGeneratedCards } from '../hooks/use-generated-cards'
import type { CheckoutFormValues } from '../validations'
import { getCardAllowance } from './card-data'
import type { CheckoutCard, CheckoutCardField } from './types'

interface UseCheckoutCardsArgs {
  control: Control<CheckoutFormValues>
  /** The checkout lines cards hang off - both which ones exist and how many units each carries. */
  lines: { lineId: string; quantity: number }[]
}

/** `fields` carries react-hook-form's own `id`, which must not leak back into the form value. */
const withQuantity = (card: CheckoutCardField, quantity: number): CheckoutCard => {
  const value = { ...card, quantity }
  delete (value as Partial<CheckoutCardField>).id
  return value
}

export const useCheckoutCards = ({ control, lines }: UseCheckoutCardsArgs) => {
  const { fields, append, update, remove } = useFieldArray({ control, name: 'cards' })
  const { generatedCards } = useGeneratedCards()

  const quantityByLineId = useMemo(() => new Map(lines.map((line) => [line.lineId, line.quantity])), [lines])
  const allowance = useMemo(() => getCardAllowance(lines), [lines])

  // Dropping a line from the cart has to drop its cards too, and shrinking one has to pull its
  // cards back under the new cap - a line prints one card per unit, never more.
  useEffect(() => {
    const orphaned: number[] = []
    const clamped: { index: number; card: CheckoutCardField; quantity: number }[] = []

    const left = new Map(quantityByLineId)
    let standardLeft = allowance

    fields.forEach((card, index) => {
      const available = card.type === 'standard' ? standardLeft : left.get(card.lineId)

      if (available === undefined || available < 1) {
        orphaned.push(index)
        return
      }

      const quantity = Math.min(card.quantity, available)
      if (card.type === 'standard') standardLeft -= quantity
      else left.set(card.lineId, available - quantity)

      if (quantity !== card.quantity) clamped.push({ index, card, quantity })
    })

    // Removing shifts every later index, so a pass never mixes the two - the effect reruns.
    if (orphaned.length > 0) {
      remove(orphaned)
      return
    }

    clamped.forEach(({ index, card, quantity }) => update(index, withQuantity(card, quantity)))
  }, [fields, quantityByLineId, allowance, remove, update])

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
