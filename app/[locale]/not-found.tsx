import { FallingPetals } from '@/components/falling-petals'
import { Button } from '@/components/ui/button'
import { Link } from '@/lib/i18n/navigation'
import logo from '@/public/images/logo.png'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('notFound')

  return {
    title: t('metaTitle'),
    robots: { index: false, follow: false }
  }
}

export default async function NotFoundPage() {
  const t = await getTranslations('notFound')

  return (
    <div className='relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6 py-20 text-center'>
      <FallingPetals />

      <Link
        href='/'
        aria-label='Hoa Theo Mùa'
        className='absolute top-8 left-1/2 -translate-x-1/2 transition-opacity hover:opacity-80'
      >
        <Image src={logo} alt='Hoa Theo Mùa' width={56} height={56} priority />
      </Link>

      <div className='relative z-10 mx-auto max-w-2xl space-y-6'>
        <p className='font-title text-[120px] sm:text-[180px] font-bold leading-none text-primary'>{t('code')}</p>

        <h1 className='font-title text-3xl sm:text-4xl font-bold text-foreground'>{t('title')}</h1>

        <p className='mx-auto max-w-xl text-base sm:text-lg leading-relaxed text-muted-foreground'>
          {t('description')}
        </p>

        <div className='flex flex-col justify-center gap-3 pt-4 sm:flex-row'>
          <Button asChild size='lg'>
            <Link href='/'>{t('goHome')}</Link>
          </Button>

          <Button asChild size='lg' variant='outline'>
            <Link href='/products'>{t('browseProducts')}</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
