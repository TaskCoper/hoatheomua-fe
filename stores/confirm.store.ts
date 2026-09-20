import { create } from 'zustand'

export interface ConfirmOptions {
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
}

interface ConfirmState {
  isOpen: boolean
  options: ConfirmOptions
  /** Settled by whichever button is pressed - a dismissal counts as a no. */
  resolver: ((confirmed: boolean) => void) | null
  confirm: (options?: ConfirmOptions) => Promise<boolean>
  handleConfirm: () => void
  handleCancel: () => void
}

/**
 * One confirmation dialog for the whole app: `await confirm({...})` anywhere, and
 * `<ConfirmDialog />` in the layout renders it. Copy left out falls back to the common
 * strings - the dialog resolves those, so the store stays free of the locale.
 */
export const useConfirmStore = create<ConfirmState>((set, get) => ({
  isOpen: false,
  options: {},
  resolver: null,
  confirm: (options = {}) =>
    new Promise<boolean>((resolve) => {
      // A second call while one is open would strand the first promise, so it is answered.
      get().resolver?.(false)
      set({ isOpen: true, options, resolver: resolve })
    }),
  handleConfirm: () => {
    get().resolver?.(true)
    set({ isOpen: false, resolver: null })
  },
  handleCancel: () => {
    get().resolver?.(false)
    set({ isOpen: false, resolver: null })
  }
}))
