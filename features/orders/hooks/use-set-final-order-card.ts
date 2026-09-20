'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import orderService from '../services'
import type { SetFinalGeneratedCardPayload } from '../types'

/**
 * Keeps one generation as the card that gets printed. The choice lives on the order's
 * snapshot, so the order itself is refetched - that is where the tick is read back from.
 */
export const useSetFinalOrderCard = () => {
  const queryClient = useQueryClient()

  const { mutate: setFinalOrderCard, isPending: isSettingFinalOrderCard } = useMutation({
    mutationFn: (body: SetFinalGeneratedCardPayload) => orderService.setFinalGeneratedCard(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order'] })
    }
  })

  return { setFinalOrderCard, isSettingFinalOrderCard }
}
