import RoleGuard from '@/features/auth/components/role-guard'
import { ROLES } from '@/features/auth/utils'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={[ROLES.Admin]}>{children}</RoleGuard>
}
