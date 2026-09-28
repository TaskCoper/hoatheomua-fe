'use client'

import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link } from '@/lib/i18n/navigation'

export default function ForgotPasswordFlow() {
  const { t } = useTranslation()

  return (
    <div className='mt-4 space-y-3'>
      <p className='text-sm text-muted-foreground'>{t('auth.phone.recoveryNote')}</p>
      <Button asChild className='w-full'>
        <Link href='/contact'>{t('auth.phone.contactSupport')}</Link>
      </Button>
      <Button asChild variant='link' className='w-full'>
        <Link href='/sign-in' replace>{t('auth.signIn.title')}</Link>
      </Button>
    </div>
  )
}
