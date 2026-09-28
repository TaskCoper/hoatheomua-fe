'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { ARE_CARDS_ENABLED } from '@/features/orders/cards/card-feature'
import OrderFinalCardsSection from '@/features/orders/components/order-cards/order-final-cards-section'
import OrderItemsSection from '@/features/orders/components/order-items-section'
import OrderSectionCard from '@/features/orders/components/order-section-card'
import OrderStatusBadge from '@/features/orders/components/order-status-badge'
import { useCancelOrder } from '@/features/orders/hooks/use-cancel-order'
import { useGetOrder } from '@/features/orders/hooks/use-get-order'
import { useGetOrderStatus } from '@/features/orders/hooks/use-get-order-status'
import {
  InvoiceType,
  InvoiceTypeLabel,
  OrderStatus,
  PaymentMethod,
  PaymentMethodLabel,
  ShippingGatewayLabel,
  type OrderDetail
} from '@/features/orders/types'
import { useAccountHref } from '@/features/users/hooks/use-account-href'
import { useFeatureUnavailableToast } from '@/hooks/use-feature-unavailable-toast'
import { useGetOrderTags } from '@/hooks/use-get-order-tags'
import { formatVnd } from '@/lib/currency'
import { useDateFormat } from '@/lib/date'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link, useRouter } from '@/lib/i18n/navigation'
import { FeatureUnavailableNotice } from '@/shared/components/feature-unavailable-notice'
import { isFeatureEnabled } from '@/shared/feature-flags'
import { cn } from '@/shared/utils'
import {
  ArrowLeft02Icon,
  BankIcon,
  CalendarCheckOut01Icon,
  CheckmarkCircle02Icon,
  DeliveryTruck02Icon,
  InvoiceIcon,
  MapPinpoint02Icon,
  NoteEditIcon,
  PackageIcon,
  QrCodeIcon,
  ReceiptTextIcon,
  Rocket02Icon,
  SmartPhone01Icon,
  UserIcon
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useQueryClient } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

interface SepayDetails {
  bank: string | null
  account: string | null
  holder: string | null
  amount: number | null
  content: string | null
}

const parseSepayDetails = (sepayUrl: string | null | undefined): SepayDetails | null => {
  if (!sepayUrl) return null
  try {
    const url = new URL(sepayUrl)
    const rawAmount = url.searchParams.get('amount')?.trim()
    const amount = rawAmount ? Number(rawAmount) : NaN
    return {
      bank: url.searchParams.get('bank')?.trim() || null,
      account: url.searchParams.get('acc')?.trim() || null,
      holder: url.searchParams.get('holder')?.trim() || null,
      amount: Number.isFinite(amount) ? amount : null,
      content: url.searchParams.get('des')?.trim() || null
    }
  } catch {
    return null
  }
}

