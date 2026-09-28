'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import ForgotPasswordFlow from '@/features/users/components/forgot-password-flow'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { usePathname, useRouter } from '@/lib/i18n/navigation'
import { LockPasswordIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useEffect, useRef, useState } from 'react'

const EXIT_ANIMATION_MS = 220

export default function ForgotPasswordModalPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useTranslation()
  const [isUserClosing, setIsUserClosing] = useState(false)

  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isOnForgotPasswordRoute = pathname.startsWith('/forgot-password')
  const isOpen = isOnForgotPasswordRoute && !isUserClosing

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
    }
  }, [])

  const handleOpenChange = (open: boolean) => {
    if (open || closeTimeoutRef.current) return

    setIsUserClosing(true)
    closeTimeoutRef.current = setTimeout(() => {
      router.back()
    }, EXIT_ANIMATION_MS)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className='gap-5 rounded-4xl p-6 sm:max-w-[28rem] sm:p-7'
        onInteractOutside={() => handleOpenChange(false)}
      >
        <DialogHeader className='items-center text-center'>
          <div className='mb-1 flex size-11 items-center justify-center rounded-full bg-primary/10'>
            <HugeiconsIcon icon={LockPasswordIcon} className='text-primary' />
          </div>

          <DialogTitle className='text-lg font-semibold'>{t('auth.forgotPassword.title')}</DialogTitle>
          <DialogDescription className='max-w-sm text-balance text-sm leading-relaxed'>
            {t('auth.forgotPassword.description')}
          </DialogDescription>
        </DialogHeader>

        <ForgotPasswordFlow />
      </DialogContent>
    </Dialog>
  )
}
