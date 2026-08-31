import { useCartStore } from '@/stores/cart.store'

export function useCartHydrated(): boolean {
  return useCartStore((state) => state.hasHydrated)
}
