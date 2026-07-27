'use client'

import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Field, FieldError as FieldErrorComponent, FieldLabel } from '@/components/ui/field'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/shared/utils'
import { ArrowUpDownIcon, Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import * as React from 'react'
import { type Control, Controller, type FieldError, type FieldValues, type Path, useFormContext } from 'react-hook-form'

export interface Option {
  label: string
  value: string
  meta?: Record<string, unknown>
}

interface MultiSelectFieldProps<T extends FieldValues> {
  name?: Path<T>
  label?: string
  control?: Control<T>
  options: Option[]
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  disabled?: boolean
  className?: string
  modal?: boolean
  isRequired?: boolean
  value?: string[]
  onValueChange?: (value: string[]) => void
  displayError?: boolean
  triggerClassName?: string
  /** Render the specific look of an option in the list (defaults to its label). */
  renderOption?: (option: Option) => React.ReactNode
  /** Trigger text once one or more options are selected (defaults to `"{n} selected"`). */
  selectedText?: (count: number) => string
}

export default function MultiSelectField<T extends FieldValues>({
  name,
  label,
  control: propsControl,
  options,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  emptyMessage = 'No results found.',
  disabled = false,
  className,
  modal = false,
  isRequired = false,
  displayError = true,
  value: propsValue,
  onValueChange,
  triggerClassName,
  renderOption,
  selectedText = (count) => `${count} selected`
}: MultiSelectFieldProps<T>) {
  const [open, setOpen] = React.useState(false)

  const context = useFormContext<T>()
  const control = propsControl || context?.control
  const isStandalone = propsValue !== undefined && onValueChange !== undefined

  if (!control && !isStandalone) {
    throw new Error(
      'MultiSelectField must be used within a FormProvider, passed a control prop, or used in standalone mode with value and onValueChange'
    )
  }

  const renderContent = (
    fieldValues: string[],
    fieldOnChange: (value: string[]) => void,
    fieldInvalid?: boolean,
    fieldError?: FieldError,
    fieldName?: string
  ) => {
    const selectedIds = new Set(fieldValues)

    const handleSelect = (option: Option) => {
      const next = selectedIds.has(option.value)
        ? fieldValues.filter((v) => v !== option.value)
        : [...fieldValues, option.value]
      fieldOnChange(next)
    }

    const buttonText = fieldValues.length === 0 ? placeholder : selectedText(fieldValues.length)

    const TriggerButton = (
      <Button
        variant='outline'
        role='combobox'
        aria-expanded={open}
        aria-invalid={fieldInvalid}
        disabled={disabled}
        className={cn(
          'w-full justify-between px-3 font-normal',
          fieldValues.length === 0 && 'text-muted-foreground',
          fieldInvalid && 'border-destructive focus-visible:ring-destructive',
          triggerClassName
        )}
      >
        <span className='flex items-center gap-2 truncate'>
          <HugeiconsIcon icon={Search01Icon} className='h-4 w-4 shrink-0 opacity-50' strokeWidth={2} />
          {buttonText}
        </span>
        <HugeiconsIcon icon={ArrowUpDownIcon} className='ml-2 h-4 w-4 shrink-0 opacity-50' strokeWidth={2} />
      </Button>
    )

    return (
      <Field data-invalid={fieldInvalid} className={cn('flex flex-col gap-1', className)}>
        {label ? (
          <FieldLabel htmlFor={fieldName} className='gap-0.5'>
            {label}
            {isRequired ? <span className='text-destructive font-semibold'>*</span> : null}
          </FieldLabel>
        ) : null}

        <Popover open={open} onOpenChange={setOpen} modal={modal}>
          <PopoverTrigger asChild>{TriggerButton}</PopoverTrigger>
          <PopoverContent
            sideOffset={8}
            className='p-0 overflow-y-auto'
            style={{ width: 'var(--radix-popover-trigger-width)' }}
            align='start'
          >
            <MultiOptionList
              options={options}
              selectedIds={selectedIds}
              onSelect={handleSelect}
              searchPlaceholder={searchPlaceholder}
              emptyMessage={emptyMessage}
              renderOption={renderOption}
            />
          </PopoverContent>
        </Popover>

        {displayError ? (
          <div className='min-h-4'>
            {fieldInvalid && fieldError && <FieldErrorComponent className='text-xs' errors={[fieldError]} />}
          </div>
        ) : null}
      </Field>
    )
  }

  if (isStandalone) {
    return renderContent(propsValue, onValueChange)
  }

  return (
    <Controller
      name={name as Path<T>}
      control={control}
      render={({ field, fieldState }) =>
        renderContent(
          (Array.isArray(field.value) ? field.value : []) as string[],
          field.onChange,
          fieldState.invalid,
          fieldState.error,
          field.name
        )
      }
    />
  )
}

function MultiOptionList({
  options,
  selectedIds,
  onSelect,
  searchPlaceholder,
  emptyMessage,
  renderOption
}: {
  options: Option[]
  selectedIds: Set<string>
  onSelect: (option: Option) => void
  searchPlaceholder: string
  emptyMessage: string
  renderOption?: (option: Option) => React.ReactNode
}) {
  const [query, setQuery] = React.useState('')
  const deferredQuery = React.useDeferredValue(query)

  const filteredOptions = React.useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase()
    if (!normalizedQuery) return options

    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(normalizedQuery) || option.value.toLowerCase().includes(normalizedQuery)
    )
  }, [options, deferredQuery])

  return (
    <Command shouldFilter={false} className='w-full'>
      <CommandInput placeholder={searchPlaceholder} value={query} onValueChange={setQuery} className='h-9' />
      <CommandList>
        {filteredOptions.length === 0 ? (
          <CommandEmpty>{emptyMessage}</CommandEmpty>
        ) : (
          <CommandGroup>
            {filteredOptions.map((option) => {
              const isSelected = selectedIds.has(option.value)
              return (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => onSelect(option)}
                  data-checked={isSelected}
                  className='cursor-pointer gap-3'
                >
                  <div className='flex flex-1 items-center gap-2 overflow-hidden'>
                    {renderOption ? renderOption(option) : option.label}
                  </div>
                </CommandItem>
              )
            })}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  )
}
