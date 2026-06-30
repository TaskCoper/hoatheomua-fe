'use client'

import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Spinner } from '@/components/ui/spinner'
import { useDateFormat } from '@/lib/date'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { cn } from '@/shared/utils'
import type { CartItem } from '@/stores/cart.store'
import {
  ArrowLeft02Icon,
  Calendar03Icon,
  CheckmarkCircle02Icon,
  DeliveryTruck02Icon,
  Location04Icon,
  Note02Icon,
  UserIcon
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Image from 'next/image'
import { useMemo, useState } from 'react'
import type { AhamoveResult, ProductNhanh } from '../ahamove.type'
import type { CheckoutPayload, TaxBusinessInfo } from '../types'

const vndFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
})

const formatVnd = (value: number) => vndFormatter.format(value)

interface EstimateResultPanelProps {
  cartItems: CartItem[]
  ahamove: AhamoveResult[]
  products: ProductNhanh[] 
  payload: CheckoutPayload | null
  taxBusinessInfo: TaxBusinessInfo | null
  taxBusinessLookupState: 'idle' | 'loading' | 'found' | 'not_found' | 'error'
  isConfirming: boolean
  onBack: () => void
  onConfirm: (serviceId: string) => void
}

export function EstimateResultPanel({
  cartItems,
  ahamove,
  products,
  payload,
  taxBusinessInfo,
  taxBusinessLookupState,
  isConfirming,
  onBack,
  onConfirm
}: EstimateResultPanelProps) {
  const { t } = useTranslation()
  const { formatDate } = useDateFormat()

  const sortedAhamove = useMemo(
    () => [...ahamove].sort((a, b) => (a.data?.total_fee ?? 0) - (b.data?.total_fee ?? 0)),
    [ahamove]
  )
  const [selectedServiceId, setSelectedServiceId] = useState<string>(sortedAhamove[0]?.service_id ?? '')

  const productById = useMemo(() => {
    const map = new Map<number, ProductNhanh>()
    products.forEach((p) => map.set(p.id, p))
    return map
  }, [products])

  const lines = useMemo(
    () =>
      cartItems.map((item) => {
        const product = productById.get(item.productId)
        const unitPrice = product?.prices?.retail ?? 0
        return {
          lineId: item.lineId,
          name: product?.name ?? `#${item.productId}`,
          image: product?.images?.avatar ?? null,
          quantity: item.quantity,
          unitPrice,
          subtotal: unitPrice * item.quantity
        }
      }),
    [cartItems, productById]
  )

  const productsSubtotal = lines.reduce((sum, line) => sum + line.subtotal, 0)

  const selectedService = sortedAhamove.find((s) => s.service_id === selectedServiceId) ?? sortedAhamove[0]
  const shippingFee = selectedService?.data?.total_fee ?? 0
  const grandTotal = productsSubtotal + shippingFee

  const orderTimeLabel =
    payload && payload.orderTime > 0
      ? formatDate(new Date(payload.orderTime * 1000), 'dateTimeMedium')
      : t('orders.checkout.deliverNow')
  const remarksLabel = payload?.remarks?.trim() ? payload.remarks : t('orders.checkout.noRemarks')
  const hasTaxCode = !!payload?.taxCode?.trim()

  return (
    <div className=' no-scrollbar scroll-smooth flex flex-col gap-4 overflow-y-auto pr-1'>
      {payload ? (
        <section className='rounded-3xl bg-card p-4 ring-1 ring-foreground/5'>
          <header className='mb-3 flex items-center gap-2'>
            <span className='inline-flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary'>
              <HugeiconsIcon icon={Location04Icon} strokeWidth={2} className='size-4' />
            </span>
            <h3 className='font-heading text-sm font-semibold'>{t('orders.checkout.recipientHeading')}</h3>
          </header>
          <dl className='grid grid-cols-1 gap-3 text-sm sm:grid-cols-2'>
            <div className='flex items-start gap-2'>
              <HugeiconsIcon icon={UserIcon} strokeWidth={2} className='mt-0.5 size-4 shrink-0 text-muted-foreground' />
              <div className='min-w-0'>
                <dt className='text-xs text-muted-foreground'>{t('orders.checkout.fullName')}</dt>
                <dd className='truncate font-medium'>
                  {payload.fullName} · {payload.phone}
                </dd>
              </div>
            </div>
            <div className='flex items-start gap-2'>
              <HugeiconsIcon
                icon={Location04Icon}
                strokeWidth={2}
                className='mt-0.5 size-4 shrink-0 text-muted-foreground'
              />
              <div className='min-w-0'>
                <dt className='text-xs text-muted-foreground'>{t('orders.checkout.addressLine')}</dt>
                <dd className='font-medium'>{payload.address}</dd>
              </div>
            </div>
            <div className='flex items-start gap-2'>
              <HugeiconsIcon
                icon={Calendar03Icon}
                strokeWidth={2}
                className='mt-0.5 size-4 shrink-0 text-muted-foreground'
              />
              <div className='min-w-0'>
                <dt className='text-xs text-muted-foreground'>{t('orders.checkout.orderTime')}</dt>
                <dd className='font-medium'>{orderTimeLabel}</dd>
              </div>
            </div>
            <div className='flex items-start gap-2'>
              <HugeiconsIcon
                icon={Note02Icon}
                strokeWidth={2}
                className='mt-0.5 size-4 shrink-0 text-muted-foreground'
              />
              <div className='min-w-0'>
                <dt className='text-xs text-muted-foreground'>{t('orders.checkout.remarks')}</dt>
                <dd className={cn('font-medium', !payload.remarks?.trim() && 'text-muted-foreground italic')}>
                  {remarksLabel}
                </dd>
              </div>
            </div>
          </dl>
        </section>
      ) : null}

      {hasTaxCode ? (
        <section className='rounded-3xl bg-card p-4 ring-1 ring-foreground/5'>
          <header className='mb-3 flex items-center gap-2'>
            <span className='inline-flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary'>
              <HugeiconsIcon icon={Location04Icon} strokeWidth={2} className='size-4' />
            </span>
            <h3 className='font-heading text-sm font-semibold'>{t('orders.checkout.taxBusinessHeading')}</h3>
          </header>

          {taxBusinessLookupState === 'loading' ? (
            <p className='text-sm text-muted-foreground'>{t('orders.checkout.taxBusinessLoading')}</p>
          ) : taxBusinessLookupState === 'found' && taxBusinessInfo ? (
            <dl className='grid grid-cols-1 gap-3 text-sm'>
              <div className='min-w-0 whitespace-normal break-words'>
                <span className='text-xs text-muted-foreground'>{t('orders.checkout.taxBusinessId')}:</span>{' '}
                <span className='font-medium'>{taxBusinessInfo.id}</span>
              </div>
              <div className='min-w-0 whitespace-normal break-words'>
                <span className='text-xs text-muted-foreground'>{t('orders.checkout.taxBusinessName')}:</span>{' '}
                <span className='font-medium'>{taxBusinessInfo.name}</span>
              </div>
              <div className='min-w-0 whitespace-normal break-words'>
                <span className='text-xs text-muted-foreground'>{t('orders.checkout.taxBusinessAddress')}:</span>{' '}
                <span className='font-medium'>{taxBusinessInfo.address}</span>
              </div>
            </dl>
          ) : taxBusinessLookupState === 'error' ? (
            <p className='text-sm text-destructive'>{t('orders.checkout.taxBusinessLookupError')}</p>
          ) : taxBusinessLookupState === 'not_found' ? (
            <p className='text-sm text-muted-foreground'>{t('orders.checkout.taxBusinessNotFound')}</p>
          ) : (
            <p className='text-sm text-muted-foreground'>{t('orders.checkout.taxBusinessHint')}</p>
          )}
        </section>
      ) : null}

      <section className='rounded-3xl bg-card p-4 ring-1 ring-foreground/5'>
        <header className='mb-3 flex items-center justify-between'>
          <h3 className='font-heading text-sm font-semibold'>{t('orders.checkout.productsHeading')}</h3>
          <span className='text-xs text-muted-foreground'>
            {t('orders.checkout.lineCount', { count: lines.length })}
          </span>
        </header>
        <ul className='divide-y divide-border/60'>
          {lines.map((line) => (
            <li key={line.lineId} className='flex items-center gap-3 py-2.5 first:pt-0 last:pb-0'>
              <div className='relative size-12 shrink-0 overflow-hidden rounded-2xl bg-secondary/40 ring-1 ring-foreground/5'>
                {line.image ? (
                  <Image src={line.image} alt={line.name} fill className='object-cover' sizes='48px' />
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
      </section>

      <section className='rounded-3xl bg-card p-4 ring-1 ring-foreground/5'>
        <header className='mb-3 flex items-center gap-2'>
          <span className='inline-flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary'>
            <HugeiconsIcon icon={DeliveryTruck02Icon} strokeWidth={2} className='size-4' />
          </span>
          <h3 className='font-heading text-sm font-semibold'>{t('orders.checkout.shippingHeading')}</h3>
        </header>

        {sortedAhamove.length === 0 ? (
          <p className='text-sm text-muted-foreground'>{t('orders.checkout.shippingEmpty')}</p>
        ) : (
          <RadioGroup value={selectedServiceId} onValueChange={setSelectedServiceId} className='gap-2'>
            {sortedAhamove.map((service, index) => {
              const isActive = service.service_id === selectedServiceId

              return (
                <label
                  key={service.service_id}
                  htmlFor={`ship-${service.service_id}`}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-2xl border bg-background/60 px-3 py-2.5 transition-colors',
                    isActive
                      ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/30'
                      : 'border-border/60 hover:bg-muted/40'
                  )}
                >
                  <RadioGroupItem id={`ship-${service.service_id}`} value={service.service_id} />
                  <div className='min-w-0 flex-1'>
                    <div className='flex items-center gap-2'>
                      <p className='truncate text-sm font-medium'>{service.service_id}</p>
                      {index === 0 ? (
                        <span className='rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary'>
                          {t('orders.checkout.bestPrice')}
                        </span>
                      ) : null}
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      {t('orders.checkout.shippingMeta', {
                        km: (service.data?.distance ?? 0).toFixed(1),
                        min: Math.max(1, Math.round((service.data?.duration ?? 0) / 60))
                      })}
                    </p>
                  </div>
                  <span className='text-sm font-semibold text-primary'>{formatVnd(service.data?.total_fee ?? 0)}</span>
                </label>
              )
            })}
          </RadioGroup>
        )}
      </section>

      <section className='rounded-3xl bg-secondary/20 p-4 ring-1 ring-foreground/5'>
        <dl className='space-y-1 text-sm'>
          <div className='flex justify-between text-muted-foreground'>
            <dt>{t('orders.checkout.subtotal')}</dt>
            <dd>{formatVnd(productsSubtotal)}</dd>
          </div>
          <div className='flex justify-between text-muted-foreground'>
            <dt>{t('orders.checkout.shippingFee')}</dt>
            <dd>{formatVnd(shippingFee)}</dd>
          </div>
          <div className='mt-2 flex items-baseline justify-between border-t border-border/60 pt-2'>
            <dt className='text-sm font-semibold'>{t('orders.checkout.total')}</dt>
            <dd className='font-title text-2xl font-bold text-primary'>{formatVnd(grandTotal)}</dd>
          </div>
        </dl>
      </section>

      <div className='flex flex-wrap justify-end gap-2'>
        <Button type='button' variant='outline' onClick={onBack} disabled={isConfirming}>
          <HugeiconsIcon icon={ArrowLeft02Icon} strokeWidth={2} />
          {t('orders.checkout.back')}
        </Button>
        <Button
          type='button'
          onClick={() => onConfirm(selectedServiceId)}
          disabled={!selectedServiceId || isConfirming}
        >
          {isConfirming ? <Spinner /> : <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} />}
          {t('orders.checkout.confirm')}
        </Button>
      </div>
    </div>
  )
}
