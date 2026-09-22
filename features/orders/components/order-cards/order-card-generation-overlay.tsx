'use client'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { ORDER_CARD_STAGE_KEYS } from '../../hooks/use-order-card-designer'

interface OrderCardGenerationOverlayProps {
  versionLabel: number
  stage: number
  cancel: () => void
  isCanceling: boolean
  isConnectionError: boolean
}

export default function OrderCardGenerationOverlay({
  versionLabel,
  stage,
  cancel,
  isCanceling,
  isConnectionError
}: OrderCardGenerationOverlayProps) {
  const { t } = useTranslation()
  return (
    <div className='w-full shrink-0 rounded-2xl border border-primary/15 bg-card/95 p-4 text-sm shadow-sm'>
      <div role='status' aria-live='polite'>
        <p className='flex items-center gap-2 font-semibold text-primary'>
          <Spinner className='size-4 shrink-0' />
          {t('orders.cards.generation.title', { index: versionLabel })}
        </p>
        <p className='mt-2'>{t(`orders.cards.generation.stages.${ORDER_CARD_STAGE_KEYS[stage]}`)}</p>
        <p className='mt-2 text-xs leading-relaxed text-muted-foreground'>
          {t('orders.cards.generation.backgroundNote')}
        </p>
        {isConnectionError ? <p className='mt-2'>{t('orders.cards.generation.connectionError')}</p> : null}
      </div>
      <Button className='mt-3' variant='outline' onClick={cancel} disabled={isCanceling}>
        {t(isCanceling ? 'orders.cards.generation.canceling' : 'orders.cards.generation.cancel')}
      </Button>
    </div>
  )
}
