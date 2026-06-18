'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { QrCodeIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { useGetOrder } from '../hooks/use-get-order'
import { useGetOrderStatus } from '../hooks/use-get-order-status'

interface OrderQrDialogProps {
  orderId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface QrPaymentInfo {
  account?: string
  bank?: string
  amount?: string
  description?: string
}

const parseQrPaymentInfo = (qrCodeUrl: string): QrPaymentInfo | null => {
  try {
    const url = new URL(qrCodeUrl, 'https://qr.sepay.vn')
    const account = url.searchParams.get('acc')?.trim()
    const bank = url.searchParams.get('bank')?.trim()
    const amount = url.searchParams.get('amount')?.trim()
    const description = url.searchParams.get('des')?.trim()

    if (!account && !bank && !amount && !description) {
      return null
    }

    return {
      account: account || undefined,
      bank: bank || undefined,
      amount: amount || undefined,
      description: description || undefined
    }
  } catch {
    return null
  }
}

const formatVndAmount = (amount: string, locale: string) => {
  const value = Number(amount)

  if (!Number.isFinite(value)) {
    return amount
  }

  return new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(value)
}

export default function OrderQrDialog({ orderId, open, onOpenChange }: OrderQrDialogProps) {
  const queryClient = useQueryClient()
  const { t, locale } = useTranslation()
  const { order, isLoadingOrder } = useGetOrder({ orderId, enabled: open })
  const isPending = order?.status === 'Pending'
  const { orderStatus, isLoadingOrderStatus } = useGetOrderStatus({ orderId, enabled: isPending && open })
  const qrCodeUrl = order?.qrCodeUrl
  const paymentInfo = useMemo(() => (qrCodeUrl ? parseQrPaymentInfo(qrCodeUrl) : null), [qrCodeUrl])
  const paymentRows = useMemo(
    () =>
      paymentInfo
        ? [
            paymentInfo.bank ? { label: t('orders.list.qr.bank'), value: paymentInfo.bank } : null,
            paymentInfo.account ? { label: t('orders.list.qr.account'), value: paymentInfo.account } : null,
            paymentInfo.amount
              ? { label: t('orders.list.qr.amount'), value: formatVndAmount(paymentInfo.amount, locale) }
              : null,
            paymentInfo.description ? { label: t('orders.list.qr.content'), value: paymentInfo.description } : null
          ].filter((row): row is { label: string; value: string } => Boolean(row))
        : [],
    [locale, paymentInfo, t]
  )

  useEffect(() => {
    if (!isLoadingOrderStatus && orderStatus === 'Paid') {
      onOpenChange(false)
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['order', orderId] })
    }
  }, [orderStatus, onOpenChange, isLoadingOrderStatus, orderId, queryClient])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='min-w-xl' position='top-center'>
        <DialogHeader>
          <DialogTitle>{t('orders.list.qr.title')}</DialogTitle>
          <DialogDescription>{t('orders.list.qr.description')}</DialogDescription>
        </DialogHeader>

        <div className='flex min-h-70 flex-col items-center justify-center gap-4'>
          {isLoadingOrder ? (
            <div className='flex flex-col items-center gap-2 text-muted-foreground'>
              <Spinner className='size-6' />
              <span className='text-sm'>{t('orders.list.qr.loading')}</span>
            </div>
          ) : qrCodeUrl ? (
            <>
              <div className='rounded-3xl bg-popover p-4 ring-1 ring-foreground/5'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrCodeUrl} alt={t('orders.list.qr.imageAlt')} className='size-56 object-contain' />
              </div>

              {paymentRows.length > 0 || orderId ? (
                <div className='w-full rounded-2xl border bg-secondary/20 p-3'>
                  <p className='mb-2 text-xs font-medium text-muted-foreground'>{t('orders.list.qr.detailsTitle')}</p>
                  <dl className='space-y-2'>
                    {paymentRows.map((row) => (
                      <div key={row.label} className='grid grid-cols-[7rem_minmax(0,1fr)] items-start gap-2 text-sm'>
                        <dt className='text-muted-foreground'>{row.label}</dt>
                        <dd className='wrap-break-word font-medium text-foreground'>{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ) : null}

              <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                <Spinner className='size-4' />
                <span>{t('orders.list.qr.waiting')}</span>
              </div>
            </>
          ) : (
            <div className='flex flex-col items-center gap-2 text-muted-foreground'>
              <span className='inline-flex size-12 items-center justify-center rounded-full bg-secondary/40'>
                <HugeiconsIcon icon={QrCodeIcon} strokeWidth={1.75} className='size-6 text-primary' />
              </span>
              <p className='text-sm'>{t('orders.list.qr.empty')}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
