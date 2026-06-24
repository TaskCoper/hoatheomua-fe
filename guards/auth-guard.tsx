'use client'

import { useGetMe } from '@/features/users/hooks/use-get-me'
import { useGetUserHomePath } from '@/hooks/use-get-user-home-path'
import { usePathname, useRouter } from '@/lib/i18n/navigation'
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

  const { me, isGettingMe, isAuthenticated, isVerificationRequired } = useGetMe()

  const isOnVerifyPage = pathname.startsWith('/verify')
  const isOnSignInPage = pathname.startsWith('/sign-in')
  const isOnForgotPasswordPage = pathname.startsWith('/forgot-password')
  const isModalOverlay = requiresAuth && (isOnSignInPage || isOnForgotPasswordPage)

  const fromRef = useRef<string | null>(null)
  useEffect(() => {
    if (!isOnSignInPage && !isOnVerifyPage && !isOnForgotPasswordPage) {
      fromRef.current = pathname
    }
  }, [pathname, isOnSignInPage, isOnVerifyPage])

  const shouldRedirectToVerify = isVerificationRequired && !isOnVerifyPage && !isOnSignInPage
  const shouldRedirectToSignIn =
    requiresAuth &&
    !isVerificationRequired &&
    (!isAuthenticated || !me) &&
    !isOnSignInPage &&
    !isOnForgotPasswordPage
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
      if (isRedirectLoop(pathname, userHomePath, 'AuthGuard (already authenticated)')) return
      router.replace(userHomePath)
    }
  }, [
    isGettingMe,
    shouldRedirectToVerify,
    shouldRedirectToSignIn,
    shouldRedirectAuthedAway,
    me,
    pathname,
    router,
    userHomePath
  ])

  if (isGettingMe || shouldRedirectToVerify || shouldRedirectToSignIn || shouldRedirectAuthedAway || isModalOverlay) {
    return <AuthGuardLoading />
  }

  return <>{children}</>
}
