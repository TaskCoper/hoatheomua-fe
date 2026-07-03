import { getCompanyBgVideo } from '@/features/company/queries.server'
import RoleGuard from '@/guards/role-guard'
import { ROLES } from '@/guards/utils'
import FloatingContact from './_components/floating-contact'
import Footer from './_components/footer'
import PublicHeader from './_components/public-header'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const homeVideoSrc = await getCompanyBgVideo()

  return (
    <RoleGuard allowedRoles={[ROLES.Customer]} allowAnonymous>
      <div className='flex min-h-full flex-1 flex-col bg-background relative'>
        {/* <Image
          src={pedalsRight}
          alt=''
          aria-hidden='true'
          className='wind-wiggle-right absolute -right-1.5 top-0 h-52 w-auto hidden lg:block'
        /> */}

        <PublicHeader homeVideoSrc={homeVideoSrc} />

        <main className='flex-1'>{children}</main>

        <Footer />

        <FloatingContact />
      </div>
    </RoleGuard>
  )
}
