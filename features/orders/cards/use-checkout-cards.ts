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
    let freeLeft = allowance

    /** Returns how many units the card keeps, queueing it for removal when none are left. */
    const take = (index: number, card: CheckoutCardField, available: number | undefined): number => {
      if (available === undefined || available < 1) {
        orphaned.push(index)
        return 0
      }

      const quantity = Math.min(card.quantity, available)
      if (quantity !== card.quantity) clamped.push({ index, card, quantity })
      return quantity
    }

    // Paid cards are settled first: they are bound to a line the order already paid for, and the
    // units they take stop being free - so the standard cards only share what the pool has left.
    fields.forEach((card, index) => {
      if (card.type === 'standard') return

      const lineLeft = left.get(card.lineId)
      const quantity = take(index, card, lineLeft)

      left.set(card.lineId, (lineLeft ?? 0) - quantity)
      freeLeft -= quantity
    })

    fields.forEach((card, index) => {
      if (card.type !== 'standard') return
      freeLeft -= take(index, card, freeLeft)
    })

    // Removing shifts every later index, so a pass never mixes the two - the effect reruns.
    if (orphaned.length > 0) {
      remove(orphaned.sort((a, b) => a - b))
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
