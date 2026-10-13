import configService from '@/services/config.service'
import { formatDate } from '@/lib/date'
import { useQuery } from '@tanstack/react-query'
import { USE_MOCK_DELIVERY_SLOTS } from '@/features/orders/slots/config'
import { getMockDeliverySlotAvailability } from '@/features/orders/slots/mock-data'

export const useGetDeliverySlotAvailability = (date: Date | string | null) => {
  const dateKey = formatDate(date ?? new Date(), 'iso')

  const query = useQuery({
    queryKey: ['delivery-slots', 'availability', dateKey],
    queryFn: () => configService.getDeliverySlotAvailability({ date: dateKey }),
    enabled: Boolean(dateKey) && !USE_MOCK_DELIVERY_SLOTS
  })

  const availability = USE_MOCK_DELIVERY_SLOTS ? getMockDeliverySlotAvailability(dateKey) : query.data

  return {
    slots: availability?.slots ?? [],
    date: availability?.date ?? dateKey,
    isGettingDeliverySlotAvailability: !USE_MOCK_DELIVERY_SLOTS && query.isLoading,
    isDeliverySlotAvailabilityError: !USE_MOCK_DELIVERY_SLOTS && query.isError
  }
}
