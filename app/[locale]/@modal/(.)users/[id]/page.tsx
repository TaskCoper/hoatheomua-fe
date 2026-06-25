'use client'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { ProfileCard } from '@/features/users/components/profile-dialog'
import { usePathname, useRouter } from '@/lib/i18n/navigation'
import { use, useEffect, useRef, useState } from 'react'

const EXIT_ANIMATION_MS = 220

interface UserProfileModalPageProps {
  params: Promise<{ id: string }>
}

export default function UserProfileModalPage({ params }: UserProfileModalPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const pathname = usePathname()
  const [isUserClosing, setIsUserClosing] = useState(false)

  const isOnUserRoute = pathname.startsWith('/users/')
  const isOpen = isOnUserRoute && !isUserClosing

  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
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
        className='gap-0 overflow-hidden p-0 sm:max-w-sm'
        onInteractOutside={() => handleOpenChange(false)}
      >
        <ProfileCard userId={id} />
      </DialogContent>
    </Dialog>
  )
}
