'use client'

import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider
} from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { AddressActionsMenu } from '@/features/addresses/components/address-actions-menu'
import { AddressFormDialog } from '@/features/addresses/components/address-form-dialog'
import { useGetAddresses } from '@/features/addresses/hooks/use-get-addresses'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Add01Icon, Call02Icon, Home01Icon, LockPasswordIcon, Mail02Icon, User03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Image from 'next/image'
import { useState } from 'react'
import { useGetMe } from '../hooks/use-get-me'
import { useGetUser } from '../hooks/use-get-user'
import { ChangePasswordForm } from './change-password-form'
import { PersonalInfoFormInner } from './personal-info-form'

type Section = 'info' | 'address' | 'password'

function AddressContent({ slug }: { slug?: string }) {
  const { t } = useTranslation()
  const { me, isGettingMe } = useGetMe()
  const canViewAddresses = !slug || !me?.slug || slug === me.slug
  const { addresses, isLoading } = useGetAddresses({ enabled: !isGettingMe && canViewAddresses })

  const renderAddAddressTrigger = () => (
    <Button size='sm' className='gap-2 rounded-full'>
      <HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={2} />
      {t('profile.addAddress')}
    </Button>
  )

  if (!canViewAddresses && !isGettingMe) {
    return (
      <div className='flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-muted/20 px-6 py-16 text-center text-muted-foreground'>
        <HugeiconsIcon icon={Home01Icon} size={32} strokeWidth={1.5} />
        <p className='text-sm'>{t('profile.addressPermissionDenied')}</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className='space-y-3'>
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className='h-28 w-full rounded-xl' />
        ))}
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between gap-3'>
        <div>
          <h3 className='text-base font-medium'>{t('profile.addressListTitle')}</h3>
          <p className='text-sm text-muted-foreground'>{t('profile.addressListDescription')}</p>
        </div>
        <AddressFormDialog trigger={renderAddAddressTrigger()} />
      </div>

      {!addresses.length ? (
        <div className='flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed bg-muted/20 py-16 text-muted-foreground'>
          <HugeiconsIcon icon={Home01Icon} size={36} strokeWidth={1.5} />
          <p className='text-sm'>{t('profile.noAddress')}</p>
          <AddressFormDialog trigger={renderAddAddressTrigger()} />
        </div>
      ) : null}

      {addresses.map((addr) => (
        <div key={addr.id} data-testid='address-card' className='rounded-xl border bg-muted/30 p-4'>
          <div className='mb-2 flex items-start justify-between gap-2'>
            <div className='space-y-1'>
              <div className='flex items-center gap-2'>
                <span className='font-medium'>{addr.receiverName}</span>
                {addr.isDefault && (
                  <Badge variant='default' className='text-[10px]'>
                    {t('profile.defaultAddress')}
                  </Badge>
                )}
              </div>
              <p className='text-sm text-muted-foreground'>{addr.phoneNumber}</p>
            </div>
            <AddressActionsMenu address={addr} />
          </div>
          <p className='mt-1 text-sm text-muted-foreground'>
            {[addr.addressLine, addr.ward, addr.city, addr.country].filter(Boolean).join(', ')}
          </p>
        </div>
      ))}
    </div>
  )
}

