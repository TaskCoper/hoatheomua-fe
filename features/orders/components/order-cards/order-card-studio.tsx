'use client'

import { Button } from '@/components/ui/button'
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { formatVnd } from '@/lib/currency'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { cn } from '@/shared/utils'
import { AiMagicIcon, Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { toast } from 'sonner'
import { countWords, getCardHandwritingPrice, getCardMaxWords } from '../../cards/card-config'
import { getOrderCardPriceDelta, getOrderCardUnitPrice } from '../../cards/order-card-data'
import type { CardWritingMethod, OrderAiCard, OrderCardVersion } from '../../cards/types'
import { useCardConfig } from '../../hooks/use-card-config'
import { useOrderCardDesigner } from '../../hooks/use-order-card-designer'
import CardContentFields from '../checkout/cards/card-content-fields'
import CardWritingPicker from '../checkout/cards/card-writing-picker'
import OrderCardArtwork from './order-card-artwork'
import OrderCardGenerationOverlay from './order-card-generation-overlay'
import OrderCardLockedSpecs from './order-card-locked-specs'
import OrderCardVersionStrip from './order-card-version-strip'

interface OrderCardStudioProps {
  card: OrderAiCard
  autoGenerate?: boolean
  onAddVersion: (cardId: string, version: OrderCardVersion) => void
  onApplyVersion: (cardId: string, args: { versionId: string; writingMethod: CardWritingMethod }) => void
  onDone: () => void
}

export default function OrderCardStudio({
  card,
  autoGenerate,
  onAddVersion,
  onApplyVersion,
  onDone
}: OrderCardStudioProps) {
  const { t } = useTranslation()
  const { cardConfig } = useCardConfig()

  const {
    activeVersion,
    activeVersionId,
    content,
    draft,
    writingMethod,
    status,
    stage,
    showMessageError,
    hasUnpaintedWords,
    isSelectedVersion,
    canGenerate,
    canApply,
    editContent,
    setWritingMethod,
    selectVersion,
    generate
  } = useOrderCardDesigner({ card, autoGenerate, onAddVersion })

  const isGenerating = status === 'generating'
  const currentPrice =
    getOrderCardUnitPrice({ card, content: draft, writingMethod, config: cardConfig }) * card.quantity
  const paidPrice = card.paidUnitPrice * card.quantity
  const priceDelta = getOrderCardPriceDelta({ card, content: draft, writingMethod, config: cardConfig })
  const handwritingPrice = getCardHandwritingPrice(cardConfig, countWords(draft.message))

  const generateLabel =
    card.versions.length === 0
      ? t('orders.cards.actions.generateFirst')
      : hasUnpaintedWords
        ? t('orders.cards.actions.generate')
        : t('orders.cards.actions.regenerate')

  const isAlreadyApplied = isSelectedVersion && !hasUnpaintedWords && writingMethod === card.writingMethod

  const handleApply = () => {
    if (!activeVersion) return

    onApplyVersion(card.id, { versionId: activeVersion.id, writingMethod })
    toast.success(t('orders.cards.toast.applied', { index: activeVersion.label }))
    onDone()
  }

  return (
    <div className='flex min-h-0 flex-1 flex-col overflow-y-auto md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:overflow-hidden'>
      <section className='flex flex-col bg-secondary/25 md:min-h-0 md:overflow-hidden'>
        <div className='relative flex min-h-0 flex-1 items-center justify-center p-5 sm:p-7'>
          <div className='relative aspect-3/4 w-[min(14rem,55vw)] md:h-full md:max-h-[24rem] md:w-auto'>
            <OrderCardArtwork
              showWords
              version={activeVersion}
              writingMethod={writingMethod}
              sizes='(min-width: 768px) 20rem, 60vw'
              className='size-full rounded-3xl shadow-[0_0.8rem_2rem_rgb(81_108_108/20%)] ring-1 ring-foreground/10'
            />

            {activeVersion ? (
              <span className='absolute left-2 top-2 rounded-full bg-card/90 px-2 py-0.5 text-[0.7rem] font-semibold text-primary ring-1 ring-primary/10 backdrop-blur-sm'>
                {t('orders.cards.versions.label', { index: activeVersion.label })}
              </span>
            ) : null}
          </div>

          {isGenerating ? <OrderCardGenerationOverlay versionLabel={card.versions.length + 1} stage={stage} /> : null}
        </div>

        <div className='shrink-0 border-t border-border/60 bg-card/60 p-3 sm:p-4'>
          <p className='mb-1.5 flex items-baseline justify-between gap-3'>
            <span className='text-[0.7rem] font-medium text-muted-foreground'>
              {t('orders.cards.versions.heading')}
            </span>
            {card.versions.length > 0 ? (
              <span className='text-[0.7rem] font-semibold tabular-nums text-foreground/70'>
                {t('orders.cards.versions.counter', {
                  index: activeVersion?.label ?? card.versions.length,
                  total: card.versions.length
                })}
              </span>
            ) : null}
          </p>

          <OrderCardVersionStrip
            versions={card.versions}
            activeVersionId={activeVersionId}
            selectedVersionId={card.selectedVersionId}
            writingMethod={writingMethod}
            disabled={isGenerating}
            onSelect={selectVersion}
          />
        </div>
      </section>

      <section className='flex min-w-0 flex-col md:min-h-0 md:overflow-y-auto'>
        <div className='space-y-4 p-4 sm:p-5'>
          <DialogHeader className='pr-10'>
            <div className='flex items-center gap-2'>
              <span className='grid size-8 shrink-0 place-items-center rounded-full bg-secondary/40 text-primary ring-1 ring-primary/10'>
                <HugeiconsIcon icon={AiMagicIcon} strokeWidth={1.75} className='size-4' />
              </span>
              <div className='min-w-0'>
                <DialogTitle className='font-title text-sm font-bold sm:text-base'>
                  {t('orders.cards.dialogTitle')}
                </DialogTitle>
                <DialogDescription className='truncate text-xs'>
                  {t('orders.cards.forProduct', { name: card.productName })}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <OrderCardLockedSpecs
            templateName={card.templateName}
            templateImageUrl={card.templateImageUrl}
            sizeName={card.sizeName}
          />

          <CardContentFields
            value={content}
            onChange={editContent}
            messageInvalid={showMessageError}
            maxWords={getCardMaxWords(cardConfig, card.sizeName)}
            surcharge={writingMethod === 'handwritten' ? handwritingPrice : 0}
          />

          <CardWritingPicker value={writingMethod} onChange={setWritingMethod} handwritingPrice={handwritingPrice} />

          <div className='space-y-2 rounded-2xl bg-secondary/20 p-3 ring-1 ring-foreground/5'>
            <div className='flex items-baseline justify-between gap-3'>
              <span className='text-[0.7rem] font-medium text-muted-foreground'>{t('orders.cards.price.paid')}</span>
              <span className='text-sm font-medium tabular-nums'>{formatVnd(paidPrice)}</span>
            </div>

            <div className='flex items-baseline justify-between gap-3'>
              <span className='text-[0.7rem] font-medium text-muted-foreground'>
                {t('orders.cards.price.current')}
                {card.quantity > 1 ? (
                  <span className='ml-1'>({t('orders.cards.quantity', { count: card.quantity })})</span>
                ) : null}
              </span>
              <span className='font-title text-base font-bold tabular-nums text-primary'>
                {formatVnd(currentPrice)}
              </span>
            </div>

            <div className='flex justify-end'>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[0.7rem] font-semibold tabular-nums',
                  priceDelta === 0
                    ? 'text-muted-foreground'
                    : 'bg-secondary/50 text-secondary-foreground ring-1 ring-primary/10'
                )}
              >
                {priceDelta === 0
                  ? t('orders.cards.price.same')
                  : priceDelta > 0
                    ? t('orders.cards.price.extra', { price: formatVnd(priceDelta) })
                    : t('orders.cards.price.refund', { price: formatVnd(Math.abs(priceDelta)) })}
              </span>
            </div>

            <p className='border-t border-border/60 pt-2 text-[0.7rem] leading-relaxed text-muted-foreground'>
              {t('orders.cards.price.note')}
            </p>
          </div>
        </div>

        <div className='sticky bottom-0 mt-auto space-y-2 border-t border-border/60 bg-popover p-4 sm:p-5'>
          {hasUnpaintedWords && card.versions.length > 0 ? (
            <p className='text-xs text-muted-foreground'>{t('orders.cards.actions.applyHint')}</p>
          ) : null}

          <div className='grid gap-2 sm:grid-cols-2'>
            <Button
              type='button'
              variant={hasUnpaintedWords ? 'default' : 'outline'}
              onClick={generate}
              disabled={!canGenerate}
            >
              {isGenerating ? (
                <Spinner className='size-4' />
              ) : (
                <HugeiconsIcon icon={AiMagicIcon} strokeWidth={2} className='size-4' />
              )}
              {generateLabel}
            </Button>

            <Button
              type='button'
              variant={hasUnpaintedWords ? 'outline' : 'default'}
              onClick={handleApply}
              disabled={!canApply}
            >
              {isAlreadyApplied ? (
                <>
                  <HugeiconsIcon icon={Tick02Icon} strokeWidth={2.5} className='size-4' />
                  {t('orders.cards.actions.applied')}
                </>
              ) : (
                t('orders.cards.actions.apply')
              )}
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
