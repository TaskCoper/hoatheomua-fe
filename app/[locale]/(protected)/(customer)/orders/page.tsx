'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import OrderDetailDialog from '@/features/orders/components/order-detail-dialog'
import OrderQrDialog from '@/features/orders/components/order-qr-dialog'
import { useGetOrders } from '@/features/orders/hooks/use-get-orders'
import { OrderStatus, type Order } from '@/features/orders/types'
import { useDateFormat } from '@/lib/date'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link } from '@/lib/i18n/navigation'
import { cn } from '@/shared/utils'
import {
  CheckmarkCircle02Icon,
  DeliveryTruck02Icon,
  InvoiceIcon,
  PackageIcon,
  QrCodeIcon,
  ShoppingBag03Icon,
  TimeQuarterPassIcon
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion, type Variants } from 'motion/react'
import { useState } from 'react'
import { SparkleDivider } from '../../../(public)/_components/sparkle-dividier'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } }
}

const cardStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } }
}

const cardItem: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 160, damping: 16 } }
}

export default function OrdersPage() {
  const { t } = useTranslation()
  const { formatDateTime } = useDateFormat()
  const { orders, isLoadingOrders } = useGetOrders()

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const items = orders?.value?.items ?? []
  const totalCount = orders?.value?.totalCount ?? items.length

  if (isLoadingOrders) {
    return (
      <section className='relative px-4 pt-4 pb-12 sm:pt-6 md:pt-8 lg:pt-10'>
        <OrdersHeading title={t('orders.list.title')} subtitle={t('orders.list.loading')} />
        <div className='mx-auto mt-8 grid w-full max-w-4xl gap-3'>
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className='h-24 animate-pulse rounded-3xl bg-card shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] ring-1 ring-foreground/5'
            />
          ))}
        </div>
      </section>
    )
  }

  if (items.length === 0) {
    return (
      <section className='relative px-4 pt-4 pb-12 sm:pt-6 md:pt-8 lg:pt-10'>
        <OrdersHeading title={t('orders.list.title')} subtitle={t('orders.list.empty.description')} />

        <motion.div
          initial='hidden'
          animate='visible'
          variants={fadeUp}
          className='mx-auto mt-8 flex w-full max-w-md flex-col items-center gap-4 rounded-3xl bg-card px-6 py-12 text-center shadow-[0_0.8rem_2rem_rgb(81_108_108/10%)] ring-1 ring-foreground/5'
        >
          <motion.div
            animate={{ y: [0, -6, 0], rotate: [0, -3, 0, 3, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className='grid size-20 place-items-center rounded-full bg-secondary/40 text-primary ring-1 ring-primary/10'
          >
            <HugeiconsIcon icon={PackageIcon} className='size-9' strokeWidth={1.5} />
          </motion.div>
          <h2 className='font-title text-xl font-bold text-primary sm:text-2xl'>{t('orders.list.empty.title')}</h2>
          <p className='text-sm leading-relaxed text-muted-foreground'>{t('orders.list.empty.description')}</p>
          <Button asChild size='lg' className='mt-2'>
            <Link href='/products'>
              <HugeiconsIcon icon={ShoppingBag03Icon} className='size-4' />
              {t('cart.empty.continueShopping')}
            </Link>
          </Button>
        </motion.div>
      </section>
    )
  }

  return (
    <section className='relative px-4 pt-4 pb-12 sm:pt-6 md:pt-8 lg:pt-10'>
      <OrdersHeading title={t('orders.list.title')} subtitle={t('orders.list.count', { count: totalCount })} />

      <motion.ul
        initial='hidden'
        animate='visible'
        variants={cardStagger}
        className='mx-auto mt-8 grid w-full max-w-4xl gap-3'
      >
        {items.map((order) => (
          <OrderRow
            key={order.orderId}
            order={order}
            t={t}
            formatDateTime={formatDateTime}
            onOpen={() => setSelectedOrder(order)}
          />
        ))}
      </motion.ul>

      {selectedOrder ? (
        selectedOrder.status === OrderStatus.Paid ? (
          <OrderDetailDialog
            order={selectedOrder}
            open
            onOpenChange={(next) => {
              if (!next) setSelectedOrder(null)
            }}
          />
        ) : (
          <OrderQrDialog
            orderId={selectedOrder.orderId}
            open
            onOpenChange={(next) => {
              if (!next) setSelectedOrder(null)
            }}
          />
        )
      ) : null}
    </section>
  )
}

function OrdersHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <motion.div
      initial='hidden'
      animate='visible'
      variants={fadeUp}
      className='mx-auto w-full max-w-7xl space-y-0.5 sm:space-y-1 md:space-y-1.5 lg:space-y-2'
    >
      <div className='flex items-center justify-start sm:justify-center gap-3'>
        <SparkleDivider
          className='min-w-0 max-w-96 flex-1 hidden sm:flex'
          iconClassName='sm:size-5 md:size-6 lg:size-7'
          color='#516c6c'
        />

        <h1 className='shrink-0 text-center font-title text-2xl md:text-3xl lg:text-4xl font-bold'>{title}</h1>

        <SparkleDivider
          className='min-w-0 max-w-96 flex-1 hidden sm:flex'
          iconClassName='sm:size-5 md:size-6 lg:size-7'
          direction='rtl'
          color='#516c6c'
        />
      </div>

      {subtitle ? (
        <p className='leading-relaxed mx-auto max-w-full sm:max-w-200 text-left sm:text-center text-xs sm:text-sm text-foreground'>
          {subtitle}
        </p>
      ) : null}
    </motion.div>
  )
}

