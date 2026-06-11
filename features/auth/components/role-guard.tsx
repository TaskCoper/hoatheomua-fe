'use client'

import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { getRoleHomePath, getUserType, Role } from '@/features/auth/utils'
import { useRouter } from '@/lib/i18n/navigation'
import { useEffect } from 'react'
import AuthGuardLoading from './auth-guard-loading'

interface RoleGuardProps {
  allowedRoles: Role[]
  children: React.ReactNode
}

export default function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const router = useRouter()
  const { me, isGettingMe } = useGetMe()
  const userType = getUserType(me)

  const isWrongRole = !isGettingMe && !!me && (userType === null || !allowedRoles.includes(userType))

  useEffect(() => {
    if (isGettingMe || !isWrongRole) return

    if (userType === null) {
      router.replace('/sign-in')
      return
    }

    router.replace(getRoleHomePath(userType))
  }, [isGettingMe, isWrongRole, userType, router])

  if (isGettingMe || isWrongRole) {
    return <AuthGuardLoading />
  }

  return <>{children}</>
}
