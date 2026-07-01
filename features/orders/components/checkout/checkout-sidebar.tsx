'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Spinner } from '@/components/ui/spinner'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link } from '@/lib/i18n/navigation'
import { cn } from '@/shared/utils'
import { Tag01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Image from 'next/image'

export interface CheckoutSummaryLine {
  lineId: string
  name: string
  image: string | null
  quantity: number
  unitPrice: number
  subtotal: number
}

const vndFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
})
const formatVnd = (value: number) => vndFormatter.format(value)

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
  grandTotal,
  action,
  showTerms = true
}: CheckoutSidebarProps) {
  const { t } = useTranslation()

  return (
    <aside className='sticky top-6 space-y-4'>
      <section className='rounded-3xl bg-card p-5 border border-border'>
        <div className='mb-4 flex items-baseline justify-between'>
          <h2 className='font-heading text-base font-semibold'>{t('orders.checkout.sidebar.summaryTitle')}</h2>
          <span className='text-xs text-muted-foreground'>
            {t('orders.checkout.sidebar.itemsCount', { count: totalItems })}
          </span>
        </div>

        {lines.length > 0 ? (
          <ul className='mb-4 divide-y divide-border/60 rounded-2xl border border-border/60 bg-background/50'>
            {lines.map((line) => (
              <li key={line.lineId} className='flex items-center gap-3 px-3 py-2.5'>
                <div className='relative size-11 shrink-0 overflow-hidden rounded-2xl bg-secondary/40 border border-border'>
                  {line.image ? (
                    <Image src={line.image} alt={line.name} fill className='object-cover' sizes='44px' />
                  ) : null}
                </div>
                <div className='min-w-0 flex-1'>
                  <p className='truncate text-sm font-medium'>{line.name}</p>
                  <p className='text-xs text-muted-foreground'>
                    {t('orders.checkout.lineQty', { qty: line.quantity, price: formatVnd(line.unitPrice) })}
                  </p>
                </div>
                <span className='text-sm font-semibold text-primary'>{formatVnd(line.subtotal)}</span>
              </li>
            ))}
          </ul>
        ) : null}

        <dl className='space-y-3 text-sm'>
          {address ? <SidebarRow label={t('orders.checkout.sidebar.address')} value={address} multiline /> : null}
          {orderTimeLabel ? <SidebarRow label={t('orders.checkout.orderTime')} value={orderTimeLabel} /> : null}
          {deliveryTimeLabel ? <SidebarRow label={t('orders.checkout.tag')} value={deliveryTimeLabel} /> : null}
          {extraLines?.map((line) => <SidebarRow key={line.label} label={line.label} value={line.value} />)}
        </dl>

        <div className='mt-5 border-t border-border/70 pt-4'>
          <h3 className='mb-3 font-heading text-base font-semibold'>{t('orders.checkout.sidebar.priceTitle')}</h3>
          <dl className='space-y-2 text-sm'>
            <SidebarRow label={t('orders.checkout.subtotal')} value={formatVnd(productsSubtotal)} />
            {hasTaxCode ? <SidebarRow label={t('orders.checkout.vat')} value={formatVnd(vatAmount)} /> : null}
            <SidebarRow label={t('orders.checkout.shippingFee')} value={formatVnd(shippingFee)} />
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
            <Checkbox defaultChecked className='mt-0.5' />
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

        <Button
          type='button'
          size='lg'
          className='w-full'
          onClick={action.onClick}
          disabled={action.disabled || action.loading}
        >
          {action.loading ? <Spinner /> : null}
          {action.label}
        </Button>
      </section>
    </aside>
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
