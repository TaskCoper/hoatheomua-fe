'use client'

import { motion } from 'motion/react'
import { useState, type ReactNode } from 'react'

export type TabKey = 'description' | 'specs' | 'care' | 'landing'

export default function ProductDetailsTabsShell({
  ariaLabel,
  tabs,
  panels
}: {
  ariaLabel: string
  tabs: { key: TabKey; label: string }[]
  panels: Partial<Record<TabKey, ReactNode>>
}) {
  const [active, setActive] = useState<TabKey>('description')

  return (
    <div className='mt-8'>
      <div
        role='tablist'
        aria-label={ariaLabel}
        className='rail-x -mx-4 items-center gap-1 border-b border-border px-4 sm:mx-0 sm:flex-wrap sm:px-0'
      >
        {tabs.map((tab) => {
          const isActive = active === tab.key

          return (
            <button
              key={tab.key}
              type='button'
              role='tab'
              aria-selected={isActive}
              onClick={() => setActive(tab.key)}
              className='relative cursor-pointer px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors'
              style={{ color: isActive ? 'var(--primary)' : 'var(--muted-foreground)' }}
            >
              {tab.label}

              {isActive ? (
                <motion.span
                  layoutId='product-tab-underline'
                  className='absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary'
                  transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                />
              ) : null}
            </button>
          )
        })}
      </div>

      <div role='tabpanel' className='pt-4'>
        {panels[active] ?? null}
      </div>
    </div>
  )
}
