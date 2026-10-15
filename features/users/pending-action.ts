export const PENDING_ACTION_KEY = 'pending-action-v1'

/** Long enough to sign up or reset a password, short enough that a forgotten intent never fires later. */
export const PENDING_ACTION_TTL_MS = 15 * 60 * 1000

/** The allowlist. A stored type that is not here is discarded, whatever its payload. */
export const PENDING_ACTION_TYPES = ['cart.add', 'cart.buyNow'] as const

export type PendingActionType = (typeof PENDING_ACTION_TYPES)[number]

export interface PendingAction {
  type: PendingActionType
  payload: unknown
  /** Locale-less pathname the action was started from; it only replays back on that page. */
  path: string
  expiresAt: number
}

export type ReplayGate = 'wait' | 'onAuthPage' | 'cancelled' | 'ready'

export const getReplayGate = (state: {
  mounted: boolean
  isOnAuthPage: boolean
  isGettingMe: boolean
  isAuthenticated: boolean
  hasCartHydrated: boolean
  sawAuthPage: boolean
}): ReplayGate => {
  if (!state.mounted) return 'wait'
  if (state.isOnAuthPage) return 'onAuthPage'
  if (state.isGettingMe) return 'wait'
  if (!state.isAuthenticated) return state.sawAuthPage ? 'cancelled' : 'wait'
  if (!state.hasCartHydrated) return 'wait'

  return 'ready'
}

export type PendingActionTake =
  | { status: 'none' }
  | { status: 'expired' }
  | { status: 'invalid' }
  | { status: 'ok'; action: PendingAction }

const getStorage = (): Storage | null => {
  try {
    return typeof window === 'undefined' ? null : window.sessionStorage
  } catch {
    return null
  }
}

const isPendingActionType = (value: unknown): value is PendingActionType =>
  typeof value === 'string' && (PENDING_ACTION_TYPES as readonly string[]).includes(value)

export const clearPendingAction = (): void => {
  try {
    getStorage()?.removeItem(PENDING_ACTION_KEY)
  } catch {
    // Nothing worth throwing over: a blocked storage just means nothing was saved.
  }
}

/** Returns whether it was stored; the caller still sends the visitor to sign in either way. */
export const savePendingAction = (
  input: { type: PendingActionType; payload: unknown; path: string },
  now = Date.now()
): boolean => {
  const storage = getStorage()
  if (!storage) return false

  const action: PendingAction = { ...input, expiresAt: now + PENDING_ACTION_TTL_MS }

  try {
    storage.setItem(PENDING_ACTION_KEY, JSON.stringify(action))
    return true
  } catch {
    return false
  }
}

export const takePendingAction = (now = Date.now()): PendingActionTake => {
  const storage = getStorage()
  if (!storage) return { status: 'none' }

  let raw: string | null
  try {
    raw = storage.getItem(PENDING_ACTION_KEY)
  } catch {
    return { status: 'none' }
  }

  if (raw === null) return { status: 'none' }
  clearPendingAction()

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { status: 'invalid' }
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return { status: 'invalid' }
  const candidate = parsed as Record<string, unknown>

  if (!isPendingActionType(candidate.type)) return { status: 'invalid' }
  if (typeof candidate.path !== 'string' || !candidate.path.startsWith('/')) return { status: 'invalid' }
  if (typeof candidate.expiresAt !== 'number' || !Number.isFinite(candidate.expiresAt)) return { status: 'invalid' }

  if (candidate.expiresAt <= now) return { status: 'expired' }

  return {
    status: 'ok',
    action: { type: candidate.type, payload: candidate.payload, path: candidate.path, expiresAt: candidate.expiresAt }
  }
}
