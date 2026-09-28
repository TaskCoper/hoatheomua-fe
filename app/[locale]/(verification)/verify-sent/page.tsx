import { redirect } from '@/lib/i18n/navigation'
import type { Locale } from '@/lib/i18n/routing'

// Keep old bookmarks usable without rendering an email verification flow.
export default async function LegacyVerificationPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  redirect({ href: '/sign-in', locale })
}
