'use client'

import { Button } from '@/components/ui/button'
import { formatVnd } from '@/lib/currency'
import { useDateFormat } from '@/lib/date'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link } from '@/lib/i18n/navigation'
import { DeliveryTruck02Icon, QrCodeIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { OrderStatus, ShippingGatewayLabel, type Order } from '../types'
import { OrderLineItem } from './order-line-item'
import OrderStatusBadge from './order-status-badge'

const MAX_PREVIEW_ITEMS = 4

interface OrderCardProps {
  order: Order
}

export function OrderCard({ order }: OrderCardProps) {
  const { t } = useTranslation()
  const { formatDateTime } = useDateFormat()

  const isPending = order.status === OrderStatus.Pending
  // The carrier's tracking number is the reference customers can quote; until one
  // exists, a slice of the uuid is still short enough to read out over the phone.
  const reference = order.trackNumber?.trim() || order.orderId.slice(0, 8).toUpperCase()

  const items = order.items ?? []
  const previewItems = items.slice(0, MAX_PREVIEW_ITEMS)
  const hiddenItemCount = Math.max(items.length - previewItems.length, 0)

  const deliveryAddress = order.address?.trim() || null
  const deliveryDate =
    order.orderTime > 0 ? formatDateTime(order.orderTime * 1000, 'dateWithWeekday') : t('orders.checkout.deliverNow')

  return (
    <article className='rounded-3xl bg-card p-3 shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] ring-1 ring-foreground/5 transition-shadow hover:shadow-[0_1rem_2.4rem_rgb(81_108_108/12%)] focus-within:ring-2 focus-within:ring-ring/40 sm:p-4'>
      <header className='flex flex-wrap items-start justify-between gap-x-3 gap-y-2 border-b border-border/70 pb-3'>
        <div className='min-w-0'>
          <div className='flex flex-wrap items-center gap-2'>
            <h3 className='font-title text-sm font-bold sm:text-base'>
              <span className='text-muted-foreground'>{t('orders.list.orderId')}</span>{' '}
              <span className='font-mono text-primary'>#{reference}</span>
            </h3>
            <OrderStatusBadge status={order.status} />
          </div>

          <div className='mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground'>
            {items.length > 0 ? (
              <>
                <span>{t('orders.checkout.lineCount', { count: items.length })}</span>
                <span aria-hidden='true' className='text-foreground/30'>
                  •
                </span>
              </>
            ) : null}
            <span>
              {t('orders.list.createdAt')}: {order.createAt ? formatDateTime(order.createAt, 'dateTimeShort') : '-'}
            </span>
          </div>
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          {/* `paymentUrl` only exists on the detail response, so paying routes through
              the detail page rather than jumping straight to the gateway. */}
          {isPending ? (
            <Button asChild size='sm'>
              <Link href={`/orders/${order.orderId}`}>
                <HugeiconsIcon icon={QrCodeIcon} strokeWidth={2} />
                {t('orders.list.detail.payNow')}
              </Link>
            </Button>
          ) : null}

          {order.shippingTrackingUrl ? (
            <Button asChild size='sm' variant='ghost' className='text-leaf hover:bg-leaf/10 hover:text-leaf'>
              <a href={order.shippingTrackingUrl} target='_blank' rel='noopener noreferrer'>
                <HugeiconsIcon icon={DeliveryTruck02Icon} strokeWidth={2} />
                {t('orders.list.trackShipment', { gateway: t(ShippingGatewayLabel[order.shippingGateway]) })}
              </a>
            </Button>
          ) : null}

          <Button asChild size='sm' variant='outline'>
            <Link href={`/orders/${order.orderId}`}>{t('orders.list.detail.title')}</Link>
          </Button>
        </div>
      </header>

      <dl className='grid grid-cols-[minmax(6rem,auto)_minmax(0,1fr)] gap-x-6 gap-y-2 py-3 text-sm'>
        <MetaRow label={t('orders.checkout.orderTime')} value={deliveryDate} />
        <MetaRow label={t('orders.list.deliveredTo')} value={deliveryAddress ?? t('orders.list.detail.noValue')} />
        <MetaRow
          label={t('orders.checkout.total')}
          value={<span className='font-title text-base font-bold text-primary'>{formatVnd(order.totalFee)}</span>}
        />
      </dl>

      <div className='border-t border-border/70 pt-3'>
        {previewItems.length > 0 ? (
          <>
            <ul className='grid gap-x-4 gap-y-3 sm:grid-cols-2'>
              {previewItems.map((item, index) => (
                <OrderLineItem key={`${item.productId}-${index}`} item={item} />
              ))}
            </ul>

            {hiddenItemCount > 0 ? (
              <Link
                href={`/orders/${order.orderId}`}
                className='mt-3 inline-flex text-xs font-semibold text-primary underline-offset-4 outline-none hover:underline focus-visible:underline'
              >
                {t('orders.list.moreItems', { count: hiddenItemCount })}
              </Link>
            ) : null}
          </>
        ) : (
          <p className='text-xs text-muted-foreground'>{t('orders.list.itemsUnavailable')}</p>
        )}
      </div>
    </article>
  )
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <>
      <dt className='text-muted-foreground'>{label}</dt>
      <dd className='min-w-0 wrap-break-word font-medium text-foreground'>{value}</dd>
    </>
  )
}
