'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orderDetailCardsQueryKey } from '../queries'
import orderService from '../services'
import type { RegenerateAiCardPayload } from '../types'

/**
 * Paints the card again from the design and words the customer just changed. The new artwork
 * is read back from the card list rather than from the response, so a generation that finishes
 * server-side after the call still lands in the strip.
 */
export const useRegenerateAiCard = () => {
  const queryClient = useQueryClient()

  const { mutate: regenerateAiCard, isPending: isRegeneratingAiCard } = useMutation({
    mutationFn: (body: RegenerateAiCardPayload) => orderService.regenerateAiCard(body),
    onSuccess: (_result, body) => {
      queryClient.invalidateQueries({
        queryKey: orderDetailCardsQueryKey({ orderDetailsId: body.orderDetailId, virtualId: body.virtualId })
      })
    }
  })

  return { regenerateAiCard, isRegeneratingAiCard }
}
