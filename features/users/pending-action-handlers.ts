import { addToCart, startBuyNow, type PurchaseDeps } from '@/features/products/purchase'
import { MAX_QUANTITY, MIN_QUANTITY } from '@/stores/cart.store'
import { takePendingAction, type PendingActionType } from './pending-action'

export interface ReplayContext extends PurchaseDeps {
  canUseStorefront: boolean
  canBuyNow: boolean
  hasPhoneNumber: boolean
  notifyUnavailable: () => void
  getProduct: (productId: string) => Promise<{ productName: string | null; hasVariants: boolean } | null>
}

interface PendingPurchase {
  productId: string
  quantity: number
}

interface PendingActionHandler<TPayload> {
  parse: (payload: unknown) => TPayload | null
  run: (payload: TPayload, ctx: ReplayContext) => Promise<unknown>
}

interface PendingActionPayloads {
  'cart.add': PendingPurchase
  'cart.buyNow': PendingPurchase
}

const parsePendingPurchase = (payload: unknown): PendingPurchase | null => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null
  const { productId, quantity } = payload as Record<string, unknown>

  if (typeof productId !== 'string' || productId.trim() === '') return null
  if (typeof quantity !== 'number' || !Number.isInteger(quantity)) return null
  if (quantity < MIN_QUANTITY || quantity > MAX_QUANTITY) return null

  return { productId, quantity }
}

const resolvePurchase = async ({ productId, quantity }: PendingPurchase, ctx: ReplayContext) => {
  const product = await ctx.getProduct(productId)

  if (!product || product.hasVariants) {
    ctx.toast.error(ctx.t('error.somethingWentWrong'))
    return null
  }

  return { productId, productName: product.productName ?? '', quantity }
}

const requireStorefront = (ctx: ReplayContext) => {
  if (ctx.canUseStorefront) return true

  ctx.toast.error(ctx.t('auth.phone.storefrontUnavailable'))
  return false
}

const HANDLERS: { [K in PendingActionType]: PendingActionHandler<PendingActionPayloads[K]> } = {
  'cart.add': {
    parse: parsePendingPurchase,
    run: async (pending, ctx) => {
      if (!requireStorefront(ctx)) return

      const request = await resolvePurchase(pending, ctx)
      if (request) await addToCart(request, ctx)
    }
  },
  'cart.buyNow': {
    parse: parsePendingPurchase,
    // Opens checkout and stops. Placing the order and paying are the buyer's own steps there.
    run: async (pending, ctx) => {
      if (!ctx.canBuyNow) {
        ctx.notifyUnavailable()
        return
      }
      if (!requireStorefront(ctx)) return

      const request = await resolvePurchase(pending, ctx)
      if (request) await startBuyNow(request, ctx)
    }
  }
}

export type PendingActionReplay = 'none' | 'expired' | 'invalid' | 'elsewhere' | 'ran' | 'failed'

const runHandler = async <K extends PendingActionType>(type: K, payload: unknown, ctx: ReplayContext) => {
  const handler: PendingActionHandler<PendingActionPayloads[K]> = HANDLERS[type]

  const parsed = handler.parse(payload)
  if (parsed === null) return 'invalid' as const

  await handler.run(parsed, ctx)
  return 'ran' as const
}

export const replayPendingAction = async (
  ctx: ReplayContext,
  currentPath: string,
  now = Date.now()
): Promise<PendingActionReplay> => {
  const taken = takePendingAction(now)
  if (taken.status !== 'ok') return taken.status

  const { action } = taken

  if (action.path !== currentPath) return 'elsewhere'

  try {
    return await runHandler(action.type, action.payload, ctx)
  } catch {
    return 'failed'
  }
}
