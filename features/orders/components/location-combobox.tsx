'use client'

import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/shared/utils'
import { ArrowDown01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'

export interface LocationComboboxProps {
  id: string
  value: string
  onChange: (value: string) => void
  options: { label: string; value: string }[]
  placeholder: string
  searchPlaceholder: string
  emptyMessage: string
  disabled?: boolean
  invalid?: boolean
}

export function LocationCombobox({
  id,
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  disabled,
  invalid
}: LocationComboboxProps) {
  const [open, setOpen] = useState(false)
  const selected = options.find((option) => option.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type='button'
          variant='outline'
          role='combobox'
          aria-expanded={open}
          aria-invalid={invalid}
          disabled={disabled}
          className={cn('w-full justify-between font-normal', !selected && 'text-muted-foreground')}
        >
          <span className='truncate'>{selected?.label ?? placeholder}</span>
          <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} className='ml-2 size-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align='start'
        sideOffset={8}
        className='max-h-[calc(var(--radix-popover-content-available-height)-8px)] w-(--radix-popover-trigger-width) overflow-y-auto p-0'
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <Command className='w-full'>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  data-checked={value === option.value}
                  onSelect={() => {
                    onChange(option.value === value ? '' : option.value)
                    setOpen(false)
                  }}
                >
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
