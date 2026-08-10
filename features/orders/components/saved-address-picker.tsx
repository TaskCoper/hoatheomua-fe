'use client'

import { Badge } from '@/components/ui/badge'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { Address } from '@/features/addresses/types'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Location01Icon } from '@hugeicons/core-free-icons'
import { useState } from 'react'
import { PartyCardButton } from './party-card'

interface SavedAddressPickerProps {
  addresses: Address[]
  selectedAddress: Address | null
  onSelect: (id: string) => void
}

const formatAddressLine = (address: Address) =>
  [address.addressLine, address.ward, address.city].filter(Boolean).join(', ')

export function SavedAddressPicker({ addresses, selectedAddress, onSelect }: SavedAddressPickerProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <PartyCardButton
          role='combobox'
          aria-expanded={open}
          aria-label={t('orders.checkout.savedAddressPlaceholder')}
          icon={Location01Icon}
          title={selectedAddress?.receiverName}
          lines={selectedAddress ? [selectedAddress.phoneNumber, formatAddressLine(selectedAddress)] : []}
          badge={
            selectedAddress?.isDefault ? <Badge variant='secondary'>{t('orders.checkout.addressDefault')}</Badge> : null
          }
          emptyHint={t('orders.checkout.savedAddressPlaceholder')}
          selected={Boolean(selectedAddress)}
        />
      </PopoverTrigger>

      <PopoverContent
        align='start'
        sideOffset={8}
        className='max-h-[calc(var(--radix-popover-content-available-height)-8px)] w-(--radix-popover-trigger-width) overflow-y-auto p-0'
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <Command className='w-full'>
          <CommandInput placeholder={t('orders.checkout.savedAddressSearchPlaceholder')} />
          <CommandList>
            <CommandEmpty>{t('orders.checkout.comboboxEmpty')}</CommandEmpty>
            <CommandGroup>
              {addresses.map((address) => (
                <CommandItem
                  key={address.id}
                  // Searchable text: the receiver and the address read as one string.
                  value={`${address.receiverName} ${address.phoneNumber} ${formatAddressLine(address)}`}
                  data-checked={address.id === selectedAddress?.id}
                  className='items-start gap-3'
                  onSelect={() => {
                    onSelect(address.id)
                    setOpen(false)
                  }}
                >
                  <div className='min-w-0 flex-1 space-y-0.5'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <span className='truncate text-sm font-medium'>{address.receiverName}</span>
                      {address.isDefault ? (
                        <Badge variant='secondary'>{t('orders.checkout.addressDefault')}</Badge>
                      ) : null}
                    </div>
                    <p className='text-xs font-normal text-muted-foreground'>{address.phoneNumber}</p>
                    <p className='text-xs font-normal text-muted-foreground'>{formatAddressLine(address)}</p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
