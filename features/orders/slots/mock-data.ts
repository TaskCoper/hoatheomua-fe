import type { DeliverySlotAvailability } from '@/types/config.type'

const MOCK_SLOT_LIMIT = 5

const MOCK_SLOTS = [
  { tagId: 229, label: '8h - 10h', occupied: 2 },
  { tagId: 234, label: '10h - 12h', occupied: 4 },
  { tagId: 236, label: '12h - 14h', occupied: 5 },
  { tagId: 237, label: '14h - 16h', occupied: 1 },
  { tagId: 238, label: '16h - 18h', occupied: 3 },
  { tagId: 246, label: '18h - 20h', occupied: 5 },
  { tagId: 270, label: '20h - 22h', occupied: 0 },
  { tagId: 273, label: '22h - 23h', occupied: 1 }
]

export const getMockDeliverySlotAvailability = (date: string): DeliverySlotAvailability => ({
  date,
  slots: MOCK_SLOTS.map((slot) => ({
    ...slot,
    limit: MOCK_SLOT_LIMIT
  }))
})
