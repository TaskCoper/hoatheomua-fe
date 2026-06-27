"use client"

import * as React from "react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { HugeiconsIcon } from "@hugeicons/react"
import { NotificationIcon, Menu09Icon, HomeIcon, PaintBoardIcon, MessageIcon, Globe02Icon, KeyboardIcon, Tick02Icon, RecordIcon, LinkIcon, ShieldIcon, SettingsIcon } from "@hugeicons/core-free-icons"

const data = {
  nav: [
    {
      name: "Notifications",
      icon: (
        <HugeiconsIcon icon={NotificationIcon} strokeWidth={2} />
      ),
    },
    {
      name: "Navigation",
      icon: (
        <HugeiconsIcon icon={Menu09Icon} strokeWidth={2} />
      ),
    },
    {
      name: "Home",
      icon: (
        <HugeiconsIcon icon={HomeIcon} strokeWidth={2} />
      ),
    },
    {
      name: "Appearance",
      icon: (
        <HugeiconsIcon icon={PaintBoardIcon} strokeWidth={2} />
      ),
    },
    {
      name: "Messages & media",
      icon: (
        <HugeiconsIcon icon={MessageIcon} strokeWidth={2} />
      ),
    },
    {
      name: "Language & region",
      icon: (
        <HugeiconsIcon icon={Globe02Icon} strokeWidth={2} />
      ),
    },
    {
      name: "Accessibility",
      icon: (
        <HugeiconsIcon icon={KeyboardIcon} strokeWidth={2} />
      ),
    },
    {
      name: "Mark as read",
      icon: (
        <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} />
      ),
    },
    {
      name: "Audio & video",
      icon: (
        <HugeiconsIcon icon={RecordIcon} strokeWidth={2} />
      ),
    },
    {
      name: "Connected accounts",
      icon: (
        <HugeiconsIcon icon={LinkIcon} strokeWidth={2} />
      ),
    },
    {
      name: "Privacy & visibility",
      icon: (
        <HugeiconsIcon icon={ShieldIcon} strokeWidth={2} />
      ),
    },
    {
      name: "Advanced",
      icon: (
        <HugeiconsIcon icon={SettingsIcon} strokeWidth={2} />
      ),
    },
  ],
}

export function SettingsDialog() {
  const [open, setOpen] = React.useState(true)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Open Dialog</Button>
      </DialogTrigger>
      <DialogContent className="overflow-hidden p-0 md:max-h-[500px] md:max-w-[700px] lg:max-w-[800px]">
        <DialogTitle className="sr-only">Settings</DialogTitle>
        <DialogDescription className="sr-only">
          Customize your settings here.
        </DialogDescription>
        <SidebarProvider className="items-start">
          <Sidebar collapsible="none" className="hidden md:flex">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {data.nav.map((item) => (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton
                          asChild
                          isActive={item.name === "Messages & media"}
                        >
                          <a href="#">
                            {item.icon}
                            <span>{item.name}</span>
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <main className="flex h-[480px] flex-1 flex-col overflow-hidden">
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="#">Settings</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Messages & media</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-video max-w-3xl rounded-xl bg-muted/50"
                />
              ))}
            </div>
          </main>
        </SidebarProvider>
      </DialogContent>
    </Dialog>
  )
}
