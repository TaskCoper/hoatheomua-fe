'use client'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useDateFormat } from '@/lib/date'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import type { I18nKey } from '@/lib/i18n/types'
import { cn } from '@/shared/utils'
import { Calendar03Icon, CancelCircleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'
import type { Matcher } from 'react-day-picker'
import { type Control, Controller, type FieldValues, type Path, useFormContext } from 'react-hook-form'

interface DateConstraints {
  minDate?: Date
  maxDate?: Date
  disabled?: Matcher | Matcher[]
}

interface DatePickerFieldProps<T extends FieldValues> extends DateConstraints {
  name: Path<T>
  label: I18nKey
  control?: Control<T>
  onValueChange?: (value: string | null) => void
  placeholder?: I18nKey
  isRequired?: boolean
  isDisabled?: boolean
  className?: string
  displayError?: boolean
  showOptionalHint?: boolean
  emptyValueDate?: Date
}

export function DatePickerField<T extends FieldValues>({
  name,
  label,
  control: propsControl,
  onValueChange,
  placeholder = 'common.ui.selectDate',
  isRequired = false,
  isDisabled = false,
  className,
  displayError = true,
  showOptionalHint = true,
  emptyValueDate,
  minDate = new Date('1900-01-01'),
  maxDate = new Date(new Date().getFullYear() + 10, 11, 31),
  disabled
}: DatePickerFieldProps<T>) {
  const { t } = useTranslation()
  const { formatDate } = useDateFormat()
  const [open, setOpen] = useState(false)

  const context = useFormContext<T>()
  const control = propsControl || context?.control

  if (!control) {
    throw new Error('DatePickerField must be used within a FormProvider or passed a control prop')
  }

  const disabledDays: Matcher[] = [
    ...(Array.isArray(disabled) ? disabled : disabled ? [disabled] : []),
    { before: minDate },
    { after: maxDate }
  ]

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const displayDate = field.value ? new Date(field.value) : emptyValueDate

        return (
          <Field data-invalid={fieldState.invalid} className={cn('gap-1', className)}>
            <FieldLabel htmlFor={field.name} className='gap-0.5'>
              {t(label)}
              {isRequired ? (
                <span className='font-semibold text-destructive'>*</span>
              ) : showOptionalHint ? (
                <span className='text-xs text-muted-foreground'>({t('common.ui.optional')})</span>
              ) : null}
            </FieldLabel>

            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  id={field.name}
                  variant='outline'
                  role='combobox'
                  aria-expanded={open}
                  aria-invalid={fieldState.invalid}
                  disabled={isDisabled}
                  className={cn(
                    'w-full justify-between px-3 text-left font-normal',
                    !displayDate && 'text-muted-foreground',
                    fieldState.invalid && 'border-destructive focus-visible:ring-destructive'
                  )}
                >
                  <span className='flex items-center gap-2 truncate'>
                    <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} className='size-4 opacity-50' />
                    {displayDate ? formatDate(displayDate, 'dateLong') : <span>{t(placeholder)}</span>}
                  </span>

                  {field.value && !isDisabled && (
                    <div
                      role='button'
                      tabIndex={0}
                      className='cursor-pointer rounded-sm hover:bg-accent hover:text-accent-foreground'
                      onClick={(e) => {
                        e.stopPropagation()
                        field.onChange(null)
                        onValueChange?.(null)
                      }}
                    >
                      <HugeiconsIcon
                        icon={CancelCircleIcon}
                        strokeWidth={2}
                        className='size-4 opacity-50 hover:opacity-100'
                      />
                      <span className='sr-only'>{t('common.button.clear')}</span>
                    </div>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                sideOffset={8}
                className='max-h-[calc(var(--radix-popover-content-available-height)-8px)] w-auto overflow-y-auto p-0'
                align='start'
              >
                <Calendar
                  mode='single'
                  selected={displayDate}
                  onSelect={(date) => {
                    const newValue = date?.toISOString() ?? null
                    field.onChange(newValue)
                    onValueChange?.(newValue)
                    setOpen(false)
                  }}
                  disabled={disabledDays}
                  startMonth={minDate}
                  endMonth={maxDate}
                  captionLayout='dropdown'
                  defaultMonth={displayDate ?? new Date()}
                />
              </PopoverContent>
            </Popover>

            {displayError && (
              <div className='min-h-4'>
                {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
              </div>
            )}
          </Field>
        )
      }}
    />
  )
}
