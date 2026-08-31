import AuthGuard from '@/guards/auth-guard'

export default function GuestLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard requiresAuth={false}>{children}</AuthGuard>
}
