import AuthGuard from '@/features/auth/components/auth-guard'

export default function VerificationLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard requiresAuth={false}>{children}</AuthGuard>
}
