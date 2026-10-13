'use client'

import { Button } from '@/components/ui/button'
import * as Sentry from '@sentry/nextjs'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations('common.error')

  useEffect(() => {
    // The boundary swallows the error, so Sentry never sees it unless it is reported here. Most
    // failed React Query fetches end up here too (`throwOnError` in lib/react-query-client.ts).
    Sentry.captureException(error)
    console.error(error)
  }, [error])

  return (
    <div className='flex min-h-[50vh] w-full flex-col items-center justify-center gap-4 px-4 text-center'>
      <h2 className='text-2xl font-semibold'>{t('title')}</h2>
      <p className='max-w-md text-muted-foreground'>{t('description')}</p>

      <Button onClick={reset} variant='default'>
        {t('tryAgain')}
      </Button>
    </div>
  )
}
