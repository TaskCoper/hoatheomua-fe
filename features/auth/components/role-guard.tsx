'use client'

import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { getRoleHomePath, getUserType, Role } from '@/features/auth/utils'
import { useRouter } from '@/lib/i18n/navigation'
import { useEffect } from 'react'
import AuthGuardLoading from './auth-guard-loading'

interface RoleGuardProps {
  allowedRoles: Role[]
  allowAnonymous?: boolean
  children: React.ReactNode
}

export default function RoleGuard({ allowedRoles, allowAnonymous = false, children }: RoleGuardProps) {
  const router = useRouter()
  const { me, isGettingMe } = useGetMe()
  const userType = getUserType(me)

  const isWrongRole = !isGettingMe && !!me && (userType === null || !allowedRoles.includes(userType))
  const isMissingAuth = !isGettingMe && !me && !allowAnonymous

  useEffect(() => {
    if (isGettingMe) return

    if (isMissingAuth) {
      router.replace('/sign-in')
      return
    }

    if (isWrongRole && userType !== null) {
      router.replace(getRoleHomePath(userType))
    }
  }, [isGettingMe, isMissingAuth, isWrongRole, userType, router])

  if (isGettingMe || isWrongRole || isMissingAuth) {
    return <AuthGuardLoading />
  }

  return <>{children}</>
}
