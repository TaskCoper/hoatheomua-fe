'use client'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AccountSectionHeader } from '@/features/users/components/account-shell'
import { useLoadMoreOnView } from '@/hooks/use-load-more-on-view'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link } from '@/lib/i18n/navigation'
import { PackageIcon, ShoppingBag03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion, type Variants } from 'motion/react'
import { useState } from 'react'
import { useGetOrders } from '../hooks/use-get-orders'
import { OrderStatus, OrderStatusLabel } from '../types'
import { OrderCard } from './order-card'

type OrderFilter = 'all' | OrderStatus

const FILTERS: OrderFilter[] = ['all', OrderStatus.Pending, OrderStatus.Paid, OrderStatus.Cancelled]

const cardStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } }
}

const cardItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 160, damping: 18 } }
}

export function AccountOrders() {
  const { t } = useTranslation()

  const [filter, setFilter] = useState<OrderFilter>('all')

  const { orders, totalCount, isLoadingOrders, isLoadingMoreOrders, hasMoreOrders, loadMoreOrders } = useGetOrders({
    status: filter === 'all' ? undefined : filter
  })

  const sentinelRef = useLoadMoreOnView({
    enabled: hasMoreOrders && !isLoadingMoreOrders,
    onLoadMore: loadMoreOrders
  })

  return (
    <>
      <AccountSectionHeader
        title={t('orders.list.title')}
        description={isLoadingOrders ? t('orders.list.loading') : t('orders.list.count', { count: totalCount })}
      />
      <Tabs value={filter} onValueChange={(value) => setFilter(value as OrderFilter)}>
        <TabsList className='rail-x h-auto w-full justify-start gap-1 rounded-full bg-muted p-1 sm:w-fit sm:flex-wrap'>
          {FILTERS.map((value) => (
            <TabsTrigger
              key={value}
              value={value}
              className='flex-none rounded-full px-3 py-1.5 data-[state=active]:bg-card data-[state=active]:font-semibold data-[state=active]:text-primary'
            >
              {value === 'all' ? t('orders.list.tabs.all') : t(OrderStatusLabel[value])}
              {/* Filtering happens server-side, so a request only ever knows the total
                  for the status it asked about - hence a count on the active tab only. */}
              {filter === value && !isLoadingOrders ? (
                <span className='ml-1 rounded-full bg-secondary/60 px-1.5 py-0.5 text-[0.625rem] font-semibold text-secondary-foreground tabular-nums'>
                  {totalCount}
                </span>
              ) : null}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {isLoadingOrders ? (
        <OrdersLoading />
      ) : orders.length === 0 ? (
        filter === 'all' ? (
          <EmptyOrders />
        ) : (
          <EmptyFilter />
        )
      ) : (
        <>
          {/* Keyed on the filter so switching tabs remounts the list and replays the
              stagger; appended pages then animate in on their own. */}
          <motion.ul key={filter} initial='hidden' animate='visible' variants={cardStagger} className='grid gap-3'>
            {orders.map((order) => (
              <motion.li key={order.orderId} variants={cardItem}>
                <OrderCard order={order} />
              </motion.li>
            ))}
          </motion.ul>

          {/* Stays mounted across the skeleton/button swap so the observer never loses its target. */}
          <div ref={sentinelRef}>
            {isLoadingMoreOrders ? (
              <div className='grid gap-3'>
                {Array.from({ length: 2 }).map((_, index) => (
                  <Skeleton
                    key={index}
                    className='h-52 rounded-3xl bg-card shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] ring-1 ring-foreground/5'
                  />
                ))}
              </div>
            ) : hasMoreOrders ? (
              <div className='flex justify-center pt-1'>
                <Button variant='outline' onClick={() => loadMoreOrders()}>
                  {t('orders.list.loadMore')}
                </Button>
              </div>
            ) : null}
          </div>
        </>
      )}
    </>
  )
}

function OrdersLoading() {
  return (
    <div className='grid gap-3'>
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton
          key={index}
          className='h-52 rounded-3xl bg-card shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] ring-1 ring-foreground/5'
        />
      ))}
    </div>
  )
}

function EmptyOrders() {
  const { t } = useTranslation()

  return (
    <div className='flex flex-col items-center gap-4 rounded-3xl bg-card px-6 py-12 text-center shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] ring-1 ring-foreground/5'>
      <span className='bob-tilt-sm grid size-20 place-items-center rounded-full bg-secondary/40 text-primary ring-1 ring-primary/10'>
        <HugeiconsIcon icon={PackageIcon} className='size-9' strokeWidth={1.5} />
      </span>
      <h3 className='font-title text-xl font-bold text-primary sm:text-2xl'>{t('orders.list.empty.title')}</h3>
      <p className='max-w-md text-sm leading-relaxed text-muted-foreground'>{t('orders.list.empty.description')}</p>
      <Button asChild size='lg' className='mt-2'>
        <Link href='/products'>
          <HugeiconsIcon icon={ShoppingBag03Icon} className='size-4' />
          {t('cart.empty.continueShopping')}
        </Link>
      </Button>
    </div>
  )
}

function EmptyFilter() {
  const { t } = useTranslation()

  return (
    <div className='flex flex-col items-center gap-2 rounded-3xl bg-card px-6 py-10 text-center shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] ring-1 ring-foreground/5'>
      <span className='grid size-12 place-items-center rounded-full bg-secondary/40 text-primary ring-1 ring-primary/10'>
        <HugeiconsIcon icon={PackageIcon} className='size-5' strokeWidth={1.5} />
      </span>
      <p className='text-sm text-muted-foreground'>{t('orders.list.emptyFilter')}</p>
    </div>
  )
}
