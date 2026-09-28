'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/shared/utils'
import { Cancel01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Dialog as DialogPrimitive } from 'radix-ui'
import type { ComponentProps } from 'react'

const Root = DialogPrimitive.Root
const Portal = DialogPrimitive.Portal

function Trigger(props: ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot='dialog-trigger' {...props} />
}

function Close(props: ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot='dialog-close' {...props} />
}

export type ResponsiveDialogVariant = 'sheet' | 'fullscreen'

const SHAPE: Record<ResponsiveDialogVariant, string> = {
  sheet: cn(
    'inset-x-0 bottom-0 max-h-[calc(88dvh-var(--keyboard-inset))] w-full rounded-t-3xl rounded-b-none',
    'data-open:slide-in-from-bottom-full data-closed:slide-out-to-bottom-full',
    'sm:inset-x-auto sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:max-h-[calc(100dvh-4rem)] sm:w-[calc(100%-3rem)] sm:max-w-lg',
    'sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl',
    'sm:data-open:zoom-in-95 sm:data-open:slide-in-from-bottom-0 sm:data-closed:zoom-out-95 sm:data-closed:slide-out-to-bottom-0'
  ),
  fullscreen: cn(
    'inset-x-0 top-0 h-[calc(100dvh-var(--keyboard-inset))] max-h-[calc(100dvh-var(--keyboard-inset))] w-full rounded-none',
    'data-open:slide-in-from-bottom-full data-closed:slide-out-to-bottom-full',
    'sm:inset-auto sm:top-1/2 sm:left-1/2 sm:h-auto sm:max-h-[calc(100dvh-4rem)] sm:w-[calc(100%-3rem)] sm:max-w-2xl',
    'sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl',
    'sm:data-open:zoom-in-95 sm:data-open:slide-in-from-bottom-0 sm:data-closed:zoom-out-95 sm:data-closed:slide-out-to-bottom-0'
  )
}

function ResponsiveDialogContent({
  className,
  children,
  variant = 'sheet',
  showCloseButton = true,
  closeLabel = 'Close',
  ...props
}: ComponentProps<typeof DialogPrimitive.Content> & {
  variant?: ResponsiveDialogVariant
  showCloseButton?: boolean
  closeLabel?: string
}) {
  return (
    <Portal>
      <DialogPrimitive.Overlay
        data-slot='dialog-overlay'
        className='fixed inset-0 isolate z-50 bg-black/40 duration-150 supports-backdrop-filter:backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0'
      />
      <DialogPrimitive.Content
        data-slot='dialog-content'
        data-variant={variant}
        className={cn(
          'fixed z-50 flex flex-col overflow-hidden bg-popover text-sm text-popover-foreground shadow-xl ring-1 ring-foreground/5 outline-none dark:ring-foreground/10',
          'duration-200 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0',
          SHAPE[variant],
          className
        )}
        {...props}
      >
        {variant === 'sheet' ? (
          <div
            aria-hidden='true'
            className='mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-foreground/15 sm:hidden'
          />
        ) : null}

        {children}

        {showCloseButton ? (
          <DialogPrimitive.Close data-slot='dialog-close' asChild>
            <Button variant='ghost' size='icon-lg' className='absolute top-2.5 right-3 z-20 rounded-full bg-secondary'>
              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
              <span className='sr-only'>{closeLabel}</span>
            </Button>
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Content>
    </Portal>
  )
}

function ResponsiveDialogHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot='dialog-header'
      className={cn('flex shrink-0 flex-col gap-1 border-b border-border/70 px-5 py-4 pr-16', className)}
      {...props}
    />
  )
}

function ResponsiveDialogBody({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot='dialog-body'
      className={cn(
        'min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4',
        '[&_:is(input,textarea,select,[contenteditable])]:scroll-mb-24',
        className
      )}
      {...props}
    />
  )
}

function ResponsiveDialogFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot='dialog-footer'
      className={cn(
        'flex shrink-0 items-center gap-3 border-t border-border/70 bg-popover px-5 pt-3 pb-safe-sheet sm:pb-4',
        className
      )}
      {...props}
    />
  )
}

function ResponsiveDialogTitle({ className, ...props }: ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot='dialog-title'
      className={cn('font-title text-base font-semibold text-primary', className)}
      {...props}
    />
  )
}

function ResponsiveDialogDescription({ className, ...props }: ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot='dialog-description'
      className={cn('text-xs text-muted-foreground', className)}
      {...props}
    />
  )
}

export {
  Root as ResponsiveDialog,
  ResponsiveDialogBody,
  Close as ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  Trigger as ResponsiveDialogTrigger
}
