'use client'

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar'
import { useGetMe } from '@/features/auth/hooks/use-get-me'
import * as React from 'react'
import { BranchSwitcher } from './branch-switcher'
import { NavMain } from './nav-main'
import { NavQuickActions } from './nav-quick-actions'
import { NavUser } from './nav-user'
import { navMain, projects, teams } from './sidebar-data'

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { me } = useGetMe()

  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader>
        <BranchSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavQuickActions projects={projects} />
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>{me ? <NavUser user={me} /> : null}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
