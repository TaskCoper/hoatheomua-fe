'use client'

import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command'
import { InputGroup, InputGroupAddon } from '@/components/ui/input-group'
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover'
import { Spinner } from '@/components/ui/spinner'
import { SearchIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Command as CommandPrimitive } from 'cmdk'
import { useRef, useState } from 'react'
import { useDebounce } from 'use-debounce'
import { useAddressAutocomplete } from '../hooks/use-address-autocomplete'
import { useResolveGeocodePlace } from '../hooks/use-resolve-geocode-place'
import type { GeocodeSuggestion } from '../types'

interface AddressAutocompleteProps {
  id?: string
  label: string
  value: string
  onValueChange: (value: string) => void
  onResolve: (result: { latitude: number; longitude: number; mapId: string; ward: string; city: string }) => void
  onClear: () => void
  ward: string
  city: string
  placeholder: string
  searchingLabel: string
  emptyLabel: string
  disabled?: boolean
  invalid?: boolean
}

export function AddressAutocomplete({
  id,
  label,
  value,
  onValueChange,
  onResolve,
  onClear,
  ward,
  city,
  placeholder,
  searchingLabel,
  emptyLabel,
  disabled,
  invalid
}: AddressAutocompleteProps) {
  const [open, setOpen] = useState(false)
  const lastSelectedRef = useRef<string | null>(null)

  const [debouncedText] = useDebounce(value, 300)

  const { suggestions, isSearchingAddress } = useAddressAutocomplete({
    text: debouncedText,
    ward,
    city,
    enabled: !disabled && open
  })

  const { resolveGeocodePlace } = useResolveGeocodePlace()

  const handleValueChange = (nextValue: string) => {
    onValueChange(nextValue)
    setOpen(nextValue.trim().length >= 2)
    if (nextValue !== lastSelectedRef.current) {
      onClear()
    }
  }

  const handleSelect = async (suggestion: GeocodeSuggestion) => {
    // Keep only the street/POI portion in the address line - the ward and city
    // are lifted into their own selectors via onResolve below.
    const addressLine = suggestion.name || suggestion.display
    lastSelectedRef.current = addressLine
    onValueChange(addressLine)
    setOpen(false)

    const { result } = await resolveGeocodePlace({ refId: suggestion.refId })
    if (result) {
      onResolve({
        latitude: result.latitude,
        longitude: result.longitude,
        mapId: suggestion.refId,
        ward: result.ward,
        city: result.city
      })
    }
  }

  return (
    <Command label={label} shouldFilter={false} className='overflow-visible bg-transparent p-0'>
      <Popover open={open && !disabled} onOpenChange={setOpen} modal>
        <PopoverAnchor asChild>
          <InputGroup className='h-9 bg-input/50'>
            <CommandPrimitive.Input
              data-slot='command-input'
              id={id}
              value={value}
              onValueChange={handleValueChange}
              onFocus={() => setOpen(!disabled && value.trim().length >= 2)}
              placeholder={placeholder}
              disabled={disabled}
              aria-invalid={invalid}
              autoComplete='off'
              spellCheck={false}
              className='w-full text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50'
            />
            <InputGroupAddon>
              <HugeiconsIcon icon={SearchIcon} strokeWidth={2} className='size-4 shrink-0 opacity-50' />
            </InputGroupAddon>
          </InputGroup>
        </PopoverAnchor>
        <PopoverContent
          align='start'
          sideOffset={8}
          className='w-(--radix-popover-trigger-width) overflow-hidden p-0'
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <CommandList>
            {isSearchingAddress ? (
              <div className='flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground'>
                <Spinner className='size-4' />
                {searchingLabel}
              </div>
            ) : (
              <>
                <CommandEmpty>{emptyLabel}</CommandEmpty>
                <CommandGroup>
                  {suggestions.map((suggestion) => (
                    <CommandItem
                      key={suggestion.refId}
                      value={suggestion.refId}
                      onSelect={() => handleSelect(suggestion)}
                    >
                      <div className='flex min-w-0 flex-col'>
                        <span className='truncate font-medium'>{suggestion.name || suggestion.display}</span>
                        {suggestion.address ? (
                          <span className='truncate text-xs text-muted-foreground'>{suggestion.address}</span>
                        ) : null}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </PopoverContent>
      </Popover>
    </Command>
  )
}
