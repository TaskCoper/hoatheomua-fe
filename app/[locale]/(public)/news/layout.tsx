// import RoleGuard from '@/features/auth/components/role-guard'
// import { ROLES } from '@/features/auth/utils'

// export default function ProtectedUserLayout({ children }: { children: React.ReactNode }) {
//   return <RoleGuard allowedRoles={[ROLES.User]}>{children}</RoleGuard>
// }
import RoleGuard from '@/features/auth/components/role-guard'
import { ROLES } from '@/features/auth/utils'
import pedalsRight from '@/public/images/pedals-right.png'
import Image from 'next/image'
import Footer from '../_components/footer'
import Header from '../_components/header'

export default function ProtectedUserLayout({ children }: { children: React.ReactNode }) {
  return (
    // Sử dụng cấu hình linh hoạt: Cho phép Anonymous ở tầng bọc ngoài cùng của User
    // Các trang con bên trong nếu cần bảo mật nghiêm ngặt (như products)
    // sẽ tự bọc thêm RoleGuard riêng hoặc check ở tầng middleware/page.
    <RoleGuard allowedRoles={[ROLES.User]} allowAnonymous>
      <div className='relative flex min-h-full flex-1 flex-col bg-background'>
        <Image
          src={pedalsRight}
          alt='Cánh hoa phải'
          className='wind-wiggle-right absolute -right-1.5 top-0 hidden h-52 w-auto lg:block'
        />

        <Header />

        <main className='flex-1'>{children}</main>

        <Footer />
      </div>
    </RoleGuard>
  )
}
