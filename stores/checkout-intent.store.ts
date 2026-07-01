import type { CartItem } from '@/stores/cart.store'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type CheckoutIntentSource = 'cart' | 'buy-now'

interface CheckoutIntentState {
  items: CartItem[]
  source: CheckoutIntentSource | null
  setIntent: (items: CartItem[], source: CheckoutIntentSource) => void
  clear: () => void
}

export const useCheckoutIntentStore = create<CheckoutIntentState>()(
  persist(
    (set) => ({
      items: [],
      source: null,
      setIntent: (items, source) => set({ items, source }),
      clear: () => set({ items: [], source: null })
    }),
    {
      name: 'checkout-intent-v1',
      storage: createJSONStorage(() => sessionStorage)
    }
  )
)
