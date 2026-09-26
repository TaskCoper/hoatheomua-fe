'use client'

import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link } from '@/lib/i18n/navigation'
import { CheckmarkCircle02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

export function StepComplete() {
  const { t } = useTranslation()

  return (
    <section className='rounded-3xl bg-card p-8 sm:p-10 border border-border text-center'>
      <div className='mx-auto mb-4 grid size-16 place-items-center rounded-full bg-primary/10 text-primary'>
        <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className='size-8' />
      </div>
      <h2 className='font-title text-xl font-semibold'>{t('orders.checkout.completeTitle')}</h2>
      <p className='mx-auto mt-2 max-w-md text-sm text-muted-foreground'>{t('orders.checkout.completeBody')}</p>

      <div className='mt-6 flex flex-wrap justify-center gap-3'>
        <Button asChild size='lg'>
          <Link href='/orders'>{t('orders.checkout.completeViewOrders')}</Link>
        </Button>
        <Button asChild size='lg' variant='outline'>
          <Link href='/products'>{t('orders.checkout.completeContinueShopping')}</Link>
        </Button>
      </div>
    </section>
  )
}
