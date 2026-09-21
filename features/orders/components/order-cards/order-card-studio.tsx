'use client'

import { Button } from '@/components/ui/button'
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { formatVnd } from '@/lib/currency'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { useConfirmStore } from '@/stores/confirm.store'
import { CardTemplateType } from '@/types/card-template.type'
import { AiMagicIcon, CheckmarkBadge01Icon, Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { findOrderCardVersion } from '../../cards/order-card-data'
import type { OrderAiCard } from '../../cards/types'
import { useCardTemplates } from '../../hooks/use-card-templates'
import { useOrderCardDesigner } from '../../hooks/use-order-card-designer'
import CardContentFields from '../checkout/cards/card-content-fields'
import CardTemplatePicker from '../checkout/cards/card-template-picker'
import OrderCardArtwork from './order-card-artwork'
import OrderCardGenerationOverlay from './order-card-generation-overlay'
import OrderCardLockedSpecs from './order-card-locked-specs'
import OrderCardVersionStrip from './order-card-version-strip'

/** Only reached before anything has been measured and with no size on the card. */
const DEFAULT_CARD_RATIO = 3 / 4

interface OrderCardStudioProps {
  card: OrderAiCard
  /** The dialog is what asks for the card's generations, so the query follows it open. */
  isOpen: boolean
  onDone: () => void
}

export default function OrderCardStudio({ card, isOpen, onDone }: OrderCardStudioProps) {
  const { t } = useTranslation()

  const {
    versions,
    isLoadingVersions,
    isVersionsError,
    activeVersion,
    activeVersionId,
    selectedVersionId,
    template,
    content,
    draft,
    isBelowBudget,
    isOverBudget,
    status,
    stage,
    isApplying,
    showMessageError,
    hasChanges,
    canGenerate,
    isTemplateLocked,
    isSettled,
    isSelectedVersion,
    editContent,
    editTemplate,
    selectVersion,
    applyVersion,
    generate
  } = useOrderCardDesigner({ card, enabled: isOpen })

  // A settled card can neither be redesigned nor regenerated, so its picker never renders and
  // the template list is a request worth not making.
  const { templates, isGettingCardTemplates, isGettingMoreCardTemplates, hasMoreCardTemplates, loadMoreCardTemplates } =
    useCardTemplates(CardTemplateType.Ai, { enabled: !isSettled })

  const isGenerating = status === 'generating'
  const confirm = useConfirmStore((state) => state.confirm)

  /** The generation on `finalGeneratedCardId`, once its list has landed. */
  const settledVersion = isSettled ? findOrderCardVersion(versions, selectedVersionId) : null

  // The settled card was painted with its own words; the ordered ones are only a fallback for
  // while the list is still in flight.
  const settledMessage = settledVersion?.content.message || card.content.message

  // Nothing generated yet means the design itself is the best preview there is - or, on a card
  // ordered with its artwork already in hand, that artwork.
  const previewImageUrl = activeVersion?.imageUrl || template.templateImageUrl || card.rawImageUrl

  // The artwork is laid out at its own shape, measured as it paints - the same way the
  // template picker sizes its tiles. Until it has painted, the card's printed size is the
  // closest guess there is, so the frame does not jump from a default 3:4.
  const [artworkRatios, setArtworkRatios] = useState<ReadonlyMap<string, number>>(new Map())
  const previewRatio = artworkRatios.get(previewImageUrl) ?? card.sizeRatio ?? DEFAULT_CARD_RATIO

  const measureArtwork = ({ naturalWidth, naturalHeight }: { naturalWidth: number; naturalHeight: number }) => {
    if (!previewImageUrl || !naturalWidth || !naturalHeight) return

    setArtworkRatios((current) =>
      current.has(previewImageUrl) ? current : new Map(current).set(previewImageUrl, naturalWidth / naturalHeight)
    )
  }

  // The choice is what the florist prints, so it is confirmed before it is sent.
  const handleApply = async () => {
    if (!activeVersion) return

    const confirmed = await confirm({
      title: t('orders.cards.confirmApply.title'),
      description: t('orders.cards.confirmApply.description', { index: activeVersion.label }),
      confirmText: t('orders.cards.actions.apply')
    })

    if (!confirmed) return

    applyVersion(activeVersion.id, {
      onSuccess: () => {
        toast.success(t('orders.cards.toast.applied', { index: activeVersion.label }))
        onDone()
      },
      onError: () => toast.error(t('orders.cards.toast.applyError'))
    })
  }

  const handleGenerate = () => {
    generate({
      onSuccess: () => toast.success(t('orders.cards.toast.generated')),
      onError: () => toast.error(t('orders.cards.toast.generateError'))
    })
  }

  return (
    <div className='flex min-h-0 flex-1 flex-col overflow-y-auto md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:overflow-hidden'>
      <section className='flex flex-col bg-secondary/25 md:min-h-0 md:overflow-hidden'>
        <div className='relative flex min-h-0 flex-1 items-center justify-center p-5 sm:p-7'>
          <div
            style={{ aspectRatio: previewRatio }}
            className='relative w-[min(14rem,55vw)] max-w-full md:h-full md:max-h-[24rem] md:w-auto'
          >
            <OrderCardArtwork
              showWords
              onReady={measureArtwork}
              imageUrl={previewImageUrl}
              alt={
                activeVersion
                  ? t('orders.cards.previewAlt', { index: activeVersion.label })
                  : t('orders.cards.noVersion')
              }
              message={draft.message}
              writingMethod={activeVersion?.writingMethod ?? card.writingMethod}
              sizes='(min-width: 768px) 20rem, 60vw'
              className='size-full rounded-3xl shadow-[0_0.8rem_2rem_rgb(81_108_108/20%)] ring-1 ring-foreground/10'
            />

            {activeVersion ? (
              <span className='absolute left-2 top-2 flex max-w-[calc(100%-1rem)] items-baseline gap-1.5 rounded-full bg-card/90 px-2 py-0.5 text-[0.7rem] font-semibold text-primary ring-1 ring-primary/10 backdrop-blur-sm'>
                {t('orders.cards.versions.label', { index: activeVersion.label })}
                {activeVersion.name ? (
                  <span className='truncate font-medium text-muted-foreground'>{activeVersion.name}</span>
                ) : null}
              </span>
            ) : null}
          </div>

          {isGenerating ? <OrderCardGenerationOverlay versionLabel={versions.length + 1} stage={stage} /> : null}
        </div>

        <div className='shrink-0 border-t border-border/60 bg-card/60 p-3 sm:p-4'>
          <p className='mb-1.5 flex items-baseline justify-between gap-3'>
            <span className='text-[0.7rem] font-medium text-muted-foreground'>
              {t('orders.cards.versions.heading')}
            </span>
            {versions.length > 0 ? (
              <span className='text-[0.7rem] font-semibold tabular-nums text-foreground/70'>
                {t('orders.cards.versions.counter', {
                  index: activeVersion?.label ?? versions.length,
                  total: versions.length
                })}
              </span>
            ) : null}
          </p>

          {isLoadingVersions ? (
            <div className='flex gap-2'>
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} style={{ aspectRatio: previewRatio }} className='w-14 rounded-2xl sm:w-16' />
              ))}
            </div>
          ) : isVersionsError ? (
            <p className='rounded-2xl bg-secondary/20 px-3 py-4 text-center text-xs text-muted-foreground ring-1 ring-foreground/5'>
              {t('orders.cards.versions.error')}
            </p>
          ) : (
            <OrderCardVersionStrip
              versions={versions}
              activeVersionId={activeVersionId}
              selectedVersionId={selectedVersionId}
              ratio={previewRatio}
              disabled={isGenerating}
              onSelect={selectVersion}
            />
          )}
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
                  {settledVersion?.name
                    ? `${settledVersion.name} · ${t('orders.cards.forProduct', { name: card.productName })}`
                    : t('orders.cards.forProduct', { name: card.productName })}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {isSettled ? (
            <p className='flex items-start gap-2 rounded-2xl bg-leaf/10 px-3 py-2.5 text-xs leading-relaxed text-foreground/90 ring-1 ring-leaf/20'>
              <HugeiconsIcon icon={CheckmarkBadge01Icon} strokeWidth={2} className='mt-px size-4 shrink-0 text-leaf' />
              <span>
                {settledVersion
                  ? t('orders.cards.final.settledNotice', { index: settledVersion.label })
                  : t('orders.cards.final.settledNoticeGeneric')}
              </span>
            </p>
          ) : null}

          <OrderCardLockedSpecs
            sizeName={card.sizeName}
            writingMethod={card.writingMethod}
            minWords={card.minWords}
            maxWords={card.maxWords}
            isSettled={isSettled}
          />

          {/* Settled: the words are what was printed, so they are shown rather than offered. */}
          {isSettled ? (
            settledMessage ? (
              <div className='rounded-2xl bg-secondary/20 p-3 ring-1 ring-foreground/5'>
                <p className='text-[0.7rem] font-medium text-muted-foreground'>{t('orders.checkout.cards.message')}</p>
                <p className='mt-1 text-sm leading-relaxed text-foreground italic'>“{settledMessage}”</p>
              </div>
            ) : null
          ) : (
            <>
              {/* A reused card is its artwork - there is no design to pick, so the picker stays shut. */}
              {isTemplateLocked ? (
                <p className='rounded-2xl bg-secondary/20 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground ring-1 ring-foreground/5'>
                  {t('orders.cards.locked.templateReused')}
                </p>
              ) : (
                <CardTemplatePicker
                  templates={templates}
                  isLoading={isGettingCardTemplates}
                  isLoadingMore={isGettingMoreCardTemplates}
                  hasMore={hasMoreCardTemplates}
                  onLoadMore={loadMoreCardTemplates}
                  value={template.templateId}
                  onChange={editTemplate}
                />
              )}

              <CardContentFields
                value={content}
                onChange={editContent}
                messageInvalid={showMessageError || isOverBudget || isBelowBudget}
                maxWords={card.maxWords}
              />

              {isBelowBudget ? (
                <p className='text-xs font-medium text-destructive'>
                  {t('orders.cards.messageMinWords', { min: card.minWords })}
                </p>
              ) : null}
            </>
          )}

          <div className='space-y-2 rounded-2xl bg-secondary/20 p-3 ring-1 ring-foreground/5'>
            <div className='flex items-baseline justify-between gap-3'>
              <span className='text-[0.7rem] font-medium text-muted-foreground'>{t('orders.cards.price.paid')}</span>
              <span className='font-title text-base font-bold tabular-nums text-primary'>
                {formatVnd(card.paidUnitPrice)}
              </span>
            </div>

            <p className='border-t border-border/60 pt-2 text-[0.7rem] leading-relaxed text-muted-foreground'>
              {t('orders.cards.price.note')}
            </p>
          </div>
        </div>

        <div className='sticky bottom-0 mt-auto space-y-2 border-t border-border/60 bg-popover p-4 sm:p-5'>
          {isSettled ? (
            <Button type='button' variant='outline' className='w-full' onClick={onDone}>
              {t('orders.cards.actions.close')}
            </Button>
          ) : (
            <>
              {hasChanges && versions.length > 0 ? (
                <p className='text-xs text-muted-foreground'>{t('orders.cards.actions.applyHint')}</p>
              ) : null}

              <div className='grid gap-2 sm:grid-cols-2'>
                <Button
                  type='button'
                  variant={hasChanges ? 'default' : 'outline'}
                  onClick={handleGenerate}
                  disabled={!canGenerate}
                >
                  {isGenerating ? (
                    <Spinner className='size-4' />
                  ) : (
                    <HugeiconsIcon icon={AiMagicIcon} strokeWidth={2} className='size-4' />
                  )}
                  {versions.length === 0
                    ? t('orders.cards.actions.generateFirst')
                    : t('orders.cards.actions.regenerate')}
                </Button>

                <Button
                  type='button'
                  variant={hasChanges ? 'outline' : 'default'}
                  onClick={handleApply}
                  disabled={isGenerating || isApplying || !activeVersion || isSelectedVersion}
                >
                  {isApplying ? <Spinner className='size-4' /> : null}
                  {isSelectedVersion ? (
                    <>
                      <HugeiconsIcon icon={Tick02Icon} strokeWidth={2.5} className='size-4' />
                      {t('orders.cards.actions.applied')}
                    </>
                  ) : (
                    t('orders.cards.actions.apply')
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
