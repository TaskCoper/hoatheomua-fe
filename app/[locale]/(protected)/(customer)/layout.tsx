import Header from '@/features/layout/components/header'
import RoleGuard from '@/guards/role-guard'
import { ROLES } from '@/guards/utils'
import pedalsRight from '@/public/images/pedals-right.png'
import Image from 'next/image'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={[ROLES.Customer]}>
      <div className='relative flex min-h-full flex-1 flex-col bg-background'>
        <div aria-hidden='true' className='pointer-events-none absolute inset-0 overflow-hidden'>
          <Image
            src={pedalsRight}
            alt=''
            className='wind-wiggle-right absolute top-0 -right-1.5 hidden h-52 w-auto lg:block'
          />
        </div>

        <Header />

        <main className='flex-1'>{children}</main>

        {/* <Footer /> */}
      </div>
    </RoleGuard>
  )
}
