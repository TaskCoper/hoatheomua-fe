import { ProfileSheetBody } from '@/features/users/components/profile-sheet'

interface UserProfilePageProps {
  params: Promise<{ slug: string }>
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { slug } = await params

  return (
    <div className='mx-auto w-full max-w-4xl px-4 py-8'>
      <div className='overflow-hidden rounded-3xl border bg-card shadow-[0_0.8rem_2.5rem_rgb(0_0_0/8%)]'>
        <ProfileSheetBody slug={slug} />
      </div>
    </div>
  )
}
