import { Spinner } from '@/components/ui/spinner'
import AccountPage from '@/features/users/components/account-page'
import { Suspense } from 'react'

interface UserAccountPageProps {
  params: Promise<{ slug: string }>
}

export default async function UserAccountPage({ params }: UserAccountPageProps) {
  const { slug } = await params

  return (
    <Suspense
      fallback={
        <div className='flex h-screen w-full items-center justify-center'>
          <Spinner className='size-8 text-muted-foreground' />
        </div>
      }
    >
      <AccountPage slug={slug} />
    </Suspense>
  )
}
