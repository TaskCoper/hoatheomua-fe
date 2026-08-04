'use client'

import { cn } from '@/shared/utils'
import { motion, type Variants } from 'motion/react'
import type { ReactNode } from 'react'

// Shared editorial motion + typography primitives for the redesigned B2B service
// detail sections. Left-aligned, kicker-led headings replace the old centered
// SparkleDivider treatment inside the main reading column.
//
// Signature geometry: every surface is a "petal" - three soft corners and one
// pinched corner (top-left). Keep the pinched corner consistent so the page
// reads as one pressed-flower system rather than a pile of generic cards.

/** Petal surface for cards sitting on the page background. */
export const petalCard =
  'rounded-[1.5rem] rounded-tl-[0.4375rem] border border-primary/10 bg-card/80 shadow-md shadow-primary/5'

/** Hover treatment paired with petalCard on interactive/scannable grids. */
export const petalCardHover =
  'transition-all duration-300 hover:-translate-y-0.5 hover:border-leaf/40 hover:shadow-lg hover:shadow-primary/10'

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 130, damping: 20 } }
}

export const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.03 } }
}

export const cardItem: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 20 } }
}

/** Reveal wrapper shared by every section - plays the stagger once in view. */
export function Reveal({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <motion.div
      initial='hidden'
      whileInView='visible'
      viewport={{ once: true, margin: '-80px' }}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/** Left-aligned section header: leaf-marked kicker over a Playfair display title. */
export function SectionHeading({ title, className }: { title: ReactNode; className?: string }) {
  return (
    <motion.div variants={fadeUp} className={cn('space-y-2.5', className)}>
      <h2 className='text-pretty font-title text-[1.625rem] font-bold leading-[1.15] text-primary sm:text-3xl lg:text-[2.25rem]'>
        {title}
      </h2>
      <span aria-hidden='true' className='block h-px w-16 bg-gradient-to-r from-leaf/70 to-transparent' />
    </motion.div>
  )
}

/**
 * Small amber badge flagging that a section is rendering placeholder / sample
 * content (a service that has no real copy for a canonical block yet).
 */
export function PlaceholderBadge({ children }: { children: ReactNode }) {
  return (
    <span className='inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-warning ring-1 ring-warning/25'>
      <span aria-hidden='true' className='size-1.5 rounded-full bg-warning' />
      {children}
    </span>
  )
}

/**
 * Responsive grid column classes that collapse to fewer tracks for short lists,
 * so a lone item spans the full width instead of hugging one corner. `max` caps
 * how many columns a long list is allowed to fan out to.
 */
export function gridCols(count: number, max: 2 | 3) {
  if (count <= 1) return 'grid-cols-1'
  if (count === 2 || max === 2) return 'sm:grid-cols-2'
  return 'sm:grid-cols-2 lg:grid-cols-3'
}

/** Standard section wrapper carrying the scroll-spy anchor id. */
export function SectionShell({ id, className, children }: { id: string; className?: string; children: ReactNode }) {
  return (
    <section id={id} className={cn('scroll-mt-28', className)}>
      {children}
    </section>
  )
}
