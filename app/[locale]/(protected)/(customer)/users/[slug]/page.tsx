'use client'

import { ProfileSheetBody } from '@/features/users/components/profile-sheet'
import { use } from 'react'

interface UserProfilePageProps {
  params: Promise<{ slug: string }>
}

export default function UserProfilePage({ params }: UserProfilePageProps) {
  const { slug } = use(params)

  return (
    <div className='flex min-h-[60vh] items-center justify-center p-4'>
      <div className='w-full max-w-[84rem] overflow-hidden rounded-[2.5rem] bg-popover shadow-2xl ring-1 ring-foreground/5'>
        <ProfileSheetBody slug={slug} />
      </div>
    </div>
  )
}
