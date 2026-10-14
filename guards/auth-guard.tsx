'use client'

import { useGetMe } from '@/features/users/hooks/use-get-me'
import { useGetUserHomePath } from '@/hooks/use-get-user-home-path'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { usePathname, useRouter } from '@/lib/i18n/navigation'
import { isGuestAuthPath } from '@/shared/constants'
import { useEffect, useRef } from 'react'
import AuthGuardLoading from './auth-guard-loading'
import { isRedirectLoop } from './redirect-loop'

interface AuthGuardProps {
  requiresAuth: boolean
  children: React.ReactNode
}

export default function AuthGuard({ requiresAuth, children }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const userHomePath = useGetUserHomePath()
  const hasMounted = useHasMounted()

  const { isGettingMe, isAuthenticated } = useGetMe()

  const isOnGuestAuthPage = isGuestAuthPath(pathname)

  const isModalOverlay = requiresAuth && isOnGuestAuthPage

  const fromRef = useRef<string | null>(null)
  useEffect(() => {
    if (!isOnGuestAuthPage) {
      fromRef.current = pathname
    }
  }, [pathname, isOnGuestAuthPage])

  const shouldRedirectAuthedAway = isAuthenticated && isOnGuestAuthPage
  const shouldRedirectToSignIn = requiresAuth && !isAuthenticated && !isOnGuestAuthPage

  useEffect(() => {
    if (!hasMounted || isGettingMe) return

    if (shouldRedirectToSignIn) {
      const from = `${fromRef.current ?? pathname}${window.location.search}`
      const params = new URLSearchParams({ from })
      router.replace(`/sign-in?${params.toString()}`)
      return
    }

    if (shouldRedirectAuthedAway) {
      if (isRedirectLoop(pathname, userHomePath, 'AuthGuard (already authenticated)')) return
      router.replace(userHomePath)
    }
  }, [hasMounted, isGettingMe, shouldRedirectToSignIn, shouldRedirectAuthedAway, pathname, router, userHomePath])

  if (shouldRedirectToSignIn || shouldRedirectAuthedAway || isModalOverlay) {
    return <AuthGuardLoading />
  }

  return <>{children}</>
}
