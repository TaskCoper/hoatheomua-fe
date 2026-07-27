import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export const CART_STORAGE_KEY = 'shopping-cart-v1'
export const CART_PERSIST_VERSION = 2

export const MIN_QUANTITY = 1
export const MAX_QUANTITY = 99

export type CartSelectedOptions = Record<string, string>

export interface CartItem {
  lineId: string
  productId: string
  variantId: number | null
  quantity: number
  selectedOptions: CartSelectedOptions
  addedAt: string
  updatedAt: string
}

export interface AddCartItemInput {
  productId: string
  variantId?: number | null
  quantity?: number
  selectedOptions?: CartSelectedOptions
}

export interface CheckoutCartItem {
  productId: string
  variantId: number | null
  quantity: number
  selectedOptions: CartSelectedOptions
}

interface CartState {
  items: CartItem[]
  hasHydrated: boolean

  addItem: (input: AddCartItemInput) => CartItem
  removeItem: (lineId: string) => void
  updateQuantity: (lineId: string, quantity: number) => void
  incrementItem: (lineId: string) => void
  decrementItem: (lineId: string) => void
  clearCart: () => void
  getTotalItems: () => number
  setHasHydrated: (value: boolean) => void
}

function sanitizeQuantity(value: unknown): number {
  const numeric = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(numeric)) return MIN_QUANTITY
  const truncated = Math.trunc(numeric)
  if (truncated < MIN_QUANTITY) return MIN_QUANTITY
  if (truncated > MAX_QUANTITY) return MAX_QUANTITY
  return truncated
}

function normalizeSelectedOptions(value: unknown): CartSelectedOptions {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([key, val]) => typeof key === 'string' && typeof val === 'string')
    .sort(([a], [b]) => a.localeCompare(b))
  return Object.fromEntries(entries) as CartSelectedOptions
}

export function buildLineId(productId: string, variantId: number | null, selectedOptions: CartSelectedOptions): string {
  const normalizedOptions = normalizeSelectedOptions(selectedOptions)
  const optionsKey = Object.keys(normalizedOptions).length ? JSON.stringify(Object.entries(normalizedOptions)) : ''
  return `p:${productId}|v:${variantId ?? 'none'}|o:${optionsKey}`
}

function nowIso(): string {
  return new Date().toISOString()
}

export function sanitizeItems(input: unknown): CartItem[] {
  if (!Array.isArray(input)) return []
  const seen = new Set<string>()
  const result: CartItem[] = []

  for (const raw of input) {
    if (!raw || typeof raw !== 'object') continue
    const candidate = raw as Record<string, unknown>

    const productId = typeof candidate.productId === 'string' ? candidate.productId : ''
    if (!productId) continue

    const variantId =
      typeof candidate.variantId === 'number' && Number.isFinite(candidate.variantId) ? candidate.variantId : null

    const selectedOptions = normalizeSelectedOptions(candidate.selectedOptions)
    const quantity = sanitizeQuantity(candidate.quantity)

    const lineId =
      typeof candidate.lineId === 'string' && candidate.lineId.length > 0
        ? candidate.lineId
        : buildLineId(productId, variantId, selectedOptions)

    if (seen.has(lineId)) continue
    seen.add(lineId)

    const addedAt = typeof candidate.addedAt === 'string' && candidate.addedAt.length > 0 ? candidate.addedAt : nowIso()
    const updatedAt =
      typeof candidate.updatedAt === 'string' && candidate.updatedAt.length > 0 ? candidate.updatedAt : addedAt

    result.push({
      lineId,
      productId,
      variantId,
      quantity,
      selectedOptions,
      addedAt,
      updatedAt
    })
  }

  return result
}

export function toCheckoutPayload(items: CartItem[]): { items: CheckoutCartItem[] } {
  return {
    items: items.map(({ productId, variantId, quantity, selectedOptions }) => ({
      productId,
      variantId,
      quantity,
      selectedOptions
    }))
  }
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      hasHydrated: false,

      addItem: (input) => {
        const productId = input.productId
        const variantId = input.variantId ?? null
        const selectedOptions = normalizeSelectedOptions(input.selectedOptions)
        const requestedQuantity = sanitizeQuantity(input.quantity ?? 1)
        const lineId = buildLineId(productId, variantId, selectedOptions)
        const timestamp = nowIso()

        const existing = get().items.find((item) => item.lineId === lineId)

        if (existing) {
          const nextQuantity = sanitizeQuantity(existing.quantity + requestedQuantity)
          const merged: CartItem = {
            ...existing,
            quantity: nextQuantity,
            updatedAt: timestamp
          }
          set({
            items: get().items.map((item) => (item.lineId === lineId ? merged : item))
          })
          return merged
        }

        const created: CartItem = {
          lineId,
          productId,
          variantId,
          quantity: requestedQuantity,
          selectedOptions,
          addedAt: timestamp,
          updatedAt: timestamp
        }
        set({ items: [...get().items, created] })
        return created
      },

      removeItem: (lineId) => {
        set({ items: get().items.filter((item) => item.lineId !== lineId) })
      },

      updateQuantity: (lineId, quantity) => {
        const nextQuantity = sanitizeQuantity(quantity)
        const timestamp = nowIso()
        set({
          items: get().items.map((item) =>
            item.lineId === lineId ? { ...item, quantity: nextQuantity, updatedAt: timestamp } : item
          )
        })
      },

      incrementItem: (lineId) => {
        const timestamp = nowIso()
        set({
          items: get().items.map((item) =>
            item.lineId === lineId
              ? { ...item, quantity: sanitizeQuantity(item.quantity + 1), updatedAt: timestamp }
              : item
          )
        })
      },

      decrementItem: (lineId) => {
        const timestamp = nowIso()
        const current = get().items.find((item) => item.lineId === lineId)
        if (!current) return

        const nextQuantity = current.quantity - 1
        if (nextQuantity <= 0) {
          set({ items: get().items.filter((item) => item.lineId !== lineId) })
          return
        }

        set({
          items: get().items.map((item) =>
            item.lineId === lineId ? { ...item, quantity: sanitizeQuantity(nextQuantity), updatedAt: timestamp } : item
          )
        })
      },

      clearCart: () => {
        set({ items: [] })
      },

      getTotalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

      setHasHydrated: (value) => set({ hasHydrated: value })
    }),
    {
      name: CART_STORAGE_KEY,
      version: CART_PERSIST_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      merge: (persisted, current) => {
        const persistedItems =
          persisted && typeof persisted === 'object' && 'items' in (persisted as Record<string, unknown>)
            ? (persisted as { items: unknown }).items
            : []
        return {
          ...current,
          items: sanitizeItems(persistedItems)
        }
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      }
    }
  )
)
