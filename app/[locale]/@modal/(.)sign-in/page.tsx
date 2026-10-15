'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import SignInProvider from '@/features/users/components/sign-in-provider'
import { useGetMe } from '@/features/users/hooks/use-get-me'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { usePathname, useRouter } from '@/lib/i18n/navigation'
import { LockPasswordIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useEffect, useRef, useState } from 'react'

const EXIT_ANIMATION_MS = 220

export default function SignInModalPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useTranslation()
  const { isAuthenticated } = useGetMe()
  const [isUserClosing, setIsUserClosing] = useState(false)

  const isOnSignInRoute = pathname.startsWith('/sign-in')

  const isOpen = isOnSignInRoute && !isUserClosing && !isAuthenticated

  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
      <DialogContent showCloseButton={false}>
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
