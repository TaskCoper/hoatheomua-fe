import VerifySentContent from '@/components/verfiy-sent-content'
import { redirect } from '@/lib/i18n/navigation'
import type { Locale } from '@/lib/i18n/routing'
import { setRequestLocale } from 'next-intl/server'
import { z } from 'zod'

const emailParamSchema = z.email()

interface EmailPendingPageProps {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<{ email?: string }>
}

export default async function EmailPendingPage({ params, searchParams }: EmailPendingPageProps) {
  const [{ locale }, { email }] = await Promise.all([params, searchParams])

  setRequestLocale(locale)

  const parsedEmail = emailParamSchema.safeParse(email?.trim().toLowerCase())

  if (parsedEmail.success) {
    return <VerifySentContent email={parsedEmail.data} />
  }

  redirect({ href: '/', locale })
}
