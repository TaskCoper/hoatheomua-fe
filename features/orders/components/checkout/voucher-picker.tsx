'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { ErrorResponse } from '@/lib/axios'
import { formatVnd } from '@/lib/currency'
import { useDateFormat } from '@/lib/date'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { cn } from '@/shared/utils'
import { ArrowRight01Icon, Calendar03Icon, Tag01Icon, Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { isAxiosError } from 'axios'
import { useState } from 'react'
import type { CheckoutVoucher } from '../../vouchers/types'

interface VoucherPickerProps {
  vouchers: CheckoutVoucher[]
  unavailableVouchers?: CheckoutVoucher[]
  productsSubtotal: number
  selectedVoucher: CheckoutVoucher | null
  onSelect: (voucher: CheckoutVoucher | null) => void
  onEstimatePrivateVoucher: (code: string) => Promise<CheckoutVoucher>
  isEstimatingPrivate?: boolean
  className?: string
}

const EMPTY_VOUCHERS: CheckoutVoucher[] = []

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

const getVoucherValue = (voucher: CheckoutVoucher) =>
  voucher.kind === 'percent' ? `${voucher.value}%` : formatVnd(voucher.value)

export default function VoucherPicker({
  vouchers,
  unavailableVouchers = EMPTY_VOUCHERS,
  productsSubtotal,
  selectedVoucher,
  onSelect,
  onEstimatePrivateVoucher,
  isEstimatingPrivate = false,
  className
}: VoucherPickerProps) {
  const { t } = useTranslation()
  const { formatDate } = useDateFormat()
  const [open, setOpen] = useState(false)
  const [privateCode, setPrivateCode] = useState('')
  const [privateError, setPrivateError] = useState<string | null>(null)

  const privateSelected = selectedVoucher?.visibility === 'private'
  const listedVouchers = [
    ...vouchers
      .filter((voucher) => voucher.visibility === 'public')
      .map((voucher) => ({ voucher, unavailable: false })),
    ...unavailableVouchers.map((voucher) => ({ voucher, unavailable: true }))
  ]

  const changeOpen = (nextOpen: boolean) => {
    if (nextOpen) {
      setPrivateCode(privateSelected && selectedVoucher ? selectedVoucher.code : '')
      setPrivateError(null)
    }
    setOpen(nextOpen)
  }

  const selectPublic = (voucher: CheckoutVoucher, checked: boolean) => {
    onSelect(checked ? voucher : null)
    if (checked) setOpen(false)
  }

  const applyPrivate = async () => {
    const normalized = privateCode.trim().toUpperCase()
    if (!normalized) return

    try {
      const voucher = await onEstimatePrivateVoucher(normalized)
      onSelect(voucher)
      setOpen(false)
    } catch (error) {
      const detail = isAxiosError<ErrorResponse>(error) ? error.response?.data?.detail?.trim() : undefined
      setPrivateError(detail || t('orders.checkout.voucher.invalid'))
    }
  }

  const clearPrivate = () => {
    setPrivateCode('')
    setPrivateError(null)
    onSelect(null)
  }

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={changeOpen}>
        <DialogTrigger asChild>
          <button
            type='button'
            className={cn(
              'flex w-full cursor-pointer items-center gap-3 rounded-3xl border border-border bg-card p-5 text-left transition-colors hover:border-primary/25 hover:bg-muted/20',
              className
            )}
          >
            <span className='grid size-9 shrink-0 place-items-center rounded-xl bg-secondary/40 text-primary ring-1 ring-primary/10'>
              <HugeiconsIcon icon={Tag01Icon} className='size-4' />
            </span>
            <span className='min-w-0 flex-1'>
              <span className='block font-title text-base font-semibold'>{t('orders.checkout.voucher.title')}</span>
              {selectedVoucher ? (
                <span className='mt-0.5 flex items-center gap-2 text-xs'>
                  <span className='shrink-0 font-semibold text-foreground'>{getVoucherValue(selectedVoucher)}</span>
                  <span className='min-w-0 flex-1 truncate text-muted-foreground'>
                    {getVoucherDescription(selectedVoucher, t)}
                  </span>
                  <span className='shrink-0 font-semibold text-primary'>
                    -{formatVnd(selectedVoucher.discountAmount)}
                  </span>
                </span>
              ) : (
                <span className='mt-0.5 block text-xs text-muted-foreground'>
                  {t('orders.checkout.voucher.selectPlaceholder')}
                </span>
              )}
            </span>
            <HugeiconsIcon icon={ArrowRight01Icon} className='size-4 shrink-0 text-muted-foreground' />
          </button>
        </DialogTrigger>

        <DialogContent className='gap-0 rounded-3xl p-5 sm:max-w-md'>
          <DialogHeader className='gap-1 pr-8'>
            <DialogTitle className='font-title text-base font-semibold'>
              {t('orders.checkout.voucher.title')}
            </DialogTitle>
            <DialogDescription className='text-xs'>{t('orders.checkout.voucher.description')}</DialogDescription>
          </DialogHeader>

          <div className='mt-4 flex gap-2'>
            <Input
              value={privateCode}
              onChange={(event) => {
                setPrivateCode(event.target.value.toUpperCase())
                setPrivateError(null)
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !privateSelected) applyPrivate()
              }}
              readOnly={privateSelected}
              placeholder={t('orders.checkout.voucher.inputPlaceholder')}
              aria-label={t('orders.checkout.voucher.inputLabel')}
              className='h-10 rounded-xl bg-background/60 text-sm uppercase'
            />
            <Button
              type='button'
              variant={privateSelected ? 'outline' : 'default'}
              className='h-10 shrink-0 rounded-xl'
              onClick={privateSelected ? clearPrivate : applyPrivate}
              disabled={isEstimatingPrivate || !privateCode.trim()}
            >
              {privateSelected ? t('orders.checkout.voucher.clear') : t('orders.checkout.voucher.apply')}
            </Button>
          </div>
          {privateError ? <p className='mt-2 text-xs text-destructive'>{privateError}</p> : null}
          {privateSelected && selectedVoucher ? (
            <p className='mt-2 text-xs font-medium text-primary'>
              {t('orders.checkout.voucher.applied', { code: selectedVoucher.code })}
            </p>
          ) : null}

          <div className='mt-4 border-t border-dashed border-border' />

          {listedVouchers.length > 0 ? (
            <div className='mt-4 max-h-108 space-y-2 overflow-y-auto pr-1 [scrollbar-color:var(--color-border)_transparent] [scrollbar-width:thin]'>
              {listedVouchers.map(({ voucher, unavailable }) => {
                const checked = selectedVoucher?.id === voucher.id
                const disabled = unavailable || privateSelected
                const expiresAt = formatDate(voucher.expiresAt, 'dateShort')

                return (
                  <label
                    key={voucher.id}
                    className={cn(
                      'group relative flex cursor-pointer items-stretch overflow-hidden rounded-2xl border bg-card transition-[border-color,background-color,box-shadow]',
                      checked
                        ? 'border-primary/45 bg-primary/5 ring-1 ring-primary/25'
                        : 'border-border/60 hover:border-primary/25 hover:bg-muted/20',
                      disabled && !checked && 'cursor-not-allowed opacity-55'
                    )}
                  >
                    <span className='relative flex w-14 shrink-0 items-center justify-center overflow-hidden bg-primary text-primary-foreground'>
                      <span className='[writing-mode:vertical-rl] rotate-180 text-[0.65rem] font-bold tracking-[0.14em] uppercase'>
                        {voucher.kind === 'percent'
                          ? t('orders.checkout.voucher.ticketPercent')
                          : t('orders.checkout.voucher.ticketFixed')}
                      </span>
                      {[0, 1, 2, 3].map((notch) => (
                        <span
                          key={notch}
                          aria-hidden='true'
                          className='absolute -right-1.5 size-3 rounded-full bg-popover'
                          style={{ top: `${18 + notch * 20}%` }}
                        />
                      ))}
                    </span>
                    <span className='flex min-w-0 flex-1 items-start gap-3 px-3 py-3'>
                      <Checkbox
                        checked={checked}
                        disabled={disabled}
                        onCheckedChange={(value) => selectPublic(voucher, value === true)}
                        className='mt-0.5'
                      />
                      <span className='min-w-0 flex-1'>
                        <span className='flex items-start justify-between gap-3'>
                          <span className='min-w-0'>
                            <span className='flex items-center gap-2'>
                              <span className='truncate text-base font-semibold text-foreground'>
                                {getVoucherValue(voucher)}
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
                          {checked ? (
                            <HugeiconsIcon icon={Tick02Icon} className='size-4 shrink-0 text-primary' />
                          ) : null}
                        </span>
                        <span className='mt-3 border-t border-dashed border-border/80 pt-2 text-[0.7rem] text-muted-foreground'>
                          {unavailable ? (
                            <span className='block truncate font-medium'>
                              {voucher.minOrderAmount && productsSubtotal < voucher.minOrderAmount
                                ? t('orders.checkout.voucher.minOrder', { amount: formatVnd(voucher.minOrderAmount) })
                                : t('orders.checkout.voucher.notEligible')}
                            </span>
                          ) : (
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
                                <HugeiconsIcon icon={Tag01Icon} className='size-3' />-
                                {formatVnd(voucher.discountAmount)}
                              </span>
                            </span>
                          )}
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
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
