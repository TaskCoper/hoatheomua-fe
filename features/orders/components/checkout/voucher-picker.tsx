'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { ErrorResponse } from '@/lib/axios'
import { formatVnd } from '@/lib/currency'
import { useDateFormat } from '@/lib/date'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { cn } from '@/shared/utils'
import { Calendar03Icon, Tag01Icon, Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { isAxiosError } from 'axios'
import { useState } from 'react'
import type { CheckoutVoucher } from '../../vouchers/types'

interface VoucherPickerProps {
  vouchers: CheckoutVoucher[]
  selectedVoucher: CheckoutVoucher | null
  onSelect: (voucher: CheckoutVoucher | null) => void
  onEstimatePrivateVoucher: (code: string) => Promise<CheckoutVoucher>
  isEstimatingPrivate?: boolean
}

const getVoucherDescription = (voucher: CheckoutVoucher, t: ReturnType<typeof useTranslation>['t']) => {
  const description = voucher.description?.trim()
  if (description) return description

  if (voucher.kind === 'fixed') return t('orders.checkout.voucher.defaultFixed', { amount: formatVnd(voucher.value) })

  return voucher.maxDiscountAmount
    ? t('orders.checkout.voucher.defaultPercentMax', {
        value: voucher.value,
        max: formatVnd(voucher.maxDiscountAmount)
      })
    : t('orders.checkout.voucher.defaultPercent', { value: voucher.value })
}

export default function VoucherPicker({
  vouchers,
  selectedVoucher,
  onSelect,
  onEstimatePrivateVoucher,
  isEstimatingPrivate = false
}: VoucherPickerProps) {
  const { t } = useTranslation()
  const { formatDate } = useDateFormat()
  const [privateCode, setPrivateCode] = useState('')
  const [privateError, setPrivateError] = useState<string | null>(null)
  const [privateApplied, setPrivateApplied] = useState(false)

  const publicSelected = selectedVoucher?.visibility === 'public'
  const privateSelected = selectedVoucher?.visibility === 'private'
  const publicVouchers = vouchers.filter((voucher) => voucher.visibility === 'public')

  const selectPublic = (voucher: CheckoutVoucher, checked: boolean) => {
    setPrivateApplied(false)
    setPrivateError(null)
    onSelect(checked ? voucher : null)
  }

  const applyPrivate = async () => {
    const normalized = privateCode.trim().toUpperCase()

    try {
      const voucher = await onEstimatePrivateVoucher(normalized)
      setPrivateError(null)
      setPrivateApplied(true)
      onSelect(voucher)
    } catch (error) {
      setPrivateApplied(false)
      const detail = isAxiosError<ErrorResponse>(error) ? error.response?.data?.detail?.trim() : undefined
      setPrivateError(detail || t('orders.checkout.voucher.invalid'))
    }
  }

  const clearPrivate = () => {
    setPrivateCode('')
    setPrivateApplied(false)
    setPrivateError(null)
    if (privateSelected) onSelect(null)
  }

  return (
    <TooltipProvider>
      <section className='rounded-3xl border border-border bg-card p-5'>
        <div className='flex items-start gap-3'>
          <span className='grid size-9 shrink-0 place-items-center rounded-xl bg-secondary/40 text-primary ring-1 ring-primary/10'>
            <HugeiconsIcon icon={Tag01Icon} className='size-4' />
          </span>
          <div className='min-w-0'>
            <h2 className='font-title text-base font-semibold'>{t('orders.checkout.voucher.title')}</h2>
            <p className='mt-0.5 text-xs text-muted-foreground'>{t('orders.checkout.voucher.description')}</p>
          </div>
        </div>

        {publicVouchers.length > 0 ? (
          <div className='mt-4 max-h-72 space-y-2 overflow-y-auto pr-1 [scrollbar-color:var(--color-border)_transparent] [scrollbar-width:thin]'>
            {publicVouchers.map((voucher) => {
              const checked = selectedVoucher?.id === voucher.id
              const expiresAt = formatDate(voucher.expiresAt, 'dateShort')

              return (
                <label
                  key={voucher.id}
                  className={cn(
                    'group relative flex cursor-pointer items-stretch overflow-hidden rounded-2xl border bg-card transition-[border-color,background-color,box-shadow]',
                    checked
                      ? 'border-primary/45 bg-primary/5 ring-1 ring-primary/25'
                      : 'border-border/60 hover:border-primary/25 hover:bg-muted/20',
                    privateSelected && !checked && 'cursor-not-allowed opacity-55'
                  )}
                >
                  <span
                    className={cn(
                      'relative flex w-14 shrink-0 items-center justify-center overflow-hidden bg-primary text-primary-foreground'
                    )}
                  >
                    <span className='[writing-mode:vertical-rl] rotate-180 text-[0.65rem] font-bold tracking-[0.14em] uppercase'>
                      {voucher.kind === 'percent'
                        ? t('orders.checkout.voucher.ticketPercent')
                        : t('orders.checkout.voucher.ticketFixed')}
                    </span>
                    {[0, 1, 2, 3].map((notch) => (
                      <span
                        key={notch}
                        aria-hidden='true'
                        className='absolute -right-1.5 size-3 rounded-full bg-card'
                        style={{ top: `${18 + notch * 20}%` }}
                      />
                    ))}
                  </span>
                  <span className='flex min-w-0 flex-1 items-start gap-3 px-3 py-3'>
                    <Checkbox
                      checked={checked}
                      disabled={privateSelected}
                      onCheckedChange={(value) => selectPublic(voucher, value === true)}
                      className='mt-0.5'
                    />
                    <span className='min-w-0 flex-1'>
                      <span className='flex items-start justify-between gap-3'>
                        <span className='min-w-0'>
                          <span className='flex items-center gap-2'>
                            <span className='truncate text-base font-semibold text-foreground'>
                              {voucher.kind === 'percent' ? `${voucher.value}%` : formatVnd(voucher.value)}
                            </span>
                            <span className='truncate text-xs font-medium text-muted-foreground'>
                              {t('orders.checkout.voucher.apiOffer')}
                            </span>
                          </span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className='mt-1 block truncate text-xs text-muted-foreground'>
                                {getVoucherDescription(voucher, t)}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent
                              className='border border-border bg-card text-foreground shadow-lg'
                              iconClassName='bg-card fill-card'
                            >
                              {getVoucherDescription(voucher, t)}
                            </TooltipContent>
                          </Tooltip>
                        </span>
                        <span className='flex shrink-0 items-center gap-1'>
                          <span className='max-w-20 truncate text-[0.6rem] font-semibold text-primary'>
                            {voucher.code}
                          </span>
                          {checked ? <HugeiconsIcon icon={Tick02Icon} className='size-4 text-primary' /> : null}
                        </span>
                      </span>
                      <span className='mt-3 border-t border-dashed border-border/80 pt-2 text-[0.7rem] text-muted-foreground'>
                        <span className='flex items-center justify-between gap-3'>
                          <span className='inline-flex min-w-0 items-center gap-1'>
                            <HugeiconsIcon icon={Calendar03Icon} className='size-3 shrink-0 text-primary' />
                            <span className='truncate'>
                              {expiresAt
                                ? t('orders.checkout.voucher.expiresAt', { date: expiresAt })
                                : t('orders.checkout.voucher.noExpiry')}
                            </span>
                          </span>
                          <span className='inline-flex shrink-0 items-center gap-1 font-semibold text-primary'>
                            <HugeiconsIcon icon={Tag01Icon} className='size-3' />-{formatVnd(voucher.discountAmount)}
                          </span>
                        </span>
                      </span>
                    </span>
                  </span>
                </label>
              )
            })}
          </div>
        ) : (
          <p className='mt-5 text-center text-sm text-muted-foreground'>{t('orders.checkout.voucher.empty')}</p>
        )}

        <div className='my-4 flex items-center gap-3 text-[0.65rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase'>
          <span className='h-px flex-1 bg-border' />
          <span>{t('orders.checkout.voucher.orEnter')}</span>
          <span className='h-px flex-1 bg-border' />
        </div>

        <div className='flex gap-2'>
          <Input
            value={privateCode}
            onChange={(event) => {
              setPrivateCode(event.target.value.toUpperCase())
              setPrivateError(null)
              if (privateApplied) {
                setPrivateApplied(false)
                if (privateSelected) onSelect(null)
              }
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') applyPrivate()
            }}
            disabled={publicSelected}
            placeholder={t('orders.checkout.voucher.inputPlaceholder')}
            aria-label={t('orders.checkout.voucher.inputLabel')}
            className='h-10 rounded-xl bg-background/60 text-sm uppercase'
          />
          <Button
            type='button'
            variant='outline'
            className='h-10 shrink-0 rounded-xl'
            onClick={privateApplied ? clearPrivate : applyPrivate}
            disabled={publicSelected || isEstimatingPrivate || !privateCode.trim()}
          >
            {privateApplied ? t('orders.checkout.voucher.clear') : t('orders.checkout.voucher.apply')}
          </Button>
        </div>
        {privateError ? <p className='mt-2 text-xs text-destructive'>{privateError}</p> : null}
        {privateApplied && selectedVoucher ? (
          <p className='mt-2 text-xs font-medium text-primary'>
            {t('orders.checkout.voucher.applied', { code: selectedVoucher.code })}
          </p>
        ) : null}
      </section>
    </TooltipProvider>
  )
}
