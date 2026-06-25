'use client'

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Call02Icon, Location04Icon, Mail02Icon, TimeZoneIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import Image from 'next/image'
import { useGetMe } from '../hooks/use-get-me'
import { useGetUser } from '../hooks/use-get-user'

function InfoRow({ icon, value, placeholder }: { icon: IconSvgElement; value: string | null; placeholder: string }) {
  return (
    <div className='flex items-start gap-2.5'>
      <span className='mt-0.5 shrink-0 text-muted-foreground'>
        <HugeiconsIcon icon={icon} size={15} strokeWidth={1.5} />
      </span>
      <span className={value ? 'text-sm text-foreground' : 'text-sm italic text-muted-foreground/60'}>
        {value ?? placeholder}
      </span>
    </div>
  )
}

interface ProfileCardProps {
  userId?: string
}

export function ProfileCard({ userId }: ProfileCardProps) {
  const { t } = useTranslation()
  const { me } = useGetMe()
  const { user, isLoading } = useGetUser(userId ?? me?.id)

  const fullName = user ? `${user.lastName} ${user.firstName}`.trim() : ''
  const initials = user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase() : ''
  const address = [user?.address, user?.city, user?.state].filter(Boolean).join(', ') || null
  const timeZone = user?.timeZone || null

  return (
    <div className='overflow-hidden'>
      {/* Cover image */}
      <div className='relative h-36 w-full bg-linear-to-br bg-accent-foreground via-accent-foreground to-accent-foreground'>
        {user?.coverImageUrl && (
          <Image src={user.coverImageUrl} alt='' fill className='object-cover' unoptimized />
        )}

        {/* Avatar */}
        <div className='absolute -bottom-10 left-6'>
          <div className='relative size-20 overflow-hidden rounded-full border-4 border-popover bg-muted'>
            {isLoading ? (
              <Skeleton className='size-full rounded-full' />
            ) : user?.avatar ? (
              <Image src={user.avatar} alt={fullName} fill className='object-cover' unoptimized />
            ) : (
              <span className='flex size-full items-center justify-center bg-green-100 text-xl font-semibold text-primary'>
                {initials}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='px-6 pb-6 pt-14'>
        {isLoading ? (
          <div className='space-y-2'>
            <Skeleton className='h-6 w-40' />
            <Skeleton className='h-4 w-24' />
          </div>
        ) : (
          <>
            <h2 className='font-heading text-xl font-bold leading-tight'>{fullName}</h2>
            <p className='mt-0.5 text-sm text-muted-foreground'>{user?.role}</p>
          </>
        )}

        <div className='mt-5 space-y-3 border-t pt-5'>
          {isLoading ? (
            <>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-3/4' />
              <Skeleton className='h-4 w-5/6' />
            </>
          ) : (
            <>
              <InfoRow icon={Mail02Icon} value={user?.email ?? null} placeholder={t('profile.notProvided')} />
              <InfoRow icon={Call02Icon} value={user?.phoneNumber ?? null} placeholder={t('profile.notProvided')} />
              <InfoRow icon={Location04Icon} value={address} placeholder={t('profile.notProvided')} />
              <InfoRow icon={TimeZoneIcon} value={timeZone} placeholder={t('profile.notProvided')} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

interface ProfileDialogProps {
  children: React.ReactNode
  userId?: string
}

export function ProfileDialog({ children, userId }: ProfileDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='gap-0 overflow-hidden p-0 sm:max-w-sm' showCloseButton>
        <ProfileCard userId={userId} />
      </DialogContent>
    </Dialog>
  )
}
