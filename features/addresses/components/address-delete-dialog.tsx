'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { toast } from 'sonner'
import { useDeleteAddress } from '../hooks/use-delete-address'

interface AddressDeleteDialogProps {
  addressId: string
  receiverName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddressDeleteDialog({ addressId, receiverName, open, onOpenChange }: AddressDeleteDialogProps) {
  const { t } = useTranslation()
  const { deleteAddress, isDeletingAddress } = useDeleteAddress()

  const handleDelete = async () => {
    try {
      await deleteAddress(addressId)
      toast.success(t('profile.addressDeleted'))
      onOpenChange(false)
    } catch (error) {
      toast.error(t('error.somethingWentWrong'), {
        description: error instanceof Error ? error.message : undefined,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent position='top-center' className='sm:max-w-md' showCloseButton>
        <DialogHeader>
          <DialogTitle>{t('profile.confirmDeleteAddress')}</DialogTitle>
          <DialogDescription>
            {t('profile.confirmDeleteAddressDescription', { receiverName })}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className='mt-2' showCloseButton={false}>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)} disabled={isDeletingAddress}>
            {t('common.button.cancel')}
          </Button>
          <Button type='button' variant='destructive' onClick={handleDelete} disabled={isDeletingAddress}>
            {isDeletingAddress ? <Spinner /> : null}
            {t('profile.deleteAddress')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
