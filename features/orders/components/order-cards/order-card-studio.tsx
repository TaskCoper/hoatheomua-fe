'use client'

import { Button } from '@/components/ui/button'
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { formatVnd } from '@/lib/currency'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import DownloadImageButton from '@/shared/components/download-image-button'
import { useConfirmStore } from '@/stores/confirm.store'
import { CardTemplateType } from '@/types/card-template.type'
import {
  AiMagicIcon,
  CheckmarkBadge01Icon,
  Layers01Icon,
  SparklesIcon,
  SquareLock02Icon,
  Tick02Icon
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useEffect, useRef, useState } from 'react'
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

const DEFAULT_CARD_RATIO = 3 / 4

interface OrderCardStudioProps {
  card: OrderAiCard
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
    isOverBudget,
    status,
    stage,
    job,
    cancelJob,
    isCanceling,
    isConnectionError,
    isApplying,
    showMessageError,
    hasChanges,
    canGenerate,
    isTemplateLocked,
    isEditLocked,
    isFirstRun,
    isSettled,
    isSelectedVersion,
    editContent,
    editTemplate,
    selectVersion,
    applyVersion,
    generate
  } = useOrderCardDesigner({ card, enabled: isOpen })

  // A settled card can neither be redesigned nor regenerated - the list is a request worth skipping.
  const { templates, isGettingCardTemplates, isGettingMoreCardTemplates, hasMoreCardTemplates, loadMoreCardTemplates } =
    useCardTemplates(CardTemplateType.Ai, { enabled: !isSettled })

  const isGenerating = status === 'generating'
  const confirm = useConfirmStore((state) => state.confirm)

  const settledVersion = isSettled ? findOrderCardVersion(versions, selectedVersionId) : null

  const settledMessage = settledVersion?.content.message || card.content.message

  const previewImageUrl = activeVersion?.imageUrl || template.templateImageUrl || card.rawImageUrl

  // The artwork keeps its own shape, measured as it paints; the card's printed size holds the
  // frame steady until then.
  const [artworkRatios, setArtworkRatios] = useState<ReadonlyMap<string, number>>(new Map())
  const previewRatio = artworkRatios.get(previewImageUrl) ?? card.sizeRatio ?? DEFAULT_CARD_RATIO

  const measureArtwork = ({ naturalWidth, naturalHeight }: { naturalWidth: number; naturalHeight: number }) => {
    if (!previewImageUrl || !naturalWidth || !naturalHeight) return

    setArtworkRatios((current) =>
      current.has(previewImageUrl) ? current : new Map(current).set(previewImageUrl, naturalWidth / naturalHeight)
    )
  }

  const previewRef = useRef<HTMLDivElement>(null)
  const [previewBounds, setPreviewBounds] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const element = previewRef.current
    if (!element) return

    const observer = new ResizeObserver(([entry]) => {
      setPreviewBounds({ width: entry.contentRect.width, height: entry.contentRect.height })
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  // Fit both portrait and landscape artwork inside the available preview area.
  const previewWidth = Math.min(previewBounds.width, previewBounds.height * previewRatio)

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
      }
    })
  }

  const handleGenerate = () => {
    generate({
      onSuccess: () => toast.success(t('orders.cards.toast.generated')),
      onError: (error) =>
        toast.error(t('orders.cards.toast.generateError'), {
          description: error?.response?.data?.detail
        })
    })
  }

  return (
    <div className='flex min-h-0 flex-1 flex-col bg-background'>
      <div className='relative z-10 shrink-0 border-b border-secondary/40 bg-background/85 px-4 py-4 backdrop-blur-md sm:px-6 sm:py-5 lg:px-8'>
        <DialogHeader className='pr-10'>
          <div className='flex items-center gap-2.5'>
            <span className='grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/15'>
              <HugeiconsIcon icon={AiMagicIcon} strokeWidth={1.75} className='size-4' />
            </span>
            <div className='min-w-0'>
              <DialogTitle className='truncate font-title text-base font-bold leading-tight sm:text-lg'>
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
      </div>

      <div className='min-h-0 flex-1 overflow-y-auto overscroll-contain md:grid md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:grid-rows-[minmax(0,1fr)] md:overflow-hidden'>
        <section className='relative flex min-w-0 shrink-0 flex-col overflow-hidden bg-secondary/40 md:min-h-0 md:shrink md:overflow-y-auto'>
          <div className='relative flex shrink-0 flex-1 flex-col gap-4 p-4 sm:p-6'>
            <div
              ref={previewRef}
              className='flex h-64 min-h-32 w-full items-center justify-center sm:h-80 md:h-auto md:flex-1'
            >
              <div
                style={{
                  aspectRatio: previewRatio,
                  width: previewWidth || undefined,
                  height: previewWidth ? previewWidth / previewRatio : undefined
                }}
                className='relative max-h-full w-full max-w-full shrink-0'
              >
                <span
                  aria-hidden='true'
                  className='pointer-events-none absolute inset-x-6 -bottom-3 h-6 rounded-[50%] bg-foreground/20 blur-xl'
                />

                <OrderCardArtwork
                  showWords={false}
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
                  className='size-full rounded-3xl shadow-[0_1.5rem_3rem_rgb(81_108_108/28%)] ring-1 ring-foreground/10'
                />

                {activeVersion ? (
                  <span className='absolute left-2 top-2 flex max-w-[calc(100%-1rem)] items-baseline gap-1.5 rounded-full bg-card/90 px-2 py-0.5 text-[0.7rem] font-semibold text-primary ring-1 ring-primary/10 backdrop-blur-sm'>
                    {t('orders.cards.versions.label', { index: activeVersion.label })}
                    {activeVersion.name ? (
                      <span className='truncate font-medium text-muted-foreground'>{activeVersion.name}</span>
                    ) : null}
                  </span>
                ) : null}

                <DownloadImageButton
                  src={previewImageUrl}
                  filename={`${card.productName}-${activeVersion?.label ?? 'card'}`}
                  className='absolute right-2 top-2 size-7'
                  iconClassName='size-3.5'
                />
              </div>
            </div>

            {isGenerating ? (
              <OrderCardGenerationOverlay
                versionLabel={versions.length + 1}
                stage={stage}
                cancel={cancelJob}
                isCanceling={isCanceling}
                isConnectionError={isConnectionError}
              />
            ) : null}
            {!isGenerating && job?.status === 'Failed' ? (
              <p role='alert' className='mt-3 text-sm text-destructive'>
                {t('orders.cards.toast.generateError')}
              </p>
            ) : null}
            {!isGenerating && job?.status === 'Canceled' ? (
              <p role='status' className='mt-3 text-sm'>
                {t('orders.cards.generation.canceled')}
              </p>
            ) : null}
            {!isGenerating && isConnectionError ? (
              <p role='alert' className='mt-3 text-sm'>
                {t('orders.cards.generation.connectionError')}
              </p>
            ) : null}
          </div>

          <div className='relative shrink-0 border-t border-secondary/40 bg-background/90 p-3 backdrop-blur-md sm:p-4'>
            <div className='mx-auto w-full max-w-4xl'>
              <p className='mb-2 flex items-baseline justify-between gap-3'>
                <span className='inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground'>
                  <HugeiconsIcon icon={Layers01Icon} strokeWidth={2} className='size-3.5 text-primary' />
                  {t('orders.cards.versions.heading')}
                </span>
                {versions.length > 0 ? (
                  <span className='rounded-full bg-secondary/50 px-2 py-0.5 text-[0.7rem] font-semibold tabular-nums text-secondary-foreground'>
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
          </div>
        </section>

        <section className='flex min-w-0 flex-col border-t border-secondary/40 md:min-h-0 md:border-l md:border-t-0'>
          <div className='mx-auto w-full min-h-0 max-w-4xl space-y-5 px-4 py-6 sm:px-6 sm:py-8 md:flex-1 md:overflow-y-auto md:overscroll-contain lg:px-8'>
            {isSettled ? (
              <p className='flex items-start gap-2 rounded-2xl bg-leaf/10 px-3 py-2.5 text-xs leading-relaxed text-foreground/90 ring-1 ring-leaf/20'>
                <HugeiconsIcon
                  icon={CheckmarkBadge01Icon}
                  strokeWidth={2}
                  className='mt-px size-4 shrink-0 text-leaf'
                />
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
            />

            {isSettled ? (
              settledMessage ? (
                <div className='rounded-2xl bg-secondary/20 p-3 ring-1 ring-foreground/5'>
                  <p className='text-[0.7rem] font-medium text-muted-foreground'>
                    {t('orders.checkout.cards.message')}
                  </p>
                  <p className='mt-1 text-sm leading-relaxed text-foreground italic'>“{settledMessage}”</p>
                </div>
              ) : null
            ) : (
              <>
                {isFirstRun ? (
                  <StudioNote icon={SparklesIcon}>{t('orders.cards.locked.firstRunNote')}</StudioNote>
                ) : null}

                {isTemplateLocked ? (
                  <StudioNote icon={SquareLock02Icon}>{t('orders.cards.locked.templateReused')}</StudioNote>
                ) : (
                  <CardTemplatePicker
                    compact
                    templates={templates}
                    isLoading={isGettingCardTemplates}
                    isLoadingMore={isGettingMoreCardTemplates}
                    hasMore={hasMoreCardTemplates}
                    onLoadMore={loadMoreCardTemplates}
                    value={template.templateId}
                    onChange={editTemplate}
                    disabled={isEditLocked}
                  />
                )}

                <CardContentFields
                  value={content}
                  onChange={editContent}
                  messageInvalid={showMessageError || isOverBudget}
                  maxWords={card.maxWords}
                  disabled={isEditLocked}
                />
              </>
            )}

            <div className='space-y-2 rounded-2xl bg-primary/5 p-3.5 ring-1 ring-primary/10'>
              <div className='flex items-baseline justify-between gap-3'>
                <span className='text-sm font-semibold text-muted-foreground'>{t('orders.cards.price.paid')}</span>
                <span className='font-title text-xl font-bold leading-none tabular-nums text-primary'>
                  {formatVnd(card.paidUnitPrice)}
                </span>
              </div>

              <p className='border-t border-primary/10 pt-2 text-[0.7rem] leading-relaxed text-muted-foreground'>
                {t('orders.cards.price.note')}
              </p>
            </div>
          </div>

          <div className='sticky bottom-0 z-10 mx-auto mt-auto w-full max-w-4xl shrink-0 space-y-2 border-t border-secondary/40 bg-background/90 p-4 backdrop-blur-md sm:px-6 sm:py-4 lg:px-8'>
            <span
              aria-hidden='true'
              className='pointer-events-none absolute inset-x-0 -top-6 h-6 bg-gradient-to-t from-background/90 to-transparent'
            />

            {isSettled ? (
              <Button type='button' variant='outline' className='w-full' onClick={onDone}>
                {t('orders.cards.actions.close')}
              </Button>
            ) : (
              <>
                {hasChanges && versions.length > 0 ? (
                  <p className='flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground'>
                    <HugeiconsIcon
                      icon={Tick02Icon}
                      strokeWidth={2.5}
                      className='mt-0.5 size-3.5 shrink-0 text-primary'
                    />
                    {t('orders.cards.actions.applyHint')}
                  </p>
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
    </div>
  )
}

function StudioNote({ icon, children }: { icon: typeof AiMagicIcon; children: React.ReactNode }) {
  return (
    <p className='flex items-start gap-2 rounded-2xl bg-secondary/25 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground ring-1 ring-foreground/5'>
      <HugeiconsIcon icon={icon} strokeWidth={2} className='mt-px size-3.5 shrink-0 text-primary' />
      <span>{children}</span>
    </p>
  )
}
