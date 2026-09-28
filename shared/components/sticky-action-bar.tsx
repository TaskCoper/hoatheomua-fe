'use client'

import { cn } from '@/shared/utils'
import { useLayoutEffect, useState, type ReactNode } from 'react'

export default function StickyActionBar({
  children,
  className,
  compactOnly = true,
  hideOnKeyboard = true,
  'aria-label': ariaLabel
}: {
  children: ReactNode
  className?: string
  compactOnly?: boolean
  hideOnKeyboard?: boolean
  'aria-label'?: string
}) {
  const [element, setElement] = useState<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    if (!element) return

    const root = document.documentElement

    const observer = new ResizeObserver(() => {
      root.style.setProperty('--app-bottom-bar-height', `${element.getBoundingClientRect().height}px`)
    })
    observer.observe(element)

    return () => {
      observer.disconnect()
      root.style.removeProperty('--app-bottom-bar-height')
    }
  }, [element])

  return (
    <div
      ref={setElement}
      role='group'
      aria-label={ariaLabel}
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t border-secondary/40 bg-background/90 px-4 pt-3 pb-safe-band',
        'supports-backdrop-filter:bg-background/75 supports-backdrop-filter:backdrop-blur-md',
        'motion-safe:animate-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-200',
        compactOnly && 'lg:hidden',
        hideOnKeyboard && 'hide-on-keyboard',
        className
      )}
    >
      {children}
    </div>
  )
}
