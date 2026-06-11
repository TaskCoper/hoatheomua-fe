'use client'

import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { getRoleHomePath, getUserType } from '@/features/auth/utils'
import { usePathname, useRouter } from '@/lib/i18n/navigation'
import { useEffect, useRef } from 'react'
import AuthGuardLoading from './auth-guard-loading'

interface AuthGuardProps {
  requiresAuth: boolean
  children: React.ReactNode
}

export default function AuthGuard({ requiresAuth, children }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()

  const { me, isGettingMe, isAuthenticated, isVerificationRequired } = useGetMe()

  const isOnVerifyPage = pathname.startsWith('/verify')
  const isOnSignInPage = pathname.startsWith('/sign-in')

  const isModalOverlay = requiresAuth && isOnSignInPage

  const fromRef = useRef<string | null>(null)
  useEffect(() => {
    if (!isOnSignInPage && !isOnVerifyPage) {
      fromRef.current = pathname
    }
  }, [pathname, isOnSignInPage, isOnVerifyPage])

  const shouldRedirectToVerify = isVerificationRequired && !isOnVerifyPage && !isOnSignInPage
  const shouldRedirectToSignIn = requiresAuth && !isVerificationRequired && (!isAuthenticated || !me) && !isOnSignInPage
  const shouldRedirectAuthedAway = !requiresAuth && isAuthenticated && !!me && !isVerificationRequired

  useEffect(() => {
    if (isGettingMe) return

    if (shouldRedirectToVerify) {
      const email = me?.email
      const params = email ? `?${new URLSearchParams({ email }).toString()}` : ''
      router.replace(`/verify-sent${params}`)
      return
    }

    if (shouldRedirectToSignIn) {
      const from = fromRef.current ?? pathname
      const params = new URLSearchParams({ from })
      router.replace(`/sign-in?${params.toString()}`)
      return
    }

    if (shouldRedirectAuthedAway) {
      router.replace(getRoleHomePath(getUserType(me)))
    }
  }, [isGettingMe, shouldRedirectToVerify, shouldRedirectToSignIn, shouldRedirectAuthedAway, me, pathname, router])

  if (isGettingMe || shouldRedirectToVerify || shouldRedirectToSignIn || shouldRedirectAuthedAway || isModalOverlay) {
    return <AuthGuardLoading />
  }

  return <>{children}</>
}
