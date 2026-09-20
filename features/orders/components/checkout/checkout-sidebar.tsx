'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { formatVnd } from '@/lib/currency'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link } from '@/lib/i18n/navigation'
import { ThumbnailImage } from '@/shared/components/thumbnail-image'
import { cn } from '@/shared/utils'
import { Alert02Icon, Tag01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useEffect, useState, type ReactNode } from 'react'
import { getCheckoutCardPrice } from '../../cards/card-data'
import { CARD_WRITING_METHOD_LABEL_KEYS } from '../../cards/card-labels'
import type { CheckoutCardField, GeneratedCard } from '../../cards/types'
import { useCardConfig } from '../../hooks/use-card-config'

const EMPTY_CARDS: CheckoutCardField[] = []
const EMPTY_GENERATED_CARDS: GeneratedCard[] = []

export type CheckoutLineIssue = 'missing' | 'inactive' | 'sold-out' | 'over-stock' | 'materials'

export interface CheckoutSummaryLine {
  lineId: string
  /** The product behind the line - what the card endpoints are asked about. */
  productId: string
  name: string
  variantName?: string | null
  image: string | null
  quantity: number
  unitPrice: number
  subtotal: number
  isResolving?: boolean
  issue?: CheckoutLineIssue | null
  available?: number | null
}

interface SummaryLine {
  label: string
  value: string
}

interface CheckoutSidebarProps {
  lines: CheckoutSummaryLine[]
  totalItems: number
  recipientName?: string
  recipientPhone?: string
  address?: string
  orderTimeLabel?: string
  deliveryTimeLabel?: string
  remarks?: string
  deliveryMethodLabel?: string
  paymentMethodLabel?: string
  extraLines?: SummaryLine[]
  productsSubtotal: number
  vatAmount: number
  hasTaxCode: boolean
  cardsFee?: number
  shippingFee: number
  shippingDiscount?: number
  showShipping?: boolean
  grandTotal: number
  action: {
    label: string
    onClick: () => void
    disabled?: boolean
    loading?: boolean
  }
  /** Sits right above the action button - why it cannot be pressed. */
  notice?: React.ReactNode
  showTerms?: boolean
  sticky?: boolean
  /** Off on the review step - StepReview shows recipient/delivery/payment up top. */
  showRecap?: boolean
  /** Cards already added, listed under the product each one is attached to. */
  cards?: CheckoutCardField[]
  generatedCards?: GeneratedCard[]
}

