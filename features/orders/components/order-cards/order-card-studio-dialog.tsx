'use client'

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { useState } from 'react'
import type { OrderAiCard } from '../../cards/types'
import OrderCardStudio from './order-card-studio'

interface OrderCardStudioDialogProps {
  card: OrderAiCard
  /** Whatever opens the studio - the card's row in the item list, or its printed artwork. */
  children: React.ReactNode
}

/** One card's studio, wrapped around the trigger that opens it. */
export default function OrderCardStudioDialog({ card, children }: OrderCardStudioDialogProps) {
  const [isStudioOpen, setIsStudioOpen] = useState(false)

  return (
    <Dialog open={isStudioOpen} onOpenChange={setIsStudioOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className='flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-6xl' position='top-center'>
        {/* Mounted only while open, so the card's generations are asked for on the click. */}
        {isStudioOpen ? (
          <OrderCardStudio card={card} isOpen={isStudioOpen} onDone={() => setIsStudioOpen(false)} />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
