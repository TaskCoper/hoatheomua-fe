'use client'

import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n/dictionary-provider'

export default function HomePage() {
  const { t } = useTranslation()

  return (
    <div>
      <Button>{t('home.cta')}</Button>
    </div>
  )
}
