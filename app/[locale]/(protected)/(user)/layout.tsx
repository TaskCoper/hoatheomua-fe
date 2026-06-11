import RoleGuard from '@/features/auth/components/role-guard'
import { ROLES } from '@/features/auth/utils'

export default function ProtectedUserLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={[ROLES.User]}>{children}</RoleGuard>
}
