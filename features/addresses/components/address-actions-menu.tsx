'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { CheckmarkCircle02Icon, Delete02Icon, MoreVerticalIcon, PencilEdit02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useSetDefaultAddress } from '../hooks/use-set-default-address'
import type { Address } from '../types'
import { AddressDeleteDialog } from './address-delete-dialog'
import { AddressFormDialog } from './address-form-dialog'

interface AddressActionsMenuProps {
  address: Address
}

export function AddressActionsMenu({ address }: AddressActionsMenuProps) {
  const { t } = useTranslation()
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const { setDefaultAddress, isSettingDefaultAddress } = useSetDefaultAddress()

  const handleSetDefault = async () => {
    try {
      await setDefaultAddress(address.id)
      toast.success(t('profile.addressDefaultSet'))
    } catch (error) {
      toast.error(t('error.somethingWentWrong'), {
        description: error instanceof Error ? error.message : undefined
      })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon-sm' className='rounded-full'>
          <HugeiconsIcon icon={MoreVerticalIcon} strokeWidth={2} />
          <span className='sr-only'>{t('common.ui.more')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='min-w-52'>
        <DropdownMenuItem onSelect={(event) => event.preventDefault()} onClick={() => setIsEditOpen(true)}>
          <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={1.5} />
          {t('profile.editAddress')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSetDefault} disabled={address.isDefault || isSettingDefaultAddress}>
          <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={1.5} />
          {address.isDefault ? t('profile.defaultAddress') : t('profile.setDefaultAddress')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant='destructive'
          onSelect={(event) => event.preventDefault()}
          onClick={() => setIsDeleteOpen(true)}
        >
          <HugeiconsIcon icon={Delete02Icon} strokeWidth={1.5} />
          {t('profile.deleteAddress')}
        </DropdownMenuItem>
      </DropdownMenuContent>
      <AddressFormDialog addressId={address.id} address={address} open={isEditOpen} onOpenChange={setIsEditOpen} />
      <AddressDeleteDialog
        addressId={address.id}
        receiverName={address.receiverName}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
      />
    </DropdownMenu>
  )
}
