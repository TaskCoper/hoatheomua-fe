'use client'

import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link } from '@/lib/i18n/navigation'

export default function HomePage() {
  const { t } = useTranslation()

  return (
    <div className='p-4'>
      <Link href='/sign-in'>
        <Button>{t('auth.signIn.title')}</Button>
      </Link>
    </div>
  )
}
