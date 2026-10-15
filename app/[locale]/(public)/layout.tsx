import { getCompanyBgMusic } from '@/features/company/queries.server'
import FloatingContactClient from '@/features/layout/components/floating-contact-client'
import Footer from '@/features/layout/components/footer'
import PublicHeader from '@/features/layout/components/public-header'
import PromotionalPopupClient from '@/features/promotions/components/promotional-popup-client'
import { getPublicConfigsGroup } from '@/features/public-configs/queries.server'
import PendingActionReplayer from '@/features/users/components/pending-action-replayer'
import RoleGuard from '@/guards/role-guard'
import { ROLES } from '@/guards/utils'
import { getQueryClient } from '@/lib/react-query-client'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()

  const [homeMusicSrc] = await Promise.all([
    getCompanyBgMusic(),
    queryClient.prefetchQuery({
      queryKey: ['configs', 'content', 'contact', undefined],
      queryFn: () => getPublicConfigsGroup('contact')
    }),
    queryClient.prefetchQuery({
      queryKey: ['configs', 'content', 'banners', 'banners.collection'],
      queryFn: () => getPublicConfigsGroup('banners', 'banners.collection')
    })
  ])

  return (
    <RoleGuard allowedRoles={[ROLES.Customer]} allowAnonymous>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <div className='flex min-h-full flex-1 flex-col bg-background relative'>
          <PublicHeader />

          <main className='flex-1'>{children}</main>

          <Footer />

          <FloatingContactClient musicSrc={homeMusicSrc} />

          <PromotionalPopupClient />

          <PendingActionReplayer />
        </div>
      </HydrationBoundary>
    </RoleGuard>
  )
}
