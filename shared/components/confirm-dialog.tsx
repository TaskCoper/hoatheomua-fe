'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { useConfirmStore } from '@/stores/confirm.store'

/** Mounted once in the layout; everything else reaches it through `useConfirmStore().confirm`. */
export default function ConfirmDialog() {
  const { t } = useTranslation()
  const isOpen = useConfirmStore((state) => state.isOpen)
  const options = useConfirmStore((state) => state.options)
  const handleConfirm = useConfirmStore((state) => state.handleConfirm)
  const handleCancel = useConfirmStore((state) => state.handleCancel)

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{options.title ?? t('common.confirm.title')}</AlertDialogTitle>
          <AlertDialogDescription>{options.description ?? t('common.confirm.description')}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>
            {options.cancelText ?? t('common.confirm.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction variant={options.variant ?? 'default'} onClick={handleConfirm}>
            {options.confirmText ?? t('common.confirm.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