function PersonalInfoContent({ slug }: { slug?: string }) {
  const { t } = useTranslation()
  const { me } = useGetMe()
  const { user, isLoading } = useGetUser(slug ?? me?.slug)
  const [isEditing, setIsEditing] = useState(false)

  const fullName = user ? `${user.lastName} ${user.firstName}` : ''
  const initials = user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase() : ''

  if (isLoading) {
    return (
      <div className='space-y-3'>
        <div className='relative mb-10 h-24 w-full overflow-hidden rounded-xl'>
          <Skeleton className='h-full w-full' />
          <div className='absolute -bottom-8 left-4'>
            <Skeleton className='size-16 rounded-full' />
          </div>
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className='h-15.5 w-full rounded-lg' />
        ))}
      </div>
    )
  }

  if (!isEditing) {
    return (
      <div className='space-y-4'>
        <div className='relative overflow-hidden rounded-2xl border bg-muted/20'>
          <div className='relative h-28 w-full bg-linear-to-br from-slate-900 to-slate-700'>
            {user?.coverImageUrl && <Image src={user.coverImageUrl} alt='' fill className='object-cover' unoptimized />}
          </div>
          <div className='px-4 pb-4'>
            <div className='-mt-8'>
              <div className='flex items-end gap-3'>
                <div className='relative size-16 shrink-0 overflow-hidden rounded-full border-4 border-popover bg-muted shadow-sm'>
                  {user?.avatar ? (
                    <Image src={user.avatar} alt={fullName} fill className='object-cover' unoptimized />
                  ) : (
                    <span className='flex size-full items-center justify-center bg-green-100 text-xl font-semibold text-primary'>
                      {initials}
                    </span>
                  )}
                </div>
                <div className='translate-y-14 -ml-16 pb-1'>
                  <h3 className='text-lg font-semibold leading-tight'>{fullName || t('profile.notProvided')}</h3>
                  <p className='text-sm text-muted-foreground'>{user?.role}</p>
                </div>
              </div>
              <div className='mt-4 flex justify-end'>
                <Button type='button' variant='outline' size='sm' onClick={() => setIsEditing(true)}>
                  {t('profile.editPersonalInfo')}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className='grid gap-3 md:grid-cols-2'>
          <div className='flex items-start gap-3 rounded-xl border bg-muted/30 p-3.5'>
            <HugeiconsIcon icon={Mail02Icon} className='mt-0.5 size-4 shrink-0 text-muted-foreground' />
            <div className='min-w-0'>
              <p className='text-xs text-muted-foreground'>{t('profile.email')}</p>
              <p className='text-sm'>{user?.email || t('profile.notProvided')}</p>
            </div>
          </div>
          <div className='flex items-start gap-3 rounded-xl border bg-muted/30 p-3.5'>
            <HugeiconsIcon icon={Call02Icon} className='mt-0.5 size-4 shrink-0 text-muted-foreground' />
            <div className='min-w-0'>
              <p className='text-xs text-muted-foreground'>{t('profile.phoneNumber')}</p>
              <p className='text-sm'>{user?.phoneNumber || t('profile.notProvided')}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <div>
        <h3 className='text-base font-medium'>{t('profile.personalInfoTitle')}</h3>
        <p className='text-sm text-muted-foreground'>{t('profile.personalInfoDescription')}</p>
      </div>
      <PersonalInfoFormInner slug={slug} onSuccess={() => setIsEditing(false)} onCancel={() => setIsEditing(false)} />
    </div>
  )
}

function PasswordContent() {
  const { t } = useTranslation()
  return (
    <div className='space-y-4'>
      <div>
        <h3 className='text-base font-medium'>{t('profile.changePasswordTitle')}</h3>
        <p className='text-sm text-muted-foreground'>{t('profile.changePasswordDescription')}</p>
      </div>
      <ChangePasswordForm />
    </div>
  )
}

export const profileDialogContentProps = {
  position: 'top-center' as const,
  className: 'h-fit max-w-none max-h-[calc(100vh-2rem)] overflow-hidden p-0 shadow-2xl',
  style: {
    width: 'min(56rem, calc(100vw - 2rem))',
    maxWidth: 'none',
    borderRadius: '1.5rem'
  }
}

interface ProfileSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  slug?: string
}

export function ProfileSheet({ open, onOpenChange, slug }: ProfileSheetProps) {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent {...profileDialogContentProps} showCloseButton>
        <DialogTitle className='sr-only'>{t('profile.title')}</DialogTitle>
        <DialogDescription className='sr-only'>{t('profile.title')}</DialogDescription>
        <ProfileSheetBody slug={slug} />
      </DialogContent>
    </Dialog>
  )
}

export function ProfileSheetBody({ slug }: { slug?: string }) {
  const { t } = useTranslation()
  const [activeSection, setActiveSection] = useState<Section>('info')

  const sections = [
    { key: 'info' as Section, label: t('profile.tabInfo'), icon: User03Icon },
    { key: 'address' as Section, label: t('profile.tabAddress'), icon: Home01Icon },
    { key: 'password' as Section, label: t('profile.tabPassword'), icon: LockPasswordIcon }
  ]

  const currentLabel = sections.find((s) => s.key === activeSection)?.label

  return (
    <SidebarProvider className='w-full items-start' style={{ minHeight: 0 }}>
      <Sidebar collapsible='none' className='hidden md:flex'>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {sections.map((section) => (
                  <SidebarMenuItem key={section.key}>
                    <SidebarMenuButton
                      isActive={activeSection === section.key}
                      onClick={() => setActiveSection(section.key)}
                    >
                      <HugeiconsIcon icon={section.icon} strokeWidth={1.5} />
                      <span>{section.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <main className='profile-scrollbar flex w-full min-w-0 flex-1 min-h-0 max-h-[calc(100vh-8rem)] flex-col overflow-y-auto'>
        <header className='flex shrink-0 items-center gap-2 border-b px-4 py-3'>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className='hidden md:block'>
                <span className='text-sm text-muted-foreground'>{t('profile.title')}</span>
              </BreadcrumbItem>
              <BreadcrumbSeparator className='hidden md:block' />
              <BreadcrumbItem>
                <BreadcrumbPage>{currentLabel}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className='w-full p-4'>
          {activeSection === 'info' && <PersonalInfoContent slug={slug} />}
          {activeSection === 'address' && <AddressContent slug={slug} />}
          {activeSection === 'password' && <PasswordContent />}
        </div>
      </main>
    </SidebarProvider>
  )
}
