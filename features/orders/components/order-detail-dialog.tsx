'use client'

import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { useDateFormat } from '@/lib/date'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { cn } from '@/shared/utils'
import { CheckmarkCircle02Icon, DeliveryTruck02Icon, PackageIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Image from 'next/image'
import { useMemo } from 'react'
import { useGetOrder } from '../hooks/use-get-order'
import { OrderStatus, type Order } from '../types'

const vndFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
})

const formatVnd = (value: number) => vndFormatter.format(value)

interface QrDetails {
  bank: string | null
  account: string | null
  amount: number | null
  content: string | null
}

const parseQrDetails = (qrCodeUrl: string | null | undefined): QrDetails | null => {
  if (!qrCodeUrl) return null
  try {
    const url = new URL(qrCodeUrl, 'https://qr.sepay.vn')
    const rawAmount = url.searchParams.get('amount')?.trim()
    const amount = rawAmount ? Number(rawAmount) : NaN
    return {
      bank: url.searchParams.get('bank')?.trim() || null,
      account: url.searchParams.get('acc')?.trim() || null,
      amount: Number.isFinite(amount) ? amount : null,
      content: url.searchParams.get('des')?.trim() || null
    }
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
  const ahamoveOrderId = orderDetail?.ahahaMoveOrderId ?? order.ahahaMoveOrderId
  const nhanhOrderId = order.nhanhOrderId
  const qrCodeUrl = orderDetail?.qrCodeUrl ?? null
  const qrDetails = useMemo(() => parseQrDetails(qrCodeUrl), [qrCodeUrl])
  const transaction = orderDetail?.transaction ?? null
  const items = orderDetail?.details ?? []
  const itemsSubtotal = items.reduce((sum, item) => sum + item.price * item.number, 0)

  const infoRows: { label: string; value: React.ReactNode }[] = [
    {
      label: t('orders.list.createdAt'),
      value: order.createAt ? formatDateTime(order.createAt, 'dateTimeMedium') : '—'
    }
  ]

  if (order.orderTime > 0) {
    infoRows.push({
      label: t('orders.checkout.orderTime'),
      value: formatDateTime(order.orderTime * 1000, 'dateTimeMedium')
    })
  }

  if (order.trackNumber) {
    infoRows.push({
      label: t('orders.list.trackNumber'),
      value: <span className='font-mono'>{order.trackNumber}</span>
    })
  }

  if (nhanhOrderId) {
    infoRows.push({ label: t('orders.list.nhanhOrderId'), value: <span className='font-mono'>{nhanhOrderId}</span> })
  }

  if (ahamoveOrderId) {
    infoRows.push({
      label: t('orders.list.ahamoveOrderId'),
      value: <span className='font-mono'>{ahamoveOrderId}</span>
    })
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

          {isLoadingOrder ? (
            <div className='flex items-center justify-center gap-2 py-6 text-xs text-muted-foreground'>
              <Spinner className='size-4' />
              <span>{t('orders.list.qr.loading')}</span>
            </div>
          ) : (
            <>
              {items.length > 0 ? (
                <section className='rounded-3xl bg-card p-4 border border-border'>
                  <div className='mb-3 flex items-baseline justify-between'>
                    <h3 className='font-heading text-sm font-semibold'>{t('orders.checkout.productsHeading')}</h3>
                    <span className='text-xs text-muted-foreground'>
                      {t('orders.checkout.lineCount', { count: items.length })}
                    </span>
                  </div>
                  <ul className='divide-y divide-border/60'>
                    {items.map((item) => (
                      <li key={item.orderDetailsId} className='flex items-center gap-3 py-2.5 first:pt-0 last:pb-0'>
                        <div className='min-w-0 flex-1'>
                          <p className='truncate text-sm font-medium'>{item.name}</p>
                          <p className='text-xs text-muted-foreground'>
                            {t('orders.checkout.lineQty', { qty: item.number, price: formatVnd(item.price) })}
                          </p>
                        </div>
                        <span className='text-sm font-semibold text-primary'>
                          {formatVnd(item.price * item.number)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className='mt-3 flex items-baseline justify-between border-t border-border/60 pt-3 text-sm'>
                    <span className='font-medium text-muted-foreground'>{t('orders.checkout.subtotal')}</span>
                    <span className='font-title text-lg font-bold text-primary'>{formatVnd(itemsSubtotal)}</span>
                  </div>
                </section>
              ) : null}

              {/* {isPaid && transaction ? (
                <section className='rounded-3xl bg-card p-4 border border-border'>
                  <h3 className='mb-3 font-heading text-sm font-semibold'>{t('orders.list.qr.detailsTitle')}</h3>
                  <dl className='space-y-2 text-sm'>
                    <DetailRow label={t('orders.list.qr.bank')} value={transaction.gateway} />
                    <DetailRow
                      label={t('orders.list.qr.content')}
                      value={<span className='font-mono'>{transaction.code}</span>}
                    />
                    <DetailRow label={t('orders.list.qr.amount')} value={formatVnd(transaction.transferAmount)} />
                    <DetailRow
                      label={t('orders.list.transactionDate')}
                      value={formatDateTime(transaction.transactionDate, 'dateTimeMedium')}
                    />
                  </dl>
                </section>
              ) : null} */}

              {!isPaid && qrCodeUrl ? (
                <section className='rounded-3xl bg-card p-4 ring-1 ring-foreground/5'>
                  <div className='mb-3 flex items-center justify-between'>
                    <h3 className='font-heading text-sm font-semibold'>{t('orders.list.qr.title')}</h3>
                    <span className='text-[0.625rem] font-semibold uppercase tracking-widest text-warning'>
                      {t('orders.list.qr.waiting')}
                    </span>
                  </div>
                  <p className='mb-3 text-xs text-muted-foreground'>{t('orders.list.qr.description')}</p>
                  <div className='flex flex-col gap-4 sm:flex-row sm:items-start'>
                    <div className='relative mx-auto size-48 shrink-0 overflow-hidden rounded-2xl bg-background ring-1 ring-foreground/10 sm:mx-0'>
                      <Image
                        src={qrCodeUrl}
                        alt={t('orders.list.qr.imageAlt')}
                        fill
                        unoptimized
                        className='object-contain'
                        sizes='192px'
                      />
                    </div>
                    {qrDetails ? (
                      <dl className='min-w-0 flex-1 space-y-2 text-sm'>
                        {qrDetails.bank ? <DetailRow label={t('orders.list.qr.bank')} value={qrDetails.bank} /> : null}
                        {qrDetails.account ? (
                          <DetailRow
                            label={t('orders.list.qr.account')}
                            value={<span className='font-mono'>{qrDetails.account}</span>}
                          />
                        ) : null}
                        {qrDetails.amount !== null ? (
                          <DetailRow label={t('orders.list.qr.amount')} value={formatVnd(qrDetails.amount)} />
                        ) : null}
                        {qrDetails.content ? (
                          <DetailRow
                            label={t('orders.list.qr.content')}
                            value={<span className='font-mono'>{qrDetails.content}</span>}
                          />
                        ) : null}
                      </dl>
                    ) : null}
                  </div>
                </section>
              ) : null}

              <section className='rounded-3xl bg-secondary/20 p-4 ring-1 ring-foreground/5'>
                <dl className='space-y-2'>
                  {infoRows.map((row) => (
                    <div key={row.label} className='grid grid-cols-[8rem_minmax(0,1fr)] items-start gap-2 text-sm'>
                      <dt className='text-muted-foreground'>{row.label}</dt>
                      <dd className='wrap-break-word font-medium text-foreground text-right'>{row.value}</dd>
                    </div>
                  ))}
                  {qrDetails?.amount !== undefined && qrDetails?.amount !== null ? (
                    <div className='mt-1 flex items-baseline justify-between gap-2 border-t border-border/60 pt-3'>
                      <dt className='text-sm font-semibold'>{t('orders.checkout.total')}</dt>
                      <dd className='font-title text-2xl font-bold text-primary'>{formatVnd(qrDetails.amount)}</dd>
                    </div>
                  ) : null}
                </dl>
              </section>

              {ahamoveTrackingUrl || order.nhanhTrackingUrl ? (
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
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className='grid grid-cols-[8rem_minmax(0,1fr)] items-start gap-2'>
      <dt className='text-muted-foreground'>{label}</dt>
      <dd className='wrap-break-word text-right font-medium text-foreground'>{value}</dd>
    </div>
  )
}
