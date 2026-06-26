'use client'

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { ProfileSheetBody } from './profile-sheet'

interface ProfileDialogProps {
  children: React.ReactNode
  slug?: string
}

export function ProfileDialog({ children, slug }: ProfileDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        position='top-center'
        className='h-fit max-w-none max-h-[calc(100vh-2rem)] overflow-hidden p-0 shadow-2xl'
        style={{
          width: 'min(56rem, calc(100vw - 2rem))',
          maxWidth: 'none',
          borderRadius: '1.5rem',
        }}
        showCloseButton
      >
        <ProfileSheetBody slug={slug} />
      </DialogContent>
    </Dialog>
  )
}
