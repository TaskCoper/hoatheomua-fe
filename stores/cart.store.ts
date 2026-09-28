import { invalidateSellableQuantity } from '@/features/products/invalidate-stock'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export const CART_STORAGE_KEY = 'shopping-cart-v1'
export const CART_PERSIST_VERSION = 2

export const MIN_QUANTITY = 1
export const MAX_QUANTITY = 99

export type CartSelectedOptions = Record<string, string>

export interface CartAiFlowerTrim {
  productId: string
  name: string
  imageUrl: string | null
  priceAmount: number
}

/**
 * What makes a line a bouquet designed in the studio rather than a catalogue product.
 * `productId` stays the real product the design was built on - it is what stock,
 * shipping and the order item are priced against - and this rides alongside it.
 */
export interface CartAiFlower {
  /** Keys `GET v1/ai-flowers/{id}/composition`, and the id the order carries per bouquet. */
  generatedFlowerId: string
  /** Back to where the design was made: `/products/{rootProductId}/studio/{sessionId}`. */
  sessionId: string
  rootProductId: string
  /**
   * What the studio quoted: the product, the extra stems the buyer added, and the ribbon
   * and wrapping paper it was generated with. The composition endpoint prices nothing and
   * none of the extras are on the product row, so this snapshot is the only number the
   * cart can show for the line.
   */
  unitPrice: number
  /** Part of the bouquet, not an add-on - nothing in the bag or at checkout drops them. */
  ribbon: CartAiFlowerTrim | null
  wrap: CartAiFlowerTrim | null
}

export interface CartItem {
  lineId: string
  productId: string
  variantId: number | null
  quantity: number
  selectedOptions: CartSelectedOptions
  /** `null` for an ordinary catalogue line. */
  aiFlower: CartAiFlower | null
  addedAt: string
  updatedAt: string
}

export interface AddCartItemInput {
  productId: string
  variantId?: number | null
  quantity?: number
  selectedOptions?: CartSelectedOptions
  aiFlower?: CartAiFlower | null
}

export interface CheckoutCartItem {
  productId: string
  variantId: number | null
  quantity: number
  selectedOptions: CartSelectedOptions
  aiFlower: CartAiFlower | null
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

/** A design added before the trims were carried has none; it keeps the price it was added at. */
function normalizeAiFlowerTrim(value: unknown): CartAiFlowerTrim | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const candidate = value as Record<string, unknown>

  const productId = typeof candidate.productId === 'string' ? candidate.productId : ''
  const name = typeof candidate.name === 'string' ? candidate.name.trim() : ''
  if (!productId || !name) return null

  const priceAmount =
    typeof candidate.priceAmount === 'number' && Number.isFinite(candidate.priceAmount)
      ? Math.max(0, candidate.priceAmount)
      : 0

  return {
    productId,
    name,
    imageUrl: typeof candidate.imageUrl === 'string' && candidate.imageUrl ? candidate.imageUrl : null,
    priceAmount
  }
}

function normalizeAiFlower(value: unknown): CartAiFlower | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const candidate = value as Record<string, unknown>

  const generatedFlowerId = typeof candidate.generatedFlowerId === 'string' ? candidate.generatedFlowerId : ''
  if (!generatedFlowerId) return null

  const unitPrice =
    typeof candidate.unitPrice === 'number' && Number.isFinite(candidate.unitPrice)
      ? Math.max(0, candidate.unitPrice)
      : 0

  return {
    generatedFlowerId,
    sessionId: typeof candidate.sessionId === 'string' ? candidate.sessionId : '',
    rootProductId: typeof candidate.rootProductId === 'string' ? candidate.rootProductId : '',
    unitPrice,
    ribbon: normalizeAiFlowerTrim(candidate.ribbon),
    wrap: normalizeAiFlowerTrim(candidate.wrap)
  }
}

/**
 * Two designs can sit on the same product, so the generated flower joins the key -
 * without it a second bouquet would merge into the first. Catalogue lines keep the
 * key they have always had, which is what already sits in storage.
 */
export function buildLineId(
  productId: string,
  variantId: number | null,
  selectedOptions: CartSelectedOptions,
  generatedFlowerId?: string | null
): string {
  const normalizedOptions = normalizeSelectedOptions(selectedOptions)
  const optionsKey = Object.keys(normalizedOptions).length ? JSON.stringify(Object.entries(normalizedOptions)) : ''
  const base = `p:${productId}|v:${variantId ?? 'none'}|o:${optionsKey}`
  return generatedFlowerId ? `${base}|g:${generatedFlowerId}` : base
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
    const aiFlower = normalizeAiFlower(candidate.aiFlower)

    const lineId =
      typeof candidate.lineId === 'string' && candidate.lineId.length > 0
        ? candidate.lineId
        : buildLineId(productId, variantId, selectedOptions, aiFlower?.generatedFlowerId)

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
      aiFlower,
      addedAt,
      updatedAt
    })
  }

  return result
}

export function toCheckoutPayload(items: CartItem[]): { items: CheckoutCartItem[] } {
  return {
    items: items.map(({ productId, variantId, quantity, selectedOptions, aiFlower }) => ({
      productId,
      variantId,
      quantity,
      selectedOptions,
      aiFlower
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
        const aiFlower = normalizeAiFlower(input.aiFlower)
        const lineId = buildLineId(productId, variantId, selectedOptions, aiFlower?.generatedFlowerId)
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
          aiFlower,
          addedAt: timestamp,
          updatedAt: timestamp
        }
        set({ items: [...get().items, created] })
        return created
      },

      // `addItem` is deliberately not invalidating: every caller runs
      // `verifySellableQuantity` first, which already fetches fresh numbers and
      // pushes them into every stock cache. A second pass here would refetch what
      // just landed.

      removeItem: (lineId) => {
        set({ items: get().items.filter((item) => item.lineId !== lineId) })
        invalidateSellableQuantity()
      },

      updateQuantity: (lineId, quantity) => {
        const nextQuantity = sanitizeQuantity(quantity)
        const timestamp = nowIso()
        set({
          items: get().items.map((item) =>
            item.lineId === lineId ? { ...item, quantity: nextQuantity, updatedAt: timestamp } : item
          )
        })
        invalidateSellableQuantity()
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
        invalidateSellableQuantity()
      },

      decrementItem: (lineId) => {
        const timestamp = nowIso()
        const current = get().items.find((item) => item.lineId === lineId)
        if (!current) return

        const nextQuantity = current.quantity - 1
        if (nextQuantity <= 0) {
          set({ items: get().items.filter((item) => item.lineId !== lineId) })
          invalidateSellableQuantity()
          return
        }

        set({
          items: get().items.map((item) =>
            item.lineId === lineId ? { ...item, quantity: sanitizeQuantity(nextQuantity), updatedAt: timestamp } : item
          )
        })
        invalidateSellableQuantity()
      },

      clearCart: () => {
        set({ items: [] })
        invalidateSellableQuantity()
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
