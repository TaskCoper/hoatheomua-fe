'use client'

import { ProfileSheet } from '@/features/users/components/profile-sheet'
import { usePathname, useRouter } from '@/lib/i18n/navigation'
import { useEffect, useRef, useState } from 'react'

const EXIT_ANIMATION_MS = 220

export function UserProfileModalShell({ slug }: { slug: string }) {
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

  return <ProfileSheet open={isOpen} onOpenChange={handleOpenChange} slug={slug} />
}
