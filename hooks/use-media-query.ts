'use client'

import { useCallback, useSyncExternalStore } from 'react'

type Entry = { mql: MediaQueryList; listeners: Set<() => void>; teardown: () => void }

const registry = new Map<string, Entry>()

const getEntry = (query: string): Entry => {
  const existing = registry.get(query)
  if (existing) return existing

  const mql = window.matchMedia(query)
  const listeners = new Set<() => void>()
  const onChange = () => listeners.forEach((listener) => listener())
  mql.addEventListener('change', onChange)

  const entry: Entry = {
    mql,
    listeners,
    teardown: () => {
      mql.removeEventListener('change', onChange)
      registry.delete(query)
    }
  }
  registry.set(query, entry)
  return entry
}

export function useMediaQuery(query: string, serverValue = false): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const entry = getEntry(query)
      entry.listeners.add(onStoreChange)
      return () => {
        entry.listeners.delete(onStoreChange)
        if (entry.listeners.size === 0) entry.teardown()
      }
    },
    [query]
  )

  const getSnapshot = useCallback(() => getEntry(query).mql.matches, [query])
  const getServerSnapshot = useCallback(() => serverValue, [serverValue])

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const

export type Breakpoint = keyof typeof BREAKPOINTS

export function useIsAtLeast(breakpoint: Breakpoint, serverValue = true): boolean {
  return useMediaQuery(`(min-width: ${BREAKPOINTS[breakpoint]}px)`, serverValue)
}

export function useIsBelow(breakpoint: Breakpoint, serverValue = false): boolean {
  return useMediaQuery(`(max-width: ${BREAKPOINTS[breakpoint] - 0.02}px)`, serverValue)
}

export function useIsCompact(): boolean {
  return useIsBelow('lg')
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)', false)
}
