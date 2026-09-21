'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orderDetailCardsQueryKey } from '../queries'
import orderService from '../services'
import type { GetOrderDetailCardsParams, RegenerateAiCardPayload } from '../types'

export const useRegenerateAiCard = ({ orderDetailsId, virtualId }: GetOrderDetailCardsParams) => {
  const queryClient = useQueryClient()

  const { mutate: regenerateAiCard, isPending: isRegeneratingAiCard } = useMutation({
    mutationFn: (body: RegenerateAiCardPayload) => orderService.regenerateAiCard(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderDetailCardsQueryKey({ orderDetailsId, virtualId }) })
    }
  })

  return { regenerateAiCard, isRegeneratingAiCard }
}
