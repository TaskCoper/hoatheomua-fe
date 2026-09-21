'use client'

import { cn } from '@/shared/utils'
import { ArrowDown01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Accordion as AccordionPrimitive } from 'radix-ui'

function Accordion({ ...props }: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot='accordion' {...props} />
}

function AccordionItem({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot='accordion-item'
      className={cn('border-b border-foreground/10 last:border-b-0', className)}
      {...props}
    />
  )
}

interface AccordionTriggerProps extends React.ComponentProps<typeof AccordionPrimitive.Trigger> {
  /** Opt out of the built-in caret when the trigger draws its own - e.g. inside a pill. */
  hideChevron?: boolean
}

function AccordionTrigger({ className, children, hideChevron = false, ...props }: AccordionTriggerProps) {
  return (
    <AccordionPrimitive.Header className='flex'>
      <AccordionPrimitive.Trigger
        data-slot='accordion-trigger'
        className={cn(
          'group flex flex-1 items-start justify-between gap-4 py-4 text-left font-title text-sm font-semibold text-primary outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:rounded-md sm:text-base',
          className
        )}
        {...props}
      >
        {children}
        {hideChevron ? null : (
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            className='size-5 shrink-0 text-primary transition-transform duration-200 group-data-[state=open]:rotate-180'
          />
        )}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({ className, children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot='accordion-content'
      className='overflow-hidden text-xs leading-relaxed text-foreground data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down sm:text-sm'
      {...props}
    >
      <div className={cn('pt-0 pb-4', className)}>{children}</div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger }
