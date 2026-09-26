'use client'

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { useState } from 'react'
import type { OrderAiCard } from '../../cards/types'
import OrderCardStudio from './order-card-studio'

interface OrderCardStudioDialogProps {
  card: OrderAiCard
  children: React.ReactNode
}

export default function OrderCardStudioDialog({ card, children }: OrderCardStudioDialogProps) {
  const [isStudioOpen, setIsStudioOpen] = useState(false)

  return (
    <Dialog open={isStudioOpen} onOpenChange={setIsStudioOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent
        className='flex h-[min(50rem,calc(100dvh-3rem))] w-[calc(100%-1.5rem)] flex-col gap-0 overflow-hidden rounded-3xl bg-background p-0 sm:w-[calc(100%-3rem)] sm:max-w-7xl'
        position='top-center'
      >
        {isStudioOpen ? (
          <OrderCardStudio card={card} isOpen={isStudioOpen} onDone={() => setIsStudioOpen(false)} />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
