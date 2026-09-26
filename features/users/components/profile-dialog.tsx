'use client'

import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { profileDialogContentProps, ProfileSheetBody } from './profile-sheet'

interface ProfileDialogProps {
  children: React.ReactNode
  slug?: string
}

export function ProfileDialog({ children, slug }: ProfileDialogProps) {
  const { t } = useTranslation()

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent {...profileDialogContentProps} showCloseButton>
        <DialogTitle className='sr-only'>{t('profile.title')}</DialogTitle>
        <DialogDescription className='sr-only'>{t('profile.title')}</DialogDescription>
        <ProfileSheetBody slug={slug} />
      </DialogContent>
    </Dialog>
  )
}
