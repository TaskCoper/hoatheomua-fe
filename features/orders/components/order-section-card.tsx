import { cn } from '@/shared/utils'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'

interface OrderSectionCardProps {
  icon: IconSvgElement
  title: string
  aside?: React.ReactNode
  className?: string
  children: React.ReactNode
}

export default function OrderSectionCard({ icon, title, aside, className, children }: OrderSectionCardProps) {
  return (
    <section
      className={cn(
        'rounded-3xl bg-card p-3 shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] ring-1 ring-foreground/5 sm:p-4',
        className
      )}
    >
      <header className='mb-4 flex items-center justify-between gap-3 border-b border-border/70 pb-3'>
        <div className='flex items-center gap-2'>
          <span className='grid size-8 place-items-center rounded-full bg-secondary/40 text-primary ring-1 ring-primary/10'>
            <HugeiconsIcon icon={icon} strokeWidth={1.75} className='size-4' />
          </span>
          <h2 className='font-title text-sm font-semibold sm:text-base'>{title}</h2>
        </div>
        {aside ? <div className='shrink-0 text-xs text-muted-foreground'>{aside}</div> : null}
      </header>
      {children}
    </section>
  )
}