export default function CheckoutSidebar({
  lines,
  totalItems,
  recipientName,
  recipientPhone,
  address,
  orderTimeLabel,
  deliveryTimeLabel,
  remarks,
  deliveryMethodLabel,
  paymentMethodLabel,
  extraLines,
  productsSubtotal,
  vatAmount,
  hasTaxCode,
  cardsFee = 0,
  shippingFee,
  shippingDiscount = 0,
  showShipping = true,
  grandTotal,
  action,
  notice,
  showTerms = true,
  sticky = true,
  showRecap = true,
  cards = EMPTY_CARDS,
  generatedCards = EMPTY_GENERATED_CARDS
}: CheckoutSidebarProps) {
  const { t } = useTranslation()
  const [termsAccepted, setTermsAccepted] = useState(true)
  const isActionDisabled = action.disabled || action.loading || (showTerms && !termsAccepted)

  const isPricingLoading = lines.some((line) => line.isResolving)

  return (
    <aside className={cn('space-y-2', sticky && 'sticky top-6')}>
      <section className='rounded-3xl border border-border bg-card p-5'>
        <header className='mb-4 flex items-baseline justify-between gap-3'>
          <h2 className='font-title text-base font-semibold'>{t('orders.checkout.sidebar.summaryTitle')}</h2>
          <span className='shrink-0 text-xs text-muted-foreground'>
            {t('orders.checkout.sidebar.itemsCount', { count: totalItems })}
          </span>
        </header>

        {lines.length > 0 ? (
          <ul className='mb-4 divide-y divide-dashed divide-border border-y border-dashed border-border'>
            {lines.map((line) => (
              <CheckoutLineItem
                key={line.lineId}
                line={line}
                cards={cards.filter((card) => card.lineId === line.lineId)}
                generatedCards={generatedCards}
              />
            ))}
          </ul>
        ) : null}

        {showRecap ? (
          <dl className='space-y-3 text-sm'>
            {recipientName ? <SidebarRow label={t('orders.checkout.fullNameReceiver')} value={recipientName} /> : null}
            {recipientPhone ? <SidebarRow label={t('orders.checkout.phoneReceiver')} value={recipientPhone} /> : null}
            {address ? (
              <SidebarRow label={t('orders.checkout.sidebar.address')} value={address} multiline clamp />
            ) : null}
            {orderTimeLabel ? <SidebarRow label={t('orders.checkout.orderTime')} value={orderTimeLabel} /> : null}
            {deliveryTimeLabel ? <SidebarRow label={t('orders.checkout.tag')} value={deliveryTimeLabel} /> : null}
            {remarks ? <SidebarRow label={t('orders.checkout.remarks')} value={remarks} multiline clamp /> : null}
            {deliveryMethodLabel ? (
              <SidebarRow label={t('orders.checkout.shippingChosenTitle')} value={deliveryMethodLabel} />
            ) : null}
            {paymentMethodLabel ? (
              <SidebarRow label={t('orders.checkout.paymentTitle')} value={paymentMethodLabel} />
            ) : null}
            {extraLines?.map((line) => (
              <SidebarRow key={line.label} label={line.label} value={line.value} />
            ))}
          </dl>
        ) : null}

        <div className={cn('pt-4', showRecap && 'mt-5 border-t border-dashed border-border')}>
          <h3 className='mb-3 font-title text-base font-semibold'>{t('orders.checkout.sidebar.priceTitle')}</h3>
          <dl className='space-y-2 text-sm'>
            <SidebarRow
              label={t('orders.checkout.subtotal')}
              value={formatVnd(productsSubtotal)}
              loading={isPricingLoading}
            />
            {hasTaxCode ? (
              <SidebarRow label={t('orders.checkout.vat')} value={formatVnd(vatAmount)} loading={isPricingLoading} />
            ) : null}
            {cardsFee > 0 ? <SidebarRow label={t('orders.checkout.cardsFee')} value={formatVnd(cardsFee)} /> : null}
            {showShipping ? (
              <>
                <SidebarRow label={t('orders.checkout.shippingFee')} value={formatVnd(shippingFee)} />
                {shippingDiscount > 0 ? (
                  <SidebarRow label={t('orders.checkout.shippingFeeDiscount')} value={formatVnd(-shippingDiscount)} />
                ) : null}
              </>
            ) : null}
          </dl>
          <div className='mt-4 flex items-center justify-between border-t border-dashed border-border pt-3'>
            <span className='text-sm font-semibold'>{t('orders.checkout.total')}</span>
            {isPricingLoading ? (
              <Skeleton className='h-6 w-28 rounded-md' />
            ) : (
              <span className='flex items-center gap-2 font-title text-lg font-bold text-primary'>
                <HugeiconsIcon icon={Tag01Icon} strokeWidth={2} className='size-4' />
                {formatVnd(grandTotal)}
              </span>
            )}
          </div>
        </div>
      </section>

      <section className='space-y-3 rounded-3xl border border-border bg-card p-5'>
        {showTerms ? (
          <label className='flex items-start gap-2 text-xs leading-relaxed text-muted-foreground'>
            <Checkbox
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked === true)}
              className='mt-0.5'
            />
            <span>
              {t('orders.checkout.sidebar.termsPrefix')}{' '}
              <Link href='/terms' className='text-primary underline underline-offset-2'>
                {t('orders.checkout.sidebar.termsLink')}
              </Link>{' '}
              {t('orders.checkout.sidebar.termsAnd')}{' '}
              <Link href='/privacy' className='text-primary underline underline-offset-2'>
                {t('orders.checkout.sidebar.privacyLink')}
              </Link>
              .
            </span>
          </label>
        ) : null}

        {notice}

        <Button type='button' size='lg' className='w-full' onClick={action.onClick} disabled={isActionDisabled}>
          {action.loading ? <Spinner /> : null}
          {action.label}
        </Button>
      </section>
    </aside>
  )
}

