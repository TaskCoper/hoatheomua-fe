'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

export interface AccountFilterOption<Value extends string> {
  value: Value
  label: string
  count?: number
}

interface AccountFilterTabsProps<Value extends string> {
  value: Value
  options: AccountFilterOption<Value>[]
  onChange: (value: Value) => void
  ariaLabel: string
}

/** How much of the chip row dissolves at an end that has more to scroll to. */
const FADE = '2rem'

export function AccountFilterTabs<Value extends string>({
  value,
  options,
  onChange,
  ariaLabel
}: AccountFilterTabsProps<Value>) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState({ start: false, end: false })

  const syncEdges = useCallback(() => {
    const scroller = scrollerRef.current
    if (!scroller) return

    // Sub-pixel widths make an exhausted scroll land a fraction short of the max,
    // which would leave the fade up with nothing behind it.
    const remaining = scroller.scrollWidth - scroller.clientWidth - scroller.scrollLeft
    const next = { start: scroller.scrollLeft > 1, end: remaining > 1 }

    // Every scroll frame calls this; only the two frames where a fade actually
    // appears or disappears should cost a render.
    setEdges((current) => (current.start === next.start && current.end === next.end ? current : next))
  }, [])

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return

    syncEdges()

    const observer = new ResizeObserver(syncEdges)
    observer.observe(scroller)

    return () => observer.disconnect()
  }, [syncEdges, options])

  const maskImage = `linear-gradient(to right, ${
    edges.start ? `transparent 0, #000 ${FADE}` : '#000 0'
  }, ${edges.end ? `#000 calc(100% - ${FADE}), transparent 100%` : '#000 100%'})`

  return (
    <Tabs value={value} onValueChange={(next) => onChange(next as Value)}>
      <div className='w-fit max-w-full overflow-hidden rounded-full bg-muted'>
        <TabsList
          ref={scrollerRef}
          onScroll={syncEdges}
          aria-label={ariaLabel}
          style={{ maskImage, WebkitMaskImage: maskImage }}
          className='h-auto w-full justify-start gap-1 overflow-x-auto rounded-none bg-transparent p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
        >
          {options.map((option) => (
            <TabsTrigger
              key={option.value}
              value={option.value}
              className='flex-none rounded-full px-3 py-1.5 data-[state=active]:bg-card data-[state=active]:font-semibold data-[state=active]:text-primary'
            >
              {option.label}
              {option.count === undefined ? null : (
                <span className='ml-1 rounded-full bg-secondary/60 px-1.5 py-0.5 text-[0.625rem] font-semibold tabular-nums text-secondary-foreground'>
                  {option.count}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    </Tabs>
  )
}

export function AccountEmptyState({
  icon,
  title,
  description,
  action
}: {
  icon: IconSvgElement
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className='flex flex-col items-center gap-4 rounded-3xl bg-card px-6 py-12 text-center shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] ring-1 ring-foreground/5'>
      <span className='bob-tilt-sm grid size-20 place-items-center rounded-full bg-secondary/40 text-primary ring-1 ring-primary/10'>
        <HugeiconsIcon icon={icon} className='size-9' strokeWidth={1.5} />
      </span>
      <h3 className='font-title text-xl font-bold text-primary sm:text-2xl'>{title}</h3>
      <p className='max-w-md text-sm leading-relaxed text-muted-foreground'>{description}</p>
      {action}
    </div>
  )
}

export function AccountEmptyNote({ icon, children }: { icon: IconSvgElement; children: ReactNode }) {
  return (
    <div className='flex flex-col items-center gap-2 rounded-3xl bg-card px-6 py-10 text-center shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] ring-1 ring-foreground/5'>
      <span className='grid size-12 place-items-center rounded-full bg-secondary/40 text-primary ring-1 ring-primary/10'>
        <HugeiconsIcon icon={icon} className='size-5' strokeWidth={1.5} />
      </span>
      <p className='text-sm text-muted-foreground'>{children}</p>
    </div>
  )
}
