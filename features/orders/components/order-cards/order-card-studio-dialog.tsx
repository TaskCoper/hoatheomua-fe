'use client'

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { useCallback, useState } from 'react'
import type { OrderAiCard } from '../../cards/types'
import OrderCardStudio from './order-card-studio'

interface OrderCardStudioDialogProps {
  card: OrderAiCard
  children: React.ReactNode
}

export default function OrderCardStudioDialog({ card, children }: OrderCardStudioDialogProps) {
  const [isStudioOpen, setIsStudioOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  /**
   * A run in flight owns the dialog: it cannot be cancelled, and closing here would
   * drop the result on the floor. Esc, the backdrop and the X are all refused until
   * it lands - the studio's own progress layer says why.
   */
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open && isGenerating) return
      setIsStudioOpen(open)
    },
    [isGenerating]
  )

  const blockWhileGenerating = useCallback(
    (event: Event | KeyboardEvent) => {
      if (isGenerating) event.preventDefault()
    },
    [isGenerating]
  )

  return (
    <Dialog open={isStudioOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent
        className='flex h-[min(50rem,calc(100dvh-3rem))] w-[calc(100%-1.5rem)] flex-col gap-0 overflow-hidden p-0 sm:w-[calc(100%-3rem)] sm:max-w-6xl'
        position='top-center'
        showCloseButton={!isGenerating}
        onEscapeKeyDown={blockWhileGenerating}
        onPointerDownOutside={blockWhileGenerating}
        onInteractOutside={blockWhileGenerating}
      >
        {isStudioOpen ? (
          <OrderCardStudio
            card={card}
            isOpen={isStudioOpen}
            onDone={() => setIsStudioOpen(false)}
            onBusyChange={setIsGenerating}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