function CheckoutLineItem({
  line,
  cards,
  generatedCards
}: {
  line: CheckoutSummaryLine
  cards: CheckoutCardField[]
  generatedCards: GeneratedCard[]
}) {
  const { t } = useTranslation()

  if (line.isResolving) return <CheckoutLineItemSkeleton />

  const issueLabel = line.issue
    ? {
        missing: t('orders.checkout.stock.missing'),
        inactive: t('orders.checkout.stock.inactive'),
        'sold-out': t('orders.checkout.stock.soldOut'),
        'over-stock': t('orders.checkout.stock.onlyLeft', { available: line.available ?? 0 }),
        materials: t('orders.checkout.stock.materials')
      }[line.issue]
    : null

  const meta = [
    line.variantName,
    line.quantity > 1
      ? t('orders.checkout.lineQty', { qty: line.quantity, price: formatVnd(line.unitPrice) })
      : t('orders.checkout.lineQtyOnly', { qty: line.quantity })
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <li className={cn(line.issue && 'bg-destructive/5')}>
      <SummaryItemRow
        imageUrl={line.image}
        imageAlt={line.name || t('orders.checkout.sidebar.unknownProduct')}
        title={line.name || t('orders.checkout.sidebar.unknownProduct')}
        meta={meta}
        price={formatVnd(line.subtotal)}
        issueLabel={issueLabel}
        muted={Boolean(line.issue)}
      >
        {cards.length > 0 ? (
          <div className='mt-2 space-y-1.5'>
            {cards.map((card) => (
              <CheckoutCardLine key={card.id} card={card} generatedCards={generatedCards} />
            ))}
          </div>
        ) : null}
      </SummaryItemRow>
    </li>
  )
}

/** Always rendered under the product line the card is printed for, hence the leading `+`. */
function CheckoutCardLine({ card, generatedCards }: { card: CheckoutCardField; generatedCards: GeneratedCard[] }) {
  const { t } = useTranslation()
  const { cardConfig } = useCardConfig()

  const generated =
    card.type === 'history' ? (generatedCards.find((item) => item.id === card.generatedCardId) ?? null) : null

  // A reused card carries its own snapshot; the generations list is only a fallback for older drafts.
  const templateName = card.type === 'history' ? card.templateName || generated?.templateName : card.templateName
  // The standard card is free, so it has no size to show.
  const sizeName = card.type === 'standard' ? null : card.sizeName
  const writingMethod = card.type === 'standard' ? null : card.writingMethod

  const title =
    card.type === 'standard'
      ? t('orders.checkout.cards.tabs.standard')
      : card.type === 'ai'
        ? t('orders.checkout.cards.tabs.ai')
        : t('orders.checkout.cards.reusedTitle')

  const meta = [
    templateName ? t('orders.checkout.cards.templateName', { name: templateName }) : null,
    sizeName || null,
    writingMethod ? t(CARD_WRITING_METHOD_LABEL_KEYS[writingMethod]) : null
  ]
    .filter(Boolean)
    .join(' - ')

  return (
    <div className='flex items-start justify-between gap-3 text-xs'>
      <div className='flex min-w-0 gap-1.5'>
        <span aria-hidden className='shrink-0 text-muted-foreground/70'>
          +
        </span>
        <div className='min-w-0'>
          <p className='truncate leading-5'>{title}</p>
          {meta ? <p className='text-muted-foreground'>{meta}</p> : null}
        </div>
      </div>
      <div className='shrink-0 text-right'>
        <p className='tabular-nums leading-5 text-muted-foreground'>
          {card.type === 'standard'
            ? t('orders.checkout.cards.free')
            : formatVnd(getCheckoutCardPrice(card, cardConfig))}
        </p>
        {card.quantity > 1 ? (
          <p className='tabular-nums text-muted-foreground/70'>
            {t('orders.checkout.lineQtyOnly', { qty: card.quantity })}
          </p>
        ) : null}
      </div>
    </div>
  )
}

