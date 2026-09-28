'use client'

import { Button } from '@/components/ui/button'
import { useGetOrderTags } from '@/hooks/use-get-order-tags'
import { formatVnd } from '@/lib/currency'
import { useDateFormat } from '@/lib/date'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { LocationUser01Icon, Mail01Icon, Motorbike02Icon, PenIcon, Wallet01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import type { ReactNode } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { ARE_CARDS_ENABLED } from '../../cards/card-feature'
import type { CheckoutCard, CheckoutCardField } from '../../cards/types'
import { localizedMethodText, type CheckoutDeliveryOption, type CheckoutPaymentOption } from '../../checkout-methods'
import { InvoiceType } from '../../types'
import type { CheckoutFormValues } from '../../validations'
import CheckoutCards from './cards/checkout-cards'
import CheckoutSection from './checkout-section'
import type { CheckoutSummaryLine } from './checkout-sidebar'
import { CHECKOUT_CARDS_STEP, type CheckoutStep } from './checkout-stepper'

interface StepReviewProps {
  lines: CheckoutSummaryLine[]
  cards: CheckoutCardField[]
  onSaveCard: (card: CheckoutCard, editingIndex: number | null) => void
  onRemoveCard: (index: number) => void
  deliveryMethod: CheckoutDeliveryOption | null
  paymentMethod: CheckoutPaymentOption | null
  rawShippingFee: number
  isFreeShip: boolean
  onEditStep: (step: CheckoutStep) => void
}

export default function StepReview({
  lines,
  cards,
  onSaveCard,
  onRemoveCard,
  deliveryMethod,
  paymentMethod,
  rawShippingFee,
  isFreeShip,
  onEditStep
}: StepReviewProps) {
  const { t, locale } = useTranslation()
  const { formatDate } = useDateFormat()
  const { control } = useFormContext<CheckoutFormValues>()
  const { orderTags } = useGetOrderTags()

  const values = useWatch({ control })

  const address = [values.addressLine, values.ward, values.city].filter(Boolean).join(', ')
  const orderTimeLabel = formatDate(values.orderTime ?? new Date(), 'dateLong')
  const selectedTagId = values.tagIds?.[0]
  const deliveryTimeLabel =
    selectedTagId !== undefined
      ? orderTags?.options?.find((option) => option.value === selectedTagId)?.label
      : undefined
  const deliveryQuote = deliveryMethod?.quote

  return (
    <div className='flex flex-col gap-2'>
      <ReviewSection
        icon={LocationUser01Icon}
        title={t('orders.checkout.recipientHeading')}
        onEdit={() => onEditStep(1)}
      >
        <ReviewRow label={t('orders.checkout.fullNameReceiver')} value={values.fullNameReceiver} />
        <ReviewRow label={t('orders.checkout.phoneReceiver')} value={values.phoneReceiver} />
        <ReviewRow label={t('orders.checkout.sidebar.address')} value={address} />
        <ReviewRow label={t('orders.checkout.orderTime')} value={orderTimeLabel} />
        {deliveryTimeLabel ? <ReviewRow label={t('orders.checkout.tag')} value={deliveryTimeLabel} /> : null}
        <ReviewRow
          label={t('orders.checkout.remarks')}
          value={values.remarks?.trim() || t('orders.checkout.noRemarks')}
        />
      </ReviewSection>

      <ReviewSection
        icon={Motorbike02Icon}
        title={t('orders.checkout.shippingChosenTitle')}
        onEdit={() => onEditStep(1)}
      >
        {deliveryMethod ? (
          <div className='flex items-center gap-3 rounded-2xl border border-border/60 bg-background/60 px-3 py-2.5'>
            <span className='grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary'>
              <HugeiconsIcon icon={Motorbike02Icon} strokeWidth={2} className='size-4' />
            </span>
            <div className='min-w-0 flex-1'>
              <p className='truncate text-sm font-medium'>{localizedMethodText(deliveryMethod.label, locale)}</p>
              {deliveryQuote ? (
                <p className='truncate text-xs text-muted-foreground'>
                  {t('orders.checkout.shippingMeta', {
                    km: deliveryQuote.distanceKm.toFixed(1),
                    min: Math.max(1, Math.round(deliveryQuote.durationSeconds / 60))
                  })}
                </p>
              ) : null}
            </div>
            <div className='shrink-0 text-right'>
              <p className='text-sm font-semibold text-primary'>
                {isFreeShip ? t('orders.checkout.shippingFree') : formatVnd(rawShippingFee)}
              </p>
              {isFreeShip ? (
                <p className='text-xs text-muted-foreground line-through'>{formatVnd(rawShippingFee)}</p>
              ) : null}
            </div>
          </div>
        ) : (
          <p className='text-xs text-muted-foreground'>{t('orders.checkout.shippingEmpty')}</p>
        )}
      </ReviewSection>

      {!ARE_CARDS_ENABLED ? null : cards.length > 0 ? (
        <CheckoutCards lines={lines} cards={cards} onSave={onSaveCard} onRemove={onRemoveCard} readOnly />
      ) : (
        <ReviewSection
          icon={Mail01Icon}
          title={t('orders.checkout.cards.heading')}
          onEdit={() => onEditStep(CHECKOUT_CARDS_STEP)}
        >
          <p className='text-xs text-muted-foreground'>{t('orders.checkout.cards.reviewEmpty')}</p>
        </ReviewSection>
      )}

      <ReviewSection icon={Wallet01Icon} title={t('orders.checkout.paymentTitle')} onEdit={() => onEditStep(3)}>
        {paymentMethod ? (
          <ReviewRow
            label={t('orders.checkout.paymentTitle')}
            value={localizedMethodText(paymentMethod.label, locale)}
          />
        ) : (
          <p className='text-xs text-muted-foreground'>{t('orders.checkout.paymentEmpty')}</p>
        )}

        {values.isExportInvoice ? (
          <>
            <ReviewRow
              label={t('orders.checkout.invoiceType')}
              value={
                values.invoiceType === InvoiceType.Business
                  ? t('orders.checkout.invoiceTypeBusiness')
                  : t('orders.checkout.invoiceTypePersonal')
              }
            />
            {values.taxCode?.trim() ? (
              <ReviewRow label={t('orders.checkout.taxCodeLabel')} value={values.taxCode} />
            ) : null}
            {values.receiptEmail?.trim() ? (
              <ReviewRow label={t('orders.checkout.receiptEmail')} value={values.receiptEmail} />
            ) : null}
          </>
        ) : null}
      </ReviewSection>
    </div>
  )
}

function ReviewSection({
  icon,
  title,
  description,
  onEdit,
  children
}: {
  icon: IconSvgElement
  title: string
  description?: string
  onEdit: () => void
  children: ReactNode
}) {
  const { t } = useTranslation()

  return (
    <CheckoutSection
      icon={icon}
      title={title}
      description={description}
      contentClassName='space-y-2'
      action={
        <Button type='button' variant='link' size='sm' className='shrink-0 text-xs' onClick={onEdit}>
          <HugeiconsIcon icon={PenIcon} />
          {t('orders.checkout.changeAddress')}
        </Button>
      }
    >
      {children}
    </CheckoutSection>
  )
}

function ReviewRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null

  return (
    <div className='flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4'>
      <span className='text-xs text-muted-foreground sm:text-sm'>{label}</span>
      <span className='min-w-0 text-sm font-medium wrap-break-words sm:max-w-[65%] sm:text-right'>{value}</span>
    </div>
  )
}
