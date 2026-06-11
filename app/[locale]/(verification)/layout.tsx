import AuthGuard from '@/features/auth/components/auth-guard'

export default function VerifyLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard requiresAuth={false}>{children}</AuthGuard>
}
