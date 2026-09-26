'use client'

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/shared/utils'
import { useId } from 'react'

export interface CardOptionChoice<Value extends string> {
  value: Value
  label: string
  hint?: string
}

interface CardOptionPickerProps<Value extends string> {
  label: string
  value: Value
  options: CardOptionChoice<Value>[]
  onChange: (value: Value) => void
  className?: string
}

export default function CardOptionPicker<Value extends string>({
  label,
  value,
  options,
  onChange,
  className
}: CardOptionPickerProps<Value>) {
  const groupId = useId()

  return (
    <div className={cn('space-y-1.5', className)}>
      <p className='text-sm font-medium'>{label}</p>

      <RadioGroup
        value={value}
        onValueChange={(next) => onChange(next as Value)}
        className={cn('gap-2', options.length > 2 ? 'grid-cols-3' : 'grid-cols-2')}
        aria-label={label}
      >
        {options.map((option) => {
          const isActive = option.value === value
          const id = `${groupId}-${option.value}`

          return (
            <label
              key={option.value}
              htmlFor={id}
              className={cn(
                'flex cursor-pointer flex-col gap-0.5 rounded-xl border bg-background/60 px-2.5 py-2 transition-colors',
                isActive
                  ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/30'
                  : 'border-border/60 hover:bg-muted/40'
              )}
            >
              <span className='flex min-w-0 items-center gap-2'>
                <RadioGroupItem id={id} value={option.value} className='size-3.5' />
                <span className='min-w-0 truncate text-sm font-medium'>{option.label}</span>
              </span>
              <span
                className={cn(
                  'truncate pl-5.5 text-xs font-medium tabular-nums',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {/* Kept even when empty so every tile in the row is the same height. */}
                {option.hint ?? ' '}
              </span>
            </label>
          )
        })}
      </RadioGroup>
    </div>
  )
}
