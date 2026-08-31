import { useSyncExternalStore } from 'react'

const subscribeToHydration = () => () => {}
const getClientSnapshot = () => true
const getServerSnapshot = () => false

/**
 * True once the component has hydrated on the client, false during SSR and the
 * first client render. Use to gate UI that reads client-only state (persisted
 * query caches, localStorage, etc.) so the first client render matches the
 * server output instead of triggering a hydration mismatch.
 */
export function useHasMounted() {
  return useSyncExternalStore(subscribeToHydration, getClientSnapshot, getServerSnapshot)
}