function SummaryItemRow({
  imageUrl,
  imageAlt,
  title,
  meta,
  price,
  issueLabel,
  muted = false,
  children
}: {
  imageUrl: string | null
  imageAlt: string
  title: string
  meta: string
  price: string
  issueLabel?: string | null
  muted?: boolean
  children?: ReactNode
}) {
  return (
    <div className={cn('flex items-start gap-3 py-3', muted && 'opacity-50')}>
      <div className='relative size-16 shrink-0 overflow-hidden rounded-xl border border-border bg-secondary/40'>
        <ThumbnailImage src={imageUrl} alt={imageAlt} fill className='object-cover' sizes='64px' fallback={null} />
      </div>

      <div className='min-w-0 flex-1'>
        <div className='flex items-start justify-between gap-3'>
          <p className='min-w-0 truncate text-sm font-medium leading-5'>{title}</p>
          <span className='shrink-0 tabular-nums text-sm font-semibold leading-5'>{price}</span>
        </div>
        {meta ? <p className='truncate text-xs text-muted-foreground'>{meta}</p> : null}
        {issueLabel ? (
          <span className='mt-1.5 inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive'>
            <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} className='size-3 shrink-0' />
            {issueLabel}
          </span>
        ) : null}
        {children}
      </div>
    </div>
  )
}

function CheckoutLineItemSkeleton() {
  return (
    <li className='flex items-start gap-3 py-3'>
      <Skeleton className='size-16 shrink-0 rounded-xl' />
      <div className='min-w-0 flex-1 space-y-2'>
        <div className='flex items-start justify-between gap-3'>
          <Skeleton className='h-4 w-32 rounded-md' />
          <Skeleton className='h-4 w-16 shrink-0 rounded-md' />
        </div>
        <Skeleton className='h-3 w-20 rounded-md' />
      </div>
    </li>
  )
}

function SidebarRow({
  label,
  value,
  multiline,
  loading,
  clamp
}: {
  label: string
  value: string
  multiline?: boolean
  loading?: boolean
  clamp?: boolean
}) {
  return (
    <div className={cn('flex items-start justify-between gap-3', multiline && 'flex-col sm:flex-row')}>
      <dt className='shrink-0 text-muted-foreground'>{label}</dt>
      <dd className={cn('text-right font-medium tabular-nums', multiline && 'min-w-0 sm:max-w-[60%]')}>
        {loading ? (
          <Skeleton className='ml-auto h-4 w-20 rounded-md' />
        ) : clamp ? (
          <ClampedValue value={value} />
        ) : (
          value
        )}
      </dd>
    </div>
  )
}

function ClampedValue({ value }: { value: string }) {
  const { t } = useTranslation()
  const [element, setElement] = useState<HTMLParagraphElement | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isOverflowing, setIsOverflowing] = useState(false)

  useEffect(() => {
    if (!element || isExpanded) return

    const observer = new ResizeObserver(() => {
      setIsOverflowing(element.scrollHeight > element.clientHeight + 1)
    })
    observer.observe(element)

    return () => observer.disconnect()
  }, [element, isExpanded])

  return (
    <>
      <p ref={setElement} className={cn('wrap-break-words', !isExpanded && 'line-clamp-2')}>
        {value}
      </p>
      {isOverflowing ? (
        <button
          type='button'
          onClick={() => setIsExpanded((prev) => !prev)}
          className='mt-0.5 text-xs font-normal text-primary underline-offset-2 hover:underline'
        >
          {isExpanded ? t('orders.checkout.sidebar.viewLess') : t('orders.checkout.sidebar.viewMore')}
        </button>
      ) : null}
    </>
  )
}
