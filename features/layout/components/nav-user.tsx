'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useSignOut } from '@/features/users/hooks/use-sign-out'
import { Me } from '@/features/users/types'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link, usePathname, useRouter } from '@/lib/i18n/navigation'
import { routing } from '@/lib/i18n/routing'
import { getAvatarFallback } from '@/shared/utils'
import { GlobalIcon, Logout03Icon, UserCircle02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useQueryClient } from '@tanstack/react-query'

interface NavUserProps {
  user?: Me | null
}

export default function NavUser({ user }: NavUserProps) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const pathname = usePathname()
  const { t, locale } = useTranslation()

  const { signOut, isSigningOut } = useSignOut()

  const handleLanguageChange = (value: string) => {
    const nextLocale = value as (typeof routing.locales)[number]
    router.replace(pathname, { locale: nextLocale })
    queryClient.invalidateQueries()
  }

  if (!user) {
    return (
      <div className='flex items-center gap-2'>
        <Button asChild variant='ghost' size='sm'>
          <Link href='/sign-in'>{t('auth.signIn.label')}</Link>
        </Button>

        <Button asChild size='sm'>
          <Link href='/sign-up'>{t('auth.signUp.label')}</Link>
        </Button>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar className='size-7 ring-2 ring-primary ring-offset-1 rounded-full cursor-pointer mr-0.5'>
          <AvatarImage src={user?.avatar || undefined} alt={user?.email} />
          <AvatarFallback className='rounded-full text-xs'>
            {getAvatarFallback(`${user?.firstName} ${user?.lastName}`)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className='w-(--radix-dropdown-menu-trigger-width) min-w-60 mt-1'
        side='bottom'
        align='end'
        sideOffset={8}
      >
        <DropdownMenuLabel className='px-3 font-normal'>
          <div className='flex items-center gap-3 text-left text-sm'>
            <Avatar className='size-6 border ring-primary ring-offset-2 ring-2 rounded-full'>
              <AvatarImage src={user?.avatar || undefined} alt={user?.email} />
              <AvatarFallback className='rounded-lg text-xs'>
                {getAvatarFallback(`${user?.firstName} ${user?.lastName}`)}
              </AvatarFallback>
            </Avatar>
            <div className='grid flex-1 text-left text-sm leading-tight'>
              <span className='truncate font-medium'>
                {user?.firstName} {user?.lastName}
              </span>
              <span className='truncate text-xs'>{user?.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className='px-2 py-1.5 cursor-pointer'
            disabled={!user?.isEmailVerified}
            onSelect={() => router.push(`/users/${user?.slug}`)}
          >
            <HugeiconsIcon icon={UserCircle02Icon} className='shrink-0 size-4.5' />
            {t('account.account')}
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className='px-2 py-1.5 cursor-pointer'>
              <HugeiconsIcon icon={GlobalIcon} className='shrink-0 size-4.5' />
              {t('account.language')}
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup value={locale} onValueChange={handleLanguageChange}>
                  <DropdownMenuRadioItem className='cursor-pointer' value='en'>
                    {t('language.english')}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem className='cursor-pointer' value='vi'>
                    {t('language.vietnamese')}
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className='px-2 py-1.5 cursor-pointer' onClick={() => signOut()} disabled={isSigningOut}>
          <HugeiconsIcon icon={Logout03Icon} className='shrink-0 size-4.5' />
          {t('account.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
