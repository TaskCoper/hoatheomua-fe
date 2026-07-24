import Header from '@/features/layout/components/header'
import RoleGuard from '@/guards/role-guard'
import { ROLES } from '@/guards/utils'
import pedalsRight from '@/public/images/pedals-right.png'
import Image from 'next/image'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={[ROLES.Customer]}>
      <div className='flex min-h-full flex-1 flex-col bg-background relative'>
        <Image
          src={pedalsRight}
          alt='Cánh hoa phải'
          className='wind-wiggle-right absolute -right-1.5 top-0 h-52 w-auto hidden lg:block'
        />

        <Header />

        <main className='flex-1'>{children}</main>

        {/* <Footer /> */}
      </div>
    </RoleGuard>
  )
}
