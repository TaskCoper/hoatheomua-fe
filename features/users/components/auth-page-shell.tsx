import { Link } from '@/lib/i18n/navigation'
import type { Locale } from '@/lib/i18n/routing'
import logo from '@/public/images/logo.png'
import { ArrowLeft02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

interface AuthPageShellProps {
  locale: Locale
  children: React.ReactNode
  className?: string
}

export default async function AuthPageShell({ locale, children, className }: AuthPageShellProps) {
  const t = await getTranslations({ locale, namespace: 'common.ui' })

  return (
    <main className='flex min-h-svh flex-col items-center justify-center gap-20 px-4 py-10'>
      <Link href='/' className='transition-opacity hover:opacity-80'>
        <Image src={logo} alt='Hoa Theo Mùa' width={96} height={96} priority />
      </Link>

      {children}

      <Link
        href='/'
        className='group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground'
      >
        <HugeiconsIcon icon={ArrowLeft02Icon} className='size-4 transition-transform group-hover:-translate-x-0.5' />
        {t('backToHome')}
      </Link>
    </main>
  )
}
