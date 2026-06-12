'use client'

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar'
import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { usePathname } from '@/lib/i18n/navigation'
import * as React from 'react'
import { BranchSwitcher } from './branch-switcher'
import { NavMain } from './nav-main'
import { NavUser } from './nav-user'
import { navMain, teams } from './sidebar-data'

type ActiveRouteConfig = {
  url: string
  activePatterns?: string[]
  activeExcludePatterns?: string[]
}

const escapeRegExp = (value: string) => value.replace(/[.+?^${}()|[\]\\]/g, '\\$&')

const matchesPattern = (pattern: string, pathname: string, end: boolean) => {
  if (pattern === '#') {
    return false
  }

  const source = pattern
    .split('/')
    .map((segment) => {
      if (segment === '*') {
        return '.*'
      }

      if (segment.startsWith(':')) {
        return '[^/]+'
      }

      return escapeRegExp(segment)
    })
    .join('/')

  const regex = new RegExp(`^${source}${end ? '$' : '(?:/|$)'}`)

  return regex.test(pathname)
}

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { me } = useGetMe()
  const pathname = usePathname()

  const isItemActive = React.useCallback(
    (item: ActiveRouteConfig) => {
      const patterns = item.activePatterns?.length ? item.activePatterns : [item.url]
      const excludes = item.activeExcludePatterns ?? []

      const isExcluded = excludes.some((pattern) => matchesPattern(pattern, pathname, false))
      if (isExcluded) {
        return false
      }

      return patterns.some((pattern) => matchesPattern(pattern, pathname, true))
    },
    [pathname]
  )

  const navItems = React.useMemo(
    () =>
      navMain.map((item) => {
        const subItems = item.items?.map((subItem) => ({
          ...subItem,
          isActive: isItemActive(subItem)
        }))
        const isOpen = subItems?.some((subItem) => subItem.isActive) || false
        const url = item.url === '#' ? subItems?.[0]?.url || item.url : item.url

        return {
          ...item,
          url,
          isActive: isItemActive(item),
          isOpen,
          items: subItems
        }
      }),
    [isItemActive]
  )

  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader>
        <BranchSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        {/* <NavQuickActions projects={projects} /> */}
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>{me ? <NavUser user={me} /> : null}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