const PAYMENT_METHOD_ICONS = {
  [PaymentMethod[1]]: BankIcon,
  [PaymentMethod[6]]: QrCodeIcon
} as const satisfies Record<PaymentMethod, unknown>

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>()
  const orderId = params?.id ?? ''
  const { t } = useTranslation()
  const { formatDateTime } = useDateFormat()
  const queryClient = useQueryClient()
  const ordersHref = useAccountHref('orders')

  const { order, isLoadingOrder } = useGetOrder({ orderId, enabled: !!orderId })
  const isPending = order?.status === OrderStatus.Pending
  const { orderStatus, isLoadingOrderStatus } = useGetOrderStatus({
    orderId,
    enabled: !!orderId && isPending
  })

  // The status poll is the only signal that a bank transfer landed. Announce the
  // pending -> paid *transition* we observe live: a plain `status === Paid` check
  // also matches the cached value the disabled query keeps serving after payment,
  // so revisiting an already-paid order would re-toast on every mount.
  const previousOrderStatusRef = useRef<OrderStatus | undefined>(undefined)

  useEffect(() => {
    if (!isPending || isLoadingOrderStatus) return

    const previousOrderStatus = previousOrderStatusRef.current
    previousOrderStatusRef.current = orderStatus

    // No previous sample means this is the first status we see - it came from the
    // cache or the order was already paid before we opened the page, not from a
    // payment that just landed.
    if (orderStatus !== OrderStatus.Paid || previousOrderStatus === undefined) return
    if (previousOrderStatus === OrderStatus.Paid) return

    toast.success(t('orders.list.detail.paidToast'), {
      description: t('orders.list.detail.paidToastDescription')
    })
    queryClient.invalidateQueries({ queryKey: ['orders'] })
    queryClient.invalidateQueries({ queryKey: ['order', orderId] })
  }, [orderStatus, isLoadingOrderStatus, isPending, queryClient, orderId, t])

  if (isLoadingOrder) {
    return (
      <section className='relative px-4 pt-4 pb-12 sm:pt-6 md:pt-8 lg:pt-10'>
        <div className='mx-auto flex w-full max-w-6xl flex-col gap-4'>
          <Skeleton className='h-10 w-40 rounded-full bg-card ring-1 ring-foreground/5' />
          <Skeleton className='h-24 rounded-3xl bg-card ring-1 ring-foreground/5' />
          <div className='grid gap-4 lg:grid-cols-3'>
            <div className='flex flex-col gap-4 lg:col-span-2'>
              <Skeleton className='h-64 rounded-3xl bg-card ring-1 ring-foreground/5' />
              <Skeleton className='h-48 rounded-3xl bg-card ring-1 ring-foreground/5' />
            </div>
            <div className='flex flex-col gap-4'>
              <Skeleton className='h-40 rounded-3xl bg-card ring-1 ring-foreground/5' />
              <Skeleton className='h-40 rounded-3xl bg-card ring-1 ring-foreground/5' />
              <Skeleton className='h-32 rounded-3xl bg-card ring-1 ring-foreground/5' />
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (!order) {
    return (
      <section className='relative px-4 pt-4 pb-12 sm:pt-6 md:pt-8 lg:pt-10'>
        <div className='mx-auto flex w-full max-w-md flex-col items-center gap-4 rounded-3xl bg-card px-6 py-12 text-center shadow-[0_0.8rem_2rem_rgb(81_108_108/10%)] ring-1 ring-foreground/5'>
          <span className='grid size-16 place-items-center rounded-full bg-secondary/40 text-primary ring-1 ring-primary/10'>
            <HugeiconsIcon icon={PackageIcon} strokeWidth={1.5} className='size-8' />
          </span>
          <h2 className='font-title text-xl font-bold text-primary sm:text-2xl'>
            {t('orders.list.detail.notFoundTitle')}
          </h2>
          <p className='text-sm leading-relaxed text-muted-foreground'>{t('orders.list.detail.notFoundDescription')}</p>
          <Button asChild size='lg' className='mt-2'>
            <Link href={ordersHref}>
              <HugeiconsIcon icon={ArrowLeft02Icon} className='size-4' />
              {t('orders.list.detail.backToOrdersCta')}
            </Link>
          </Button>
        </div>
      </section>
    )
  }

  return <OrderDetailContent order={order} formatDateTime={formatDateTime} t={t} />
}

interface OrderDetailContentProps {
  order: OrderDetail
  formatDateTime: ReturnType<typeof useDateFormat>['formatDateTime']
  t: ReturnType<typeof useTranslation>['t']
}

function OrderDetailContent({ order, formatDateTime, t }: OrderDetailContentProps) {
  const router = useRouter()
  const ordersHref = useAccountHref('orders')
  const isPaid = order.status === OrderStatus.Paid
  const isPendingOrder = order.status === OrderStatus.Pending

  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const { cancelOrder, isCancellingOrder } = useCancelOrder()

  // Paying is a gateway hand-off; cancelling unwinds the order upstream. Both
  // stay on screen while they are switched off, just inert.
  const canPay = isFeatureEnabled('payment')
  const canCancelOrder = isFeatureEnabled('ordering')
  const notifyUnavailable = useFeatureUnavailableToast()

  const handleConfirmCancel = () => {
    if (!canCancelOrder) {
      notifyUnavailable()
      return
    }

    cancelOrder(
      { id: order.orderId },
      {
        onSuccess: () => {
          toast.success(t('orders.list.detail.cancelSuccess'))
          setIsCancelDialogOpen(false)
          router.push(ordersHref)
        }
      }
    )
  }

  const { orderTags } = useGetOrderTags()
  const deliveryTagLabel = useMemo(() => {
    const options = orderTags?.options
    if (!options?.length || !order.tagsId?.length) {
      return null
    }
    const byValue = new Map(options.map((opt) => [opt.value, opt.label]))
    const labels = order.tagsId.map((id) => byValue.get(id)).filter(Boolean) as string[]
    return labels.length ? labels.join(', ') : null
  }, [orderTags, order.tagsId])

  const sepayDetails = useMemo(() => parseSepayDetails(order.sepayUrl), [order.sepayUrl])
  const hasSepayQr = isPendingOrder && !order.paymentUrl && Boolean(order.sepayUrl) && Boolean(sepayDetails)
  // A rendered QR is a live transfer waiting to happen, so it is withheld rather
  // than merely greyed out - the card stays, its contents are replaced.
  const showSepayQr = hasSepayQr && canPay

  const items = useMemo(() => order.details ?? [], [order.details])

  const deliveryAddress = order.address ?? order.shortAddress

  const customerRows = buildIconRows([
    order.fullName ? { icon: UserIcon, label: t('orders.checkout.fullName'), value: order.fullName } : null,
    order.phone ? { icon: SmartPhone01Icon, label: t('orders.checkout.phone'), value: order.phone } : null
  ])

  const recipientRows = buildIconRows([
    order.fullNameReceiver
      ? { icon: UserIcon, label: t('orders.checkout.fullNameReceiver'), value: order.fullNameReceiver }
      : null,
    order.phoneReceiver
      ? { icon: SmartPhone01Icon, label: t('orders.checkout.phoneReceiver'), value: order.phoneReceiver }
      : null,
    deliveryAddress
      ? { icon: MapPinpoint02Icon, label: t('orders.checkout.deliveryHeading'), value: deliveryAddress }
      : null
  ])

  const invoiceRows: { label: string; value: React.ReactNode }[] = []

  if (order.isExportInvoice) {
    if (order.invoiceType) {
      invoiceRows.push({
        label: t('orders.checkout.invoiceType'),
        value: t(InvoiceTypeLabel[order.invoiceType])
      })
    }
    if (order.invoiceType === InvoiceType.Business && order.taxCode) {
      invoiceRows.push({
        label: t('orders.checkout.taxCodeLabel'),
        value: <span className='font-mono'>{order.taxCode}</span>
      })
    }
    if (order.invoiceType === InvoiceType.Personal && order.identityNumber) {
      invoiceRows.push({
        label: t('orders.list.detail.identityNumber'),
        value: <span className='font-mono'>{order.identityNumber}</span>
      })
    }

    // The receipt block travels with the invoice, not with the delivery address.
    if (order.receiptFullName) {
      invoiceRows.push({ label: t('orders.checkout.receiptFullName'), value: order.receiptFullName })
    }
    if (order.receiptPhoneNumber) {
      invoiceRows.push({ label: t('orders.checkout.receiptPhoneNumber'), value: order.receiptPhoneNumber })
    }
    if (order.receiptEmail) {
      invoiceRows.push({ label: t('orders.checkout.receiptEmail'), value: order.receiptEmail })
    }
    if (order.receiptAddress) {
      invoiceRows.push({ label: t('orders.checkout.receiptAddress'), value: order.receiptAddress })
    }
  }

  const payNowButton = (
    <Button className='w-full gap-1.5 font-semibold' disabled={!canPay}>
      {order.paymentMethod ? (
        <HugeiconsIcon icon={PAYMENT_METHOD_ICONS[order.paymentMethod]} strokeWidth={2} className='size-4' />
      ) : null}
      {t('orders.list.detail.payNow')}
    </Button>
  )

  const hasTracking = Boolean(order.shippingTrackingUrl)
  const hasTrackingIds = Boolean(order.shippingPartyOrderId || order.trackNumber)
  const shippingGatewayLabel = t(ShippingGatewayLabel[order.shippingGateway])

  return (
    <section className='relative px-4 pt-4 pb-12 sm:pt-6 md:pt-8 lg:pt-10'>
      <div className='mx-auto flex w-full max-w-6xl flex-col gap-4'>
        <nav
          aria-label={t('orders.list.detail.breadcrumbList')}
          className='flex items-center justify-between gap-3 rounded-3xl bg-card/70 px-4 py-3 ring-1 ring-foreground/5 backdrop-blur-sm'
        >
          <ol className='flex min-w-0 flex-wrap items-center gap-1.5 text-xs text-muted-foreground'>
            <li>
              <Link href={ordersHref} className='transition-colors hover:text-primary'>
                {t('orders.list.detail.breadcrumbList')}
              </Link>
            </li>
            <li aria-hidden='true' className='text-foreground/40'>
              /
            </li>
            <li className='min-w-0 font-semibold text-primary'>{t('orders.list.detail.breadcrumbCurrent')}</li>
          </ol>

          <div className='flex shrink-0 items-center gap-2'>
            <OrderStatusBadge status={order.status} className='px-2 py-1 text-[0.7rem] normal-case' />
          </div>
        </nav>

        <div className='grid gap-4 lg:grid-cols-3'>
          <div className='flex flex-col gap-4 lg:col-span-2'>
            {showSepayQr && order.sepayUrl && sepayDetails ? (
              <OrderSectionCard icon={QrCodeIcon} title={t('orders.list.qr.title')}>
                <p className='mb-4 text-xs text-muted-foreground'>{t('orders.list.qr.description')}</p>
                <div className='grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-start'>
                  <div className='mx-auto sm:mx-0'>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={order.sepayUrl}
                      alt={t('orders.list.qr.imageAlt')}
                      className='mx-auto h-auto max-h-80 w-auto max-w-64 rounded-2xl bg-white p-2 ring-1 ring-border sm:mx-0'
                    />
                  </div>
                  <dl className='space-y-2 text-sm'>
                    {sepayDetails.bank ? (
                      <DetailRow label={t('orders.list.qr.bank')} value={sepayDetails.bank} />
                    ) : null}
                    {sepayDetails.account ? (
                      <DetailRow
                        label={t('orders.list.qr.account')}
                        value={<span className='font-mono'>{sepayDetails.account}</span>}
                      />
                    ) : null}
                    {sepayDetails.holder ? (
                      <DetailRow label={t('orders.list.qr.holder')} value={sepayDetails.holder} />
                    ) : null}
                    {sepayDetails.amount != null ? (
                      <DetailRow
                        label={t('orders.list.qr.amount')}
                        value={<span className='font-semibold text-primary'>{formatVnd(sepayDetails.amount)}</span>}
                      />
                    ) : null}
                    {sepayDetails.content ? (
                      <DetailRow
                        label={t('orders.list.qr.content')}
                        value={<span className='font-mono text-xs'>{sepayDetails.content}</span>}
                      />
                    ) : null}
                  </dl>
                </div>
                <p className='mt-3 border-t border-border/60 pt-3 text-xs text-muted-foreground'>
                  {t('orders.list.qr.waiting')}
                </p>
              </OrderSectionCard>
            ) : null}

            {hasSepayQr && !canPay ? (
              <OrderSectionCard icon={QrCodeIcon} title={t('orders.list.qr.title')}>
                <FeatureUnavailableNotice />
              </OrderSectionCard>
            ) : null}

            <OrderItemsSection items={items} canDesignCards={ARE_CARDS_ENABLED && isPaid} />

            {/* The settled artworks, out from under the lines they were bought on. */}
            {ARE_CARDS_ENABLED ? <OrderFinalCardsSection items={items} /> : null}

            <OrderSectionCard icon={ReceiptTextIcon} title={t('orders.list.detail.summaryHeading')}>
              <dl className='space-y-2 text-sm'>
                {/* <SummaryRow
                  label={t('orders.list.orderId')}
                  value={<span className='font-mono text-xs break-all'>{order.orderId}</span>}
                /> */}

                <SummaryRow
                  label={t('orders.list.createdAt')}
                  value={formatDateTime(order.createAt, 'dateTimeMedium')}
                />

                {order.paymentMethod ? (
                  <SummaryRow
                    label={t('orders.list.detail.paymentMethod')}
                    value={
                      <span className='inline-flex items-center gap-1.5'>
                        {t(PaymentMethodLabel[order.paymentMethod])}
                      </span>
                    }
                  />
                ) : null}

                <SummaryRow label={t('orders.checkout.subtotal')} value={formatVnd(order.productFee)} />
                <SummaryRow label={t('orders.checkout.shippingFee')} value={formatVnd(order.shippingFee)} />
                {order.vatFee > 0 ? (
                  <SummaryRow label={t('orders.checkout.vat')} value={formatVnd(order.vatFee)} />
                ) : null}
              </dl>

              <div className='mt-3 flex items-baseline justify-between gap-2 border-t border-border/60 pt-3'>
                <dt className='text-sm font-semibold'>{t('orders.checkout.total')}</dt>
                <dd className='font-title text-2xl font-bold text-primary'>{formatVnd(order.totalFee)}</dd>
              </div>
            </OrderSectionCard>

            {isPaid && order.transaction ? (
              <OrderSectionCard icon={BankIcon} title={t('orders.list.qr.detailsTitle')}>
                <dl className='space-y-2 text-sm'>
                  {order.transaction.gateway ? (
                    <DetailRow label={t('orders.list.qr.bank')} value={order.transaction.gateway} />
                  ) : null}
                  {/* {order.transaction.code ? (
                    <DetailRow
                      label={t('orders.list.qr.content')}
                      value={<span className='font-mono text-xs'>{order.transaction.code}</span>}
                    />
                  ) : null} */}
                  <DetailRow
                    label={t('orders.list.transactionDate')}
                    value={formatDateTime(order.transaction.transactionDate, 'dateTimeMedium')}
                  />
                  <DetailRow
                    label={t('orders.checkout.total')}
                    value={
                      <span className='font-semibold text-primary'>{formatVnd(order.transaction.transferAmount)}</span>
                    }
                  />
                </dl>
              </OrderSectionCard>
            ) : null}

            {order.remark ? (
              <OrderSectionCard icon={NoteEditIcon} title={t('orders.list.detail.remarksHeading')}>
                <p className='text-sm leading-relaxed text-foreground/90'>{order.remark}</p>
              </OrderSectionCard>
            ) : null}

            {hasTracking || hasTrackingIds ? (
              <OrderSectionCard icon={DeliveryTruck02Icon} title={t('orders.list.detail.trackingHeading')}>
                <dl className='space-y-2 text-sm'>
                  {order.trackNumber ? (
                    <DetailRow
                      label={t('orders.list.trackNumber')}
                      value={<span className='font-mono'>{order.trackNumber}</span>}
                    />
                  ) : null}
                  {order.shippingPartyOrderId ? (
                    <DetailRow
                      label={t('orders.list.shippingPartyOrderId', { gateway: shippingGatewayLabel })}
                      value={<span className='font-mono'>{order.shippingPartyOrderId}</span>}
                    />
                  ) : null}
                </dl>
                {order.shippingTrackingUrl ? (
                  <div className='mt-3 flex flex-wrap gap-2 border-t border-border/60 pt-3'>
                    <a
                      href={order.shippingTrackingUrl}
                      target='_blank'
                      rel='noreferrer noopener'
                      className='inline-flex items-center gap-1.5 rounded-full bg-leaf/10 px-3 py-1.5 text-xs font-semibold text-leaf ring-1 ring-leaf/20 hover:bg-leaf/15'
                    >
                      <HugeiconsIcon icon={DeliveryTruck02Icon} strokeWidth={2} className='size-3.5' />
                      {t('orders.list.trackShipment', { gateway: shippingGatewayLabel })}
                    </a>
                  </div>
                ) : null}
              </OrderSectionCard>
            ) : null}
          </div>

          <aside className='flex flex-col gap-4'>
            {customerRows.length > 0 ? (
              <OrderSectionCard icon={UserIcon} title={t('orders.list.detail.customerHeading')}>
                <IconRowList rows={customerRows} />
              </OrderSectionCard>
            ) : null}

            {recipientRows.length > 0 ? (
              <OrderSectionCard icon={MapPinpoint02Icon} title={t('orders.list.detail.recipientHeading')}>
                <IconRowList rows={recipientRows} />
              </OrderSectionCard>
            ) : null}

            <OrderSectionCard icon={InvoiceIcon} title={t('orders.list.detail.invoiceHeading')}>
              {order.isExportInvoice && invoiceRows.length > 0 ? (
                <dl className='space-y-2 text-sm'>
                  {invoiceRows.map((row) => (
                    <DetailRow key={row.label} label={row.label} value={row.value} />
                  ))}
                </dl>
              ) : (
                <p className='text-sm text-muted-foreground'>{t('orders.list.detail.invoiceNotRequested')}</p>
              )}
            </OrderSectionCard>

            <OrderSectionCard icon={CalendarCheckOut01Icon} title={t('orders.list.detail.timelineHeading')}>
              <ol className='flex flex-col'>
                <TimelineItem
                  icon={Rocket02Icon}
                  tone='primary'
                  label={t('orders.list.detail.timelineCreated')}
                  value={formatDateTime(order.createAt, 'dateTimeMedium')}
                  isLast={!order.transaction}
                />
                {order.transaction ? (
                  <TimelineItem
                    icon={CheckmarkCircle02Icon}
                    tone='leaf'
                    label={t('orders.list.detail.timelinePaid')}
                    value={formatDateTime(order.transaction.transactionDate, 'dateTimeMedium')}
                    subtitle={formatVnd(order.transaction.transferAmount)}
                    isLast={false}
                  />
                ) : null}
                {order.transaction ? (
                  <TimelineItem
                    icon={DeliveryTruck02Icon}
                    tone='primary'
                    label={t('orders.list.detail.timelineDelivery')}
                    value={
                      order.orderTime > 0 ? (
                        <span className='inline-flex flex-wrap items-baseline gap-x-1'>
                          <span>{formatDateTime(order.orderTime * 1000, 'dateMedium')}</span>
                          <span className='text-xs font-medium text-primary'>
                            ({deliveryTagLabel ?? t('orders.checkout.tagNone')})
                          </span>
                        </span>
                      ) : (
                        t('orders.list.detail.timelineDeliveryImmediate')
                      )
                    }
                    isLast
                  />
                ) : null}
              </ol>
            </OrderSectionCard>

            <div className='space-y-2'>
              {isPendingOrder && order.paymentUrl ? (
                canPay ? (
                  <a href={order.paymentUrl} target='_blank' rel='noopener noreferrer' className='block'>
                    {payNowButton}
                  </a>
                ) : (
                  // No anchor while payments are off - the gateway must not be reachable.
                  payNowButton
                )
              ) : null}

              {isPendingOrder && (!canPay || !canCancelOrder) ? <FeatureUnavailableNotice /> : null}

              {isPendingOrder ? (
                <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant='destructive' className='w-full' disabled={!canCancelOrder}>
                      {t('orders.list.detail.cancelCta')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t('orders.list.detail.cancelConfirmTitle')}</DialogTitle>
                      <DialogDescription>{t('orders.list.detail.cancelConfirmDescription')}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant='outline' disabled={isCancellingOrder}>
                          {t('orders.list.detail.cancelKeep')}
                        </Button>
                      </DialogClose>
                      <Button
                        variant='destructive'
                        onClick={handleConfirmCancel}
                        disabled={isCancellingOrder || !canCancelOrder}
                      >
                        {isCancellingOrder ? <Spinner className='size-4' /> : null}
                        {t('orders.list.detail.cancelConfirmCta')}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : null}
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

interface IconRow {
  icon: typeof UserIcon
  label: string
  value: string
}

const buildIconRows = (rows: (IconRow | null)[]) => rows.filter((row): row is IconRow => Boolean(row))

function IconRowList({ rows }: { rows: IconRow[] }) {
  return (
    <ul className='space-y-3 text-sm'>
      {rows.map((row) => (
        <li key={row.label} className='flex items-center gap-2.5'>
          <span className='mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-secondary/40 text-primary ring-1 ring-primary/10'>
            <HugeiconsIcon icon={row.icon} strokeWidth={1.75} className='size-3.5' />
          </span>
          <div className='min-w-0'>
            <p className='text-[0.7rem] font-medium text-muted-foreground'>{row.label}</p>
            <p className='wrap-break-word font-semibold text-foreground'>{row.value}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className='flex items-baseline justify-between gap-3'>
      <dt className='text-muted-foreground'>{label}</dt>
      <dd className='wrap-break-word text-right font-medium text-foreground'>{value}</dd>
    </div>
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

interface TimelineItemProps {
  icon: typeof PackageIcon
  tone: 'primary' | 'leaf'
  label: string
  value: React.ReactNode
  subtitle?: React.ReactNode
  isLast?: boolean
}

function TimelineItem({ icon, tone, label, value, subtitle, isLast }: TimelineItemProps) {
  return (
    <li className='flex gap-3'>
      <div className='flex flex-col items-center'>
        <span
          className={cn(
            'grid size-7 shrink-0 place-items-center rounded-full ring-1',
            tone === 'leaf' ? 'bg-leaf/10 text-leaf ring-leaf/20' : 'bg-primary/10 text-primary ring-primary/20'
          )}
        >
          <HugeiconsIcon icon={icon} strokeWidth={2} className='size-3.5' />
        </span>
        {!isLast ? <span aria-hidden='true' className='mt-1.5 w-px flex-1 bg-border/60' /> : null}
      </div>
      <div className={cn('min-w-0 flex-1', !isLast && 'pb-5')}>
        <p className='text-[0.7rem] font-semibold text-muted-foreground'>{label}</p>
        <p className='text-xs font-semibold text-foreground/80'>{value}</p>
        {subtitle ? <p className='mt-1 text-[0.625rem] font-semibold text-primary'>{subtitle}</p> : null}
      </div>
    </li>
  )
}
