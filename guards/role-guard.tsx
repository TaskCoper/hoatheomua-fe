'use client'

import { useGetMe } from '@/features/users/hooks/use-get-me'
import { useSignOut } from '@/features/users/hooks/use-sign-out'
import { Role as UserRole } from '@/features/users/types'
import { useGetUserHomePath } from '@/hooks/use-get-user-home-path'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { usePathname, useRouter } from '@/lib/i18n/navigation'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { isRedirectLoop } from './redirect-loop'
import { getRoleHomePath, getUserType, Role } from './utils'

interface RoleGuardProps {
  allowedRoles: Role[]
  allowedUserRoles?: string[]
  allowAnonymous?: boolean
  children: React.ReactNode
}

export default function RoleGuard({
  allowedRoles,
  allowedUserRoles,
  allowAnonymous = false,
  children
}: RoleGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useTranslation()
  const { me, isGettingMe } = useGetMe()
  const userType = getUserType(me)
  const userHomePath = useGetUserHomePath()
  const { signOut } = useSignOut()
  const hasSignedOutRef = useRef(false)

  const isNonCustomer = !!me && me.role !== UserRole.Customer

  useEffect(() => {
    if (!isNonCustomer || !me || hasSignedOutRef.current) {
      return
    }

    hasSignedOutRef.current = true
    toast.error(t('auth.signIn.customerOnly'))

    signOut()
  }, [isNonCustomer, me, signOut, t])

  const isMissingAuth = !isGettingMe && !me && !allowAnonymous
  const isWrongRole = !isGettingMe && !!userType && !allowedRoles.includes(userType)
  const isWrongUserRole =
    !isGettingMe && userType === 'Customer' && !!allowedUserRoles && !!me?.role && !allowedUserRoles.includes(me.role)

  useEffect(() => {
    if (isGettingMe || isNonCustomer) return

    if (isMissingAuth) {
      if (pathname === '/sign-in') return
      router.replace('/sign-in')
      return
    }

    if (isWrongRole && userType) {
      const target = getRoleHomePath(userType)
      if (isRedirectLoop(pathname, target, `RoleGuard (role "${userType}" not in [${allowedRoles.join(',')}])`)) return
      router.replace(target)
      return
    }

    if (isWrongUserRole) {
      if (
        isRedirectLoop(
          pathname,
          userHomePath,
          `RoleGuard (user role "${me?.role}" not in [${allowedUserRoles?.join(',')}])`
        )
      ) {
        return
      }
      router.replace(userHomePath)
    }
  }, [
    isGettingMe,
    isMissingAuth,
    isWrongRole,
    isWrongUserRole,
    userType,
    allowedRoles,
    allowedUserRoles,
    me,
    pathname,
    router,
    userHomePath,
    isNonCustomer
  ])

  if (isGettingMe) return null
  if (isNonCustomer) return null
  if (isMissingAuth || isWrongRole || isWrongUserRole) return null

  return <>{children}</>
}
