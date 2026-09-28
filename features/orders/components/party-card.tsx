'use client'

import { cn } from '@/shared/utils'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import type { ComponentProps, ReactNode } from 'react'

export interface PartyCardContent {
  icon: IconSvgElement
  /** Primary line - the person's name. Falls back to `emptyHint` when blank. */
  title?: string | null
  /** Secondary lines: phone, address, … Blank entries are dropped. */
  lines?: (string | null | undefined)[]
  badge?: ReactNode
  /** Shown in place of the title/lines when there's nothing to name yet. */
  emptyHint?: string
  /**
   * Marks this card as the one in use. Renders a radio dot - decorative, since
   * the card itself is the control that picks it.
   */
  selected?: boolean
  /** Trailing affordance - e.g. the "change" hint on the pickable card. */
  action?: ReactNode
}

const cardShell =
  'flex w-full items-start gap-2 rounded-2xl border border-border bg-background/50 pl-2 pr-4 py-2 text-left transition-colors'

function PartyCardBody({ icon, title, lines, badge, emptyHint, selected, action }: PartyCardContent) {
  const details = lines?.filter((line): line is string => Boolean(line)) ?? []
  const isEmpty = !title && details.length === 0

  return (
    <>
      <span className='flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary/50 text-secondary-foreground'>
        <HugeiconsIcon icon={icon} strokeWidth={2} className='size-4.5' />
      </span>
      <span className='min-w-0 flex-1 space-y-0.5'>
        {isEmpty ? (
          <span className='block text-sm text-muted-foreground'>{emptyHint}</span>
        ) : (
          <>
            <span className='flex flex-wrap items-center gap-2'>
              <span className='min-w-0 truncate text-sm font-medium'>{title}</span>
              {badge}
            </span>

            {details.map((line) => (
              <span key={line} className='block truncate text-xs text-muted-foreground'>
                {line}
              </span>
            ))}
          </>
        )}
      </span>

      {action ? <span className='shrink-0 self-center'>{action}</span> : null}

      {selected !== undefined ? (
        <span
          aria-hidden
          className={cn(
            'relative flex size-4 shrink-0 items-center justify-center self-center rounded-full',
            selected ? 'bg-primary' : 'bg-input/90'
          )}
        >
          {selected ? <span className='size-2 rounded-full bg-primary-foreground dark:size-2.5' /> : null}
        </span>
      ) : null}
    </>
  )
}

export function PartyCard({ className, ...content }: PartyCardContent & { className?: string }) {
  return (
    <div className={cn(cardShell, content.selected && 'border-primary/50', className)}>
      <PartyCardBody {...content} />
    </div>
  )
}

export function PartyCardButton({
  className,
  icon,
  title,
  lines,
  badge,
  emptyHint,
  selected,
  action,
  ...props
}: PartyCardContent & Omit<ComponentProps<'button'>, 'title'>) {
  return (
    <button
      type='button'
      className={cn(
        cardShell,
        'cursor-pointer hover:border-primary/60 hover:bg-accent/40 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
        selected && 'border-primary/50',
        className
      )}
      {...props}
    >
      <PartyCardBody
        icon={icon}
        title={title}
        lines={lines}
        badge={badge}
        emptyHint={emptyHint}
        selected={selected}
        action={action}
      />
    </button>
  )
}
