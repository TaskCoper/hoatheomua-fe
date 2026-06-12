'use client'

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar'
import { MoreHorizontalCircle01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'

export function NavQuickActions({
  projects
}: {
  projects: {
    name: string
    url: string
    icon: React.ReactNode
  }[]
}) {
  return (
    <SidebarGroup className='group-data-[collapsible=icon]:hidden'>
      <SidebarGroupLabel>Thao tác nhanh</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
              <Link href={item.url}>
                {item.icon}
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton className='text-sidebar-foreground/70'>
            <HugeiconsIcon icon={MoreHorizontalCircle01Icon} strokeWidth={2} className='text-sidebar-foreground/70' />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
