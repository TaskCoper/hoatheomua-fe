'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Spinner } from '@/components/ui/spinner'
import { formatVnd } from '@/lib/currency'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link } from '@/lib/i18n/navigation'
import { cn } from '@/shared/utils'
import { Alert02Icon, Tag01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Image from 'next/image'
import { useState } from 'react'

/** Why a line cannot be bought right now, checked against live stock at render time. */
export type CheckoutLineIssue = 'missing' | 'inactive' | 'sold-out' | 'over-stock'

export interface CheckoutSummaryLine {
  lineId: string
  name: string
  variantName?: string | null
  image: string | null
  quantity: number
  unitPrice: number
  subtotal: number
  issue?: CheckoutLineIssue | null
  /** Live sellable quantity, or null when the stock endpoint said nothing about it. */
  available?: number | null
}

interface SummaryLine {
  label: string
  value: string
}

interface CheckoutSidebarProps {
  lines: CheckoutSummaryLine[]
  totalItems: number
  address?: string
  orderTimeLabel?: string
  deliveryTimeLabel?: string
  extraLines?: SummaryLine[]
  productsSubtotal: number
  vatAmount: number
  hasTaxCode: boolean
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
  showTerms?: boolean
}

export function CheckoutSidebar({
  lines,
  totalItems,
  address,
  orderTimeLabel,
  deliveryTimeLabel,
  extraLines,
  productsSubtotal,
  vatAmount,
  hasTaxCode,
  shippingFee,
  shippingDiscount = 0,
  showShipping = true,
  grandTotal,
  action,
  showTerms = true
}: CheckoutSidebarProps) {
  const { t } = useTranslation()
  const [termsAccepted, setTermsAccepted] = useState(true)
  const isActionDisabled = action.disabled || action.loading || (showTerms && !termsAccepted)

  return (
    <aside className='sticky top-6 space-y-2'>
      <section className='rounded-3xl bg-card p-5 border border-border'>
        <div className='mb-4 flex items-baseline justify-between'>
          <h2 className='font-title text-base font-semibold'>{t('orders.checkout.sidebar.summaryTitle')}</h2>
          <span className='text-xs text-muted-foreground'>
            {t('orders.checkout.sidebar.itemsCount', { count: totalItems })}
          </span>
        </div>

        {lines.length > 0 ? (
          <ul className='mb-4 divide-y divide-border/60 rounded-2xl border border-border/60 bg-background/50'>
            {lines.map((line) => (
              <CheckoutLineItem key={line.lineId} line={line} />
            ))}
          </ul>
        ) : null}

        <dl className='space-y-3 text-sm'>
          {address ? <SidebarRow label={t('orders.checkout.sidebar.address')} value={address} multiline /> : null}
          {orderTimeLabel ? <SidebarRow label={t('orders.checkout.orderTime')} value={orderTimeLabel} /> : null}
          {deliveryTimeLabel ? <SidebarRow label={t('orders.checkout.tag')} value={deliveryTimeLabel} /> : null}
          {extraLines?.map((line) => (
            <SidebarRow key={line.label} label={line.label} value={line.value} />
          ))}
        </dl>

        <div className='mt-5 border-t border-border/70 pt-4'>
          <h3 className='mb-3 font-title text-base font-semibold'>{t('orders.checkout.sidebar.priceTitle')}</h3>
          <dl className='space-y-2 text-sm'>
            <SidebarRow label={t('orders.checkout.subtotal')} value={formatVnd(productsSubtotal)} />
            {hasTaxCode ? <SidebarRow label={t('orders.checkout.vat')} value={formatVnd(vatAmount)} /> : null}
            {showShipping ? (
              <>
                <SidebarRow label={t('orders.checkout.shippingFee')} value={formatVnd(shippingFee)} />
                {shippingDiscount > 0 ? (
                  <SidebarRow label={t('orders.checkout.shippingFeeDiscount')} value={formatVnd(-shippingDiscount)} />
                ) : null}
              </>
            ) : null}
          </dl>
          <div className='mt-3 flex items-center justify-between border-t border-border/70 pt-3'>
            <span className='text-sm font-semibold'>{t('orders.checkout.total')}</span>
            <span className='flex items-center gap-2 font-title text-lg font-bold text-primary'>
              <HugeiconsIcon icon={Tag01Icon} strokeWidth={2} className='size-4' />
              {formatVnd(grandTotal)}
            </span>
          </div>
        </div>
      </section>

      <section className='space-y-3 rounded-3xl bg-card p-5 border border-border'>
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

        <Button type='button' size='lg' className='w-full' onClick={action.onClick} disabled={isActionDisabled}>
          {action.loading ? <Spinner /> : null}
          {action.label}
        </Button>
      </section>
    </aside>
  )
}

function CheckoutLineItem({ line }: { line: CheckoutSummaryLine }) {
  const { t } = useTranslation()
  const issueLabel = line.issue
    ? {
        missing: t('orders.checkout.stock.missing'),
        inactive: t('orders.checkout.stock.inactive'),
        'sold-out': t('orders.checkout.stock.soldOut'),
        'over-stock': t('orders.checkout.stock.onlyLeft', { available: line.available ?? 0 })
      }[line.issue]
    : null

  // Unit price only earns a line of its own when it differs from the subtotal shown on the right.
  const meta = [
    line.variantName,
    line.quantity > 1
      ? t('orders.checkout.lineQty', { qty: line.quantity, price: formatVnd(line.unitPrice) })
      : t('orders.checkout.lineQtyOnly', { qty: line.quantity })
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <li className={cn('flex items-start gap-3 px-3.5 py-3', line.issue ? 'bg-destructive/5' : '')}>
      <div
        className={cn(
          'relative size-12 shrink-0 overflow-hidden rounded-xl border border-border bg-secondary/40',
          line.issue ? 'opacity-50' : ''
        )}
      >
        {line.image ? <Image src={line.image} alt={line.name} fill className='object-cover' sizes='48px' /> : null}
      </div>

      <div className='min-w-0 flex-1'>
        <div className='flex items-start justify-between gap-3'>
          <p className='min-w-0 truncate text-sm font-medium leading-5'>{line.name}</p>
          <span className='shrink-0 text-sm font-semibold text-primary'>{formatVnd(line.subtotal)}</span>
        </div>
        <p className='truncate text-xs text-muted-foreground'>{meta}</p>
        {issueLabel ? (
          <span className='mt-1.5 inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive'>
            <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} className='size-3 shrink-0' />
            {issueLabel}
          </span>
        ) : null}
      </div>
    </li>
  )
}

function SidebarRow({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div className={cn('flex items-start justify-between gap-3', multiline ? 'flex-col sm:flex-row' : '')}>
      <dt className='text-muted-foreground'>{label}</dt>
      <dd className={cn('font-medium text-right', multiline && 'sm:text-right sm:max-w-[60%]')}>{value}</dd>
    </div>
  )
}
