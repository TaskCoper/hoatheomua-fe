'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import SignInProvider from '@/features/auth/components/sign-in-provider'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { useRouter } from '@/lib/i18n/navigation'
import { LockPasswordIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useEffect, useRef, useState } from 'react'

const EXIT_ANIMATION_MS = 220

export default function SignInModalPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(true)

  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
    }
  }, [])

  const handleOpenChange = (isOpen: boolean) => {
    setIsOpen(isOpen)

    if (!isOpen && !closeTimeoutRef.current) {
      closeTimeoutRef.current = setTimeout(() => {
        router.back()
      }, EXIT_ANIMATION_MS)
    }
  }

  // Name

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={false} onInteractOutside={() => handleOpenChange(false)}>
        <DialogHeader>
          <div className='p-2 rounded-full bg-primary/10 w-fit mb-2'>
            <HugeiconsIcon icon={LockPasswordIcon} className='text-primary' />
          </div>
          <DialogTitle>{t('auth.signIn.title')}</DialogTitle>
          <DialogDescription>{t('auth.signIn.description')}</DialogDescription>
        </DialogHeader>

        <SignInProvider />
      </DialogContent>
    </Dialog>
  )
}
