import { AdminSidebar } from '@/app/[locale]/(protected)/(admin)/_components/admin-sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import RoleGuard from '@/features/auth/components/role-guard'
import { ROLES } from '@/features/auth/utils'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={[ROLES.Admin]}>
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <header className='flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12'>
            <div className='flex items-center gap-2 px-4'>
              <SidebarTrigger className='-ml-1' />
              <Separator orientation='vertical' className='mr-2 data-vertical:h-4 data-vertical:self-auto' />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className='hidden md:block'>
                    <BreadcrumbLink href='#'>Build Your Application</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className='hidden md:block' />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>

          {children}
        </SidebarInset>
      </SidebarProvider>
    </RoleGuard>
  )
}
