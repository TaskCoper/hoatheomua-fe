'use client'

import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Skeleton } from '@/components/ui/skeleton'
import { useLoadMoreOnView } from '@/hooks/use-load-more-on-view'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import type { I18nKey } from '@/lib/i18n/types'
import PreviewImage from '@/shared/components/preview-image'
import { cn } from '@/shared/utils'
import type { CardTemplate } from '@/types/card-template.type'
import { Search01Icon, Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useId, useMemo, useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import Captions from 'yet-another-react-lightbox/plugins/captions'
import 'yet-another-react-lightbox/plugins/captions.css'
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import 'yet-another-react-lightbox/plugins/thumbnails.css'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'
import {
  CARD_TEMPLATE_ORIENTATIONS,
  groupCardTemplates,
  toCardTemplateOrientation,
  type CardTemplateOrientation
} from '../../../cards/template-orientation'
import { useCardTemplateRatios } from '../../../hooks/use-card-template-ratios'

const ORIENTATION_LABEL_KEYS: Record<CardTemplateOrientation, I18nKey> = {
  vertical: 'orders.checkout.cards.templateOrientation.vertical',
  horizontal: 'orders.checkout.cards.templateOrientation.horizontal'
}

const ORIENTATION_GRID: Record<CardTemplateOrientation, string> = {
  vertical: 'grid grid-cols-3 gap-2 sm:grid-cols-6',
  horizontal: 'grid grid-cols-2 gap-2 sm:grid-cols-3'
}

const PLACEHOLDER_RATIO = 3 / 4

const ORIENTATION_IMAGE_SIZES: Record<CardTemplateOrientation, string> = {
  vertical: '(min-width: 640px) 17vw, 32vw',
  horizontal: '(min-width: 640px) 34vw, 50vw'
}

interface CardTemplatePickerProps {
  templates: CardTemplate[]
  isLoading?: boolean
  isLoadingMore?: boolean
  hasMore?: boolean
  onLoadMore?: () => void
  value: string
  onChange: (template: CardTemplate) => void
  disabled?: boolean
  compact?: boolean
}

export default function CardTemplatePicker({
  templates,
  isLoading,
  isLoadingMore,
  hasMore,
  onLoadMore,
  value,
  onChange,
  disabled,
  compact = false
}: CardTemplatePickerProps) {
  const { t } = useTranslation()
  const groupId = useId()
  const gridClasses = compact
    ? { vertical: 'grid grid-cols-3 gap-3', horizontal: 'grid grid-cols-2 gap-3' }
    : ORIENTATION_GRID

  const { ratios, measureTemplate } = useCardTemplateRatios()
  const [lightboxIndex, setLightboxIndex] = useState(-1)

  const grouped = useMemo(() => groupCardTemplates(templates, ratios), [templates, ratios])

  const slides = useMemo(
    () =>
      templates.map((template) => ({
        src: template.imageUrl,
        alt: template.name,
        title: template.name,
        description: template.description
      })),
    [templates]
  )

  const sentinelRef = useLoadMoreOnView({
    enabled: !!hasMore && !isLoadingMore && !!onLoadMore,
    onLoadMore: () => onLoadMore?.(),
    rootMargin: '240px 0px'
  })

  const renderTile = (template: CardTemplate) => (
    <TemplateTile
      key={template.id}
      template={template}
      groupId={groupId}
      ratio={ratios.get(template.id) ?? null}
      isActive={template.id === value}
      isDisabled={!!disabled}
      onMeasure={measureTemplate}
      onZoom={() => setLightboxIndex(templates.findIndex((item) => item.id === template.id))}
    />
  )

  return (
    <div className='space-y-1.5'>
      <p className='text-sm font-medium'>{t('orders.checkout.cards.template')}</p>

      {isLoading ? (
        <div className={gridClasses.vertical}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className='aspect-[3/4] w-full rounded-2xl' />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <p className='rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center text-xs text-muted-foreground'>
          {t('orders.checkout.cards.templateEmpty')}
        </p>
      ) : (
        <RadioGroup
          value={value}
          disabled={disabled}
          onValueChange={(templateId) => {
            if (disabled) return

            const picked = templates.find((template) => template.id === templateId)
            if (picked) onChange(picked)
          }}
          className='gap-3'
          aria-label={t('orders.checkout.cards.template')}
        >
          {CARD_TEMPLATE_ORIENTATIONS.map((orientation) =>
            grouped[orientation].length > 0 ? (
              <section key={orientation} className='space-y-1.5'>
                <p className='text-xs font-medium text-muted-foreground'>
                  {t(ORIENTATION_LABEL_KEYS[orientation])}
                  <span className='ml-1 tabular-nums'>({grouped[orientation].length})</span>
                </p>

                <div className={gridClasses[orientation]}>{grouped[orientation].map(renderTile)}</div>
              </section>
            ) : null
          )}

          {grouped.pending.length > 0 ? (
            <div className={gridClasses.vertical}>{grouped.pending.map(renderTile)}</div>
          ) : null}
        </RadioGroup>
      )}

      {!isLoading && templates.length > 0 ? (
        <div ref={sentinelRef}>
          {isLoadingMore ? (
            <div className={gridClasses.vertical}>
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className='aspect-[3/4] w-full rounded-2xl' />
              ))}
            </div>
          ) : hasMore ? (
            <div className='flex justify-center pt-1'>
              <Button type='button' variant='outline' size='sm' onClick={onLoadMore}>
                {t('orders.checkout.cards.templateLoadMore')}
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      <Lightbox
        open={lightboxIndex >= 0}
        close={() => setLightboxIndex(-1)}
        index={Math.max(lightboxIndex, 0)}
        slides={slides}
        plugins={[Captions, Fullscreen, Thumbnails, Zoom]}
        carousel={{ finite: slides.length <= 1 }}
        thumbnails={{ position: 'bottom', showToggle: true }}
        zoom={{ maxZoomPixelRatio: 3, scrollToZoom: false }}
      />
    </div>
  )
}

function TemplateTile({
  template,
  groupId,
  ratio,
  isActive,
  isDisabled,
  onMeasure,
  onZoom
}: {
  template: CardTemplate
  groupId: string
  ratio: number | null
  isActive: boolean
  isDisabled: boolean
  onMeasure: (templateId: string, size: { naturalWidth: number; naturalHeight: number }) => void
  onZoom: () => void
}) {
  const { t } = useTranslation()
  const id = `${groupId}-${template.id}`
  const sizes = ORIENTATION_IMAGE_SIZES[ratio === null ? 'vertical' : toCardTemplateOrientation(ratio)]

  return (
    <label
      htmlFor={id}
      title={template.description || template.name}
      style={{ aspectRatio: ratio ?? PLACEHOLDER_RATIO }}
      className={cn(
        'group relative block overflow-hidden rounded-2xl border transition-colors',
        'has-[button:focus-visible]:ring-3 has-[button:focus-visible]:ring-ring/30',
        isDisabled ? 'cursor-default opacity-60' : 'cursor-pointer',
        isActive ? 'border-primary/50 ring-1 ring-primary/30' : 'border-border/60 hover:border-border'
      )}
    >
      <RadioGroupItem id={id} value={template.id} className='sr-only hidden' />

      <PreviewImage
        src={template.imageUrl}
        alt={template.name}
        sizes={sizes}
        className='size-full'
        onReady={(size) => onMeasure(template.id, size)}
      />

      <span
        aria-hidden='true'
        className='pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-foreground/80 to-transparent'
      />

      {/* Inside the label, so a plain click still picks the template rather than zooming it. */}
      <button
        type='button'
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          onZoom()
        }}
        aria-label={t('orders.checkout.cards.templatePreview', { name: template.name })}
        className='absolute right-1.5 top-1.5 grid size-7 place-items-center rounded-full bg-background/80 text-foreground/80 opacity-0 backdrop-blur-sm transition-opacity hover:text-primary focus-visible:opacity-100 group-hover:opacity-100'
      >
        <HugeiconsIcon icon={Search01Icon} className='size-3.5' strokeWidth={2} />
      </button>

      <span className='pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-1 p-2'>
        <span className='min-w-0 truncate text-xs font-medium text-white'>{template.name}</span>
        <span
          className={cn(
            'grid size-5 shrink-0 place-items-center rounded-full border transition-colors',
            isActive ? 'border-white bg-white text-primary' : 'border-white/60 text-transparent'
          )}
        >
          <HugeiconsIcon icon={Tick02Icon} className='size-3' strokeWidth={2.5} />
        </span>
      </span>
    </label>
  )
}
