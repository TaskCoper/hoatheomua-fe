'use client'

import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link } from '@/lib/i18n/navigation'
import { useForwardedAuthHref } from '../hooks/use-auth-href'

export default function ForgotPasswordFlow() {
  const { t } = useTranslation()
  const signInHref = useForwardedAuthHref('/sign-in')

  return (
    <div className='mt-4 space-y-3'>
      <p className='text-sm text-muted-foreground'>{t('auth.phone.recoveryNote')}</p>
      <Button asChild className='w-full'>
        <Link href='/contact'>{t('auth.phone.contactSupport')}</Link>
      </Button>
      <Button asChild variant='link' className='w-full'>
        <Link href={signInHref} replace>{t('auth.signIn.title')}</Link>
      </Button>
    </div>
  )
}