interface OrderRowProps {
  order: Order
  t: ReturnType<typeof useTranslation>['t']
  formatDateTime: ReturnType<typeof useDateFormat>['formatDateTime']
  onOpen: () => void
}

function OrderRow({ order, t, formatDateTime, onOpen }: OrderRowProps) {
  const isPaid = order.status === OrderStatus.Paid
  const isPending = order.status === OrderStatus.Pending
  const statusLabel = isPaid ? t('orders.list.status.Paid') : t('orders.list.status.Pending')

  const handleClick = onOpen
  const handleKeyDown = (event: React.KeyboardEvent<HTMLLIElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onOpen()
    }
  }

  return (
    <motion.li
      variants={cardItem}
      whileHover={{ y: -4, scale: 1.005 }}
      transition={{ type: 'spring', stiffness: 240, damping: 18 }}
      role='button'
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={isPending ? t('orders.list.qr.title') : t('orders.list.detail.title')}
      className={cn(
        'group relative flex cursor-pointer flex-col gap-4 overflow-hidden rounded-3xl bg-card p-2 outline-none shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] ring-1 ring-foreground/5 transition-shadow hover:shadow-[0_1.2rem_3rem_rgb(81_108_108/14%)] focus-visible:ring-2 focus-visible:ring-ring/40 sm:flex-row sm:items-center sm:p-3'
      )}
    >
      <div className='min-w-0 flex-1'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <div className='flex items-center gap-2'>
            <span className='text-[0.625rem] font-semibold uppercase tracking-widest text-muted-foreground'>
              {t('orders.list.orderId')}
            </span>
            <span className='font-mono text-sm font-bold text-primary'>{order.orderId.slice(0, 8)}</span>
          </div>

          <Badge
            variant='outline'
            className={cn(
              'gap-1 rounded-full px-2.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wider',
              isPaid ? 'border-leaf/30 bg-leaf/10 text-leaf' : 'border-warning/40 bg-warning/10 text-warning'
            )}
          >
            <HugeiconsIcon
              icon={isPaid ? CheckmarkCircle02Icon : TimeQuarterPassIcon}
              strokeWidth={2}
              className='size-3'
            />
            {statusLabel}
          </Badge>
        </div>

        <dl className='flex flex-wrap items-center gap-x-3 gap-y-1'>
          <div className='flex items-center gap-1 text-xs text-muted-foreground'>
            <dt className='shrink-0 font-medium'>{t('orders.list.createdAt')}:</dt>
            <dd className='truncate font-medium text-foreground/90'>
              {order.createAt ? formatDateTime(order.createAt, 'dateTimeShort') : '—'}
            </dd>
          </div>
          <div className='flex items-center gap-1 text-xs text-muted-foreground'>
            <dt className='shrink-0 font-medium'>{t('orders.checkout.orderTime')}:</dt>
            <dd className='truncate font-medium text-foreground/90'>
              {order.orderTime > 0
                ? formatDateTime(order.orderTime * 1000, 'dateShort')
                : t('orders.checkout.deliverNow')}
            </dd>
          </div>
        </dl>

        <div className='flex flex-wrap items-center gap-2 mt-3'>
          {isPending ? (
            <motion.span
              whileHover={{ x: 2 }}
              transition={{ type: 'spring', stiffness: 320, damping: 14 }}
              className='inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary ring-1 ring-primary/15'
            >
              <HugeiconsIcon icon={QrCodeIcon} strokeWidth={2} className='size-3.5' />
              {t('orders.list.qr.openHint')}
            </motion.span>
          ) : (
            <motion.span
              whileHover={{ x: 2 }}
              transition={{ type: 'spring', stiffness: 320, damping: 14 }}
              className='inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary ring-1 ring-primary/15'
            >
              <HugeiconsIcon icon={InvoiceIcon} strokeWidth={2} className='size-3.5' />
              {t('orders.list.detail.openHint')}
            </motion.span>
          )}

          {isPaid && order.ahahaMoveTrackingUrl ? (
            <motion.a
              whileHover={{ x: 2 }}
              transition={{ type: 'spring', stiffness: 320, damping: 14 }}
              href={order.ahahaMoveTrackingUrl}
              target='_blank'
              rel='noreferrer noopener'
              onClick={(event) => event.stopPropagation()}
              className='inline-flex items-center gap-1.5 rounded-full bg-leaf/10 px-2.5 py-1 text-xs font-semibold text-leaf ring-1 ring-leaf/20 hover:bg-leaf/15'
            >
              <HugeiconsIcon icon={DeliveryTruck02Icon} strokeWidth={2} className='size-3.5' />
              {t('orders.list.trackAhamove')}
            </motion.a>
          ) : null}
        </div>
      </div>
    </motion.li>
  )
}
