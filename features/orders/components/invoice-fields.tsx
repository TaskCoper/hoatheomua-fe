'use client'

import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { useEffect } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { useDebounce } from 'use-debounce'
import orderService from '../services'
import { InvoiceType, type TaxBusinessInfo } from '../types'
import type { CheckoutFormValues } from '../validations'

interface InvoiceFieldsProps {
  taxBusinessInfo: TaxBusinessInfo | null
  taxBusinessLookupState: 'idle' | 'loading' | 'found' | 'not_found' | 'error'
  onTaxBusinessInfoChange: (info: TaxBusinessInfo | null) => void
  onTaxBusinessLookupStateChange: (state: 'idle' | 'loading' | 'found' | 'not_found' | 'error') => void
}

export function InvoiceFields({
  taxBusinessInfo,
  taxBusinessLookupState,
  onTaxBusinessInfoChange,
  onTaxBusinessLookupStateChange
}: InvoiceFieldsProps) {
  const { t } = useTranslation()
  const { control, setValue, watch } = useFormContext<CheckoutFormValues>()

  const taxCodeForm = watch('taxCode')
  const isExportInvoiceForm = watch('isExportInvoice')
  const invoiceTypeForm = watch('invoiceType')

  const [debouncedTaxCode] = useDebounce(taxCodeForm, 500)
  const hasTaxCodeEntered = !!debouncedTaxCode?.trim()

  useEffect(() => {
    const taxCode = debouncedTaxCode?.trim() ?? ''

    if (!taxCode) {
      onTaxBusinessInfoChange(null)
      onTaxBusinessLookupStateChange('idle')
      return
    }

    let cancelled = false

    onTaxBusinessLookupStateChange('loading')

    orderService
      .lookupTaxCode({ taxCode })
      .then((businessInfo) => {
        if (cancelled) return
        onTaxBusinessInfoChange(businessInfo)
        onTaxBusinessLookupStateChange(businessInfo ? 'found' : 'not_found')
      })
      .catch(() => {
        if (cancelled) return
        onTaxBusinessInfoChange(null)
        onTaxBusinessLookupStateChange('error')
      })

    return () => {
      cancelled = true
    }
  }, [debouncedTaxCode, onTaxBusinessInfoChange, onTaxBusinessLookupStateChange])

  return (
    <FieldGroup className='gap-2'>
      <Controller
        name='isExportInvoice'
        control={control}
        render={({ field }) => (
          <Field orientation='horizontal'>
            <FieldLabel htmlFor={field.name} className='cursor-pointer text-sm font-medium'>
              {t('orders.checkout.isExportInvoice')}
            </FieldLabel>

            <Switch
              id={field.name}
              checked={field.value ?? false}
              onCheckedChange={(checked) => {
                field.onChange(checked)
                if (checked) {
                  setValue('invoiceType', InvoiceType.Personal, { shouldDirty: true })
                  return
                }
                setValue('invoiceType', null, { shouldDirty: true })
                setValue('taxCode', null, { shouldDirty: true })
                setValue('identityNumber', null, { shouldDirty: true })
                setValue('receiptFullName', null, { shouldDirty: true })
                setValue('receiptPhoneNumber', null, { shouldDirty: true })
                setValue('receiptAddress', null, { shouldDirty: true })
                setValue('receiptEmail', null, { shouldDirty: true })
              }}
            />
          </Field>
        )}
      />

      {isExportInvoiceForm ? (
        <div className='mt-4 space-y-3'>
          <Controller
            name='invoiceType'
            control={control}
            render={({ field }) => (
              <Tabs value={field.value ?? ''} onValueChange={field.onChange}>
                <TabsList className='w-full'>
                  <TabsTrigger value={InvoiceType.Personal}>{t('orders.checkout.invoiceTypePersonal')}</TabsTrigger>
                  <TabsTrigger value={InvoiceType.Business}>{t('orders.checkout.invoiceTypeBusiness')}</TabsTrigger>
                </TabsList>
              </Tabs>
            )}
          />

          {invoiceTypeForm === InvoiceType.Business ? (
            <Controller
              name='taxCode'
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className='gap-1'>
                  <FieldLabel htmlFor={field.name}>{t('orders.checkout.taxCodeLabel')}</FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ''}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    autoComplete='off'
                    spellCheck={false}
                    placeholder={t('orders.checkout.taxCodePlaceholder')}
                  />

                  {hasTaxCodeEntered ? (
                    <div className='rounded-2xl border border-border/60 bg-muted/30 px-3 py-2 text-sm mt-2'>
                      {taxBusinessLookupState === 'loading' ? (
                        <p className='text-muted-foreground'>{t('orders.checkout.taxBusinessLoading')}</p>
                      ) : taxBusinessLookupState === 'found' && taxBusinessInfo ? (
                        <div className='grid gap-1'>
                          <p>
                            <span className='text-muted-foreground'>{t('orders.checkout.taxBusinessId')}:</span>{' '}
                            <span className='font-medium'>{taxBusinessInfo.id}</span>
                          </p>
                          <p>
                            <span className='text-muted-foreground'>{t('orders.checkout.taxBusinessName')}:</span>{' '}
                            <span className='font-medium'>{taxBusinessInfo.name}</span>
                          </p>
                          <p className='min-w-0 whitespace-normal wrap-break-words'>
                            <span className='text-muted-foreground'>{t('orders.checkout.taxBusinessAddress')}:</span>{' '}
                            <span className='font-medium'>{taxBusinessInfo.address}</span>
                          </p>
                        </div>
                      ) : taxBusinessLookupState === 'error' ? (
                        <p className='text-destructive'>{t('orders.checkout.taxBusinessLookupError')}</p>
                      ) : taxBusinessLookupState === 'not_found' ? (
                        <p className='text-muted-foreground'>{t('orders.checkout.taxBusinessNotFound')}</p>
                      ) : null}
                    </div>
                  ) : null}

                  <div className='min-h-4'>
                    {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                  </div>
                </Field>
              )}
            />
          ) : (
            <Controller
              name='identityNumber'
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className='gap-1'>
                  <FieldLabel htmlFor={field.name}>{t('orders.checkout.identityNumber')}</FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ''}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    autoComplete='off'
                    spellCheck={false}
                  />
                  <div className='min-h-4'>
                    {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                  </div>
                </Field>
              )}
            />
          )}

          {invoiceTypeForm === InvoiceType.Personal ? (
            <Controller
              name='receiptFullName'
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className='gap-1'>
                  <FieldLabel htmlFor={field.name}>{t('orders.checkout.receiptFullName')}</FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ''}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    autoComplete='name'
                  />
                  <div className='min-h-4'>
                    {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                  </div>
                </Field>
              )}
            />
          ) : null}

          <Controller
            name='receiptEmail'
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className='gap-1'>
                <FieldLabel htmlFor={field.name}>{t('orders.checkout.receiptEmail')}</FieldLabel>
                <Input
                  {...field}
                  value={field.value ?? ''}
                  id={field.name}
                  type='email'
                  inputMode='email'
                  aria-invalid={fieldState.invalid}
                  autoComplete='email'
                />
                <div className='min-h-4'>
                  {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                </div>
              </Field>
            )}
          />

          <Controller
            name='receiptPhoneNumber'
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className='gap-1'>
                <FieldLabel htmlFor={field.name}>{t('orders.checkout.receiptPhoneNumber')}</FieldLabel>
                <Input
                  {...field}
                  value={field.value ?? ''}
                  id={field.name}
                  type='tel'
                  inputMode='tel'
                  aria-invalid={fieldState.invalid}
                  autoComplete='tel'
                />
                <div className='min-h-4'>
                  {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                </div>
              </Field>
            )}
          />

          {invoiceTypeForm === InvoiceType.Personal ? (
            <Controller
              name='receiptAddress'
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className='gap-1'>
                  <FieldLabel htmlFor={field.name}>{t('orders.checkout.receiptAddress')}</FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ''}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    autoComplete='street-address'
                  />
                  <div className='min-h-4'>
                    {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                  </div>
                </Field>
              )}
            />
          ) : null}
        </div>
      ) : null}
    </FieldGroup>
  )
}
