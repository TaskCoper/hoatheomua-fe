'use client'

import { ProfileCard } from '@/features/users/components/profile-dialog'
import { use } from 'react'

interface UserProfilePageProps {
  params: Promise<{ id: string }>
}

export default function UserProfilePage({ params }: UserProfilePageProps) {
  const { id } = use(params)

  return (
    <div className='flex min-h-[60vh] items-center justify-center p-4'>
      <div className='w-full max-w-sm overflow-hidden rounded-4xl bg-popover shadow-xl ring-1 ring-foreground/5'>
        <ProfileCard userId={id} />
      </div>
    </div>
  )
}
