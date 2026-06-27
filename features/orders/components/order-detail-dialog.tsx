'use client'

import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { useDateFormat } from '@/lib/date'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { cn } from '@/shared/utils'
import { CheckmarkCircle02Icon, DeliveryTruck02Icon, PackageIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useMemo } from 'react'
import { useGetOrder } from '../hooks/use-get-order'
import { OrderStatus, type Order } from '../types'

const vndFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
})

const formatVnd = (value: number) => vndFormatter.format(value)

const parseQrAmount = (qrCodeUrl: string | null | undefined): number | null => {
  if (!qrCodeUrl) return null
  try {
    const url = new URL(qrCodeUrl, 'https://qr.sepay.vn')
    const raw = url.searchParams.get('amount')?.trim()
    if (!raw) return null
    const value = Number(raw)
    return Number.isFinite(value) ? value : null
  } catch {
    return null
  }
}

interface OrderDetailDialogProps {
  order: Order
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function OrderDetailDialog({ order, open, onOpenChange }: OrderDetailDialogProps) {
  const { t } = useTranslation()
  const { formatDateTime } = useDateFormat()
  const { order: orderDetail, isLoadingOrder } = useGetOrder({ orderId: order.orderId, enabled: open })

  const isPaid = order.status === OrderStatus.Paid
  const statusLabel = isPaid ? t('orders.list.status.Paid') : t('orders.list.status.Pending')
  const ahamoveTrackingUrl = orderDetail?.ahahaMoveTrackingUrl ?? null
  const totalAmount = useMemo(() => parseQrAmount(orderDetail?.qrCodeUrl), [orderDetail?.qrCodeUrl])

  const rows: { label: string; value: React.ReactNode }[] = [
    {
      label: t('orders.list.createdAt'),
      value: order.createAt ? formatDateTime(order.createAt, 'dateTimeMedium') : '—'
    }
  ]

  if (order.orderTime > 0) {
    rows.push({
      label: t('orders.checkout.orderTime'),
      value: formatDateTime(order.orderTime * 1000, 'dateTimeMedium')
    })
  }

  if (order.trackNumber) {
    rows.push({ label: t('orders.list.trackNumber'), value: <span className='font-mono'>{order.trackNumber}</span> })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-xl' position='top-center'>
        <DialogHeader>
          <DialogTitle>{t('orders.list.detail.title')}</DialogTitle>
          <DialogDescription>{t('orders.list.detail.description')}</DialogDescription>
        </DialogHeader>

        <div className='flex flex-col gap-4'>
          <section className='flex items-center justify-between rounded-3xl bg-card p-4 ring-1 ring-foreground/5'>
            <div className='flex items-center gap-3'>
              <span className='grid size-12 place-items-center rounded-2xl bg-secondary/40 text-primary ring-1 ring-primary/10'>
                <HugeiconsIcon icon={PackageIcon} strokeWidth={1.75} className='size-6' />
              </span>
              <div>
                <p className='text-[0.625rem] font-semibold uppercase tracking-widest text-muted-foreground'>
                  {t('orders.list.orderId')}
                </p>
                <p className='font-mono text-sm font-bold text-primary'>{order.orderId.slice(0, 8)}</p>
              </div>
            </div>
            <Badge
              variant='outline'
              className={cn(
                'gap-1 rounded-full px-2.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wider',
                isPaid ? 'border-leaf/30 bg-leaf/10 text-leaf' : 'border-warning/40 bg-warning/10 text-warning'
              )}
            >
              <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className='size-3' />
              {statusLabel}
            </Badge>
          </section>

          <section className='rounded-3xl bg-secondary/20 p-4 ring-1 ring-foreground/5'>
            <dl className='space-y-2'>
              {rows.map((row) => (
                <div key={row.label} className='grid grid-cols-[8rem_minmax(0,1fr)] items-start gap-2 text-sm'>
                  <dt className='text-muted-foreground'>{row.label}</dt>
                  <dd className='wrap-break-word font-medium text-foreground text-right'>{row.value}</dd>
                </div>
              ))}
              {totalAmount !== null ? (
                <div className='mt-1 flex items-baseline justify-between gap-2 border-t border-border/60 pt-3'>
                  <dt className='text-sm font-semibold'>{t('orders.checkout.total')}</dt>
                  <dd className='font-title text-2xl font-bold text-primary'>{formatVnd(totalAmount)}</dd>
                </div>
              ) : null}
            </dl>
          </section>

          {isLoadingOrder ? (
            <div className='flex items-center justify-center gap-2 text-xs text-muted-foreground'>
              <Spinner className='size-4' />
              <span>{t('orders.list.qr.loading')}</span>
            </div>
          ) : ahamoveTrackingUrl || order.nhanhTrackingUrl ? (
            <section className='flex flex-wrap gap-2'>
              {ahamoveTrackingUrl ? (
                <a
                  href={ahamoveTrackingUrl}
                  target='_blank'
                  rel='noreferrer noopener'
                  className='inline-flex items-center gap-1.5 rounded-full bg-leaf/10 px-3 py-1.5 text-xs font-semibold text-leaf ring-1 ring-leaf/20 hover:bg-leaf/15'
                >
                  <HugeiconsIcon icon={DeliveryTruck02Icon} strokeWidth={2} className='size-3.5' />
                  {t('orders.list.trackAhamove')}
                </a>
              ) : null}
              {order.nhanhTrackingUrl ? (
                <a
                  href={order.nhanhTrackingUrl}
                  target='_blank'
                  rel='noreferrer noopener'
                  className='inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary ring-1 ring-primary/15 hover:bg-primary/15'
                >
                  <HugeiconsIcon icon={DeliveryTruck02Icon} strokeWidth={2} className='size-3.5' />
                  {t('orders.list.trackNhanh')}
                </a>
              ) : null}
            </section>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
