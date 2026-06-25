'use client'

import { Button } from '@/components/ui/button'
import { ProfileDialog } from '@/features/users/components/profile-dialog'
import { useGetMe } from '@/features/users/hooks/use-get-me'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { User03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

export default function AccountPage() {
  const { t } = useTranslation()
  const { me } = useGetMe()

  return (
    <div className='flex min-h-[60vh] flex-col items-center justify-center gap-4'>
      <ProfileDialog>
        <Button variant='outline' size='lg' className='gap-2.5'>
          <HugeiconsIcon icon={User03Icon} size={18} strokeWidth={1.5} />
          {t('profile.viewProfile')}
        </Button>
      </ProfileDialog>
      {me && (
        <p className='text-sm text-muted-foreground'>
          {me.firstName} {me.lastName}
        </p>
      )}
    </div>
  )
}
