import { redirect } from '@/lib/i18n/navigation'
import type { Locale } from '@/lib/i18n/routing'

interface LegacyAuthPageProps {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function LegacyForgotPasswordPage({ params, searchParams }: LegacyAuthPageProps) {
  const [{ locale }, query] = await Promise.all([params, searchParams])

  redirect({ href: { pathname: '/sign-in', query }, locale })
}
