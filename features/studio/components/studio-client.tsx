'use client'

import { Button } from '@/components/ui/button'
import { productFamilyQuery } from '@/features/products/queries'
import StudioDesigner from '@/features/studio/components/studio-designer'
import StudioSkeleton from '@/features/studio/components/studio-skeleton'
import { Link } from '@/lib/i18n/navigation'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'

export default function StudioClient({ productId }: { productId: string }) {
  const t = useTranslations('studio')
  const { data: family, isPending, isError } = useQuery(productFamilyQuery(productId))

  if (isPending) return <StudioSkeleton label={t('loading')} />

  if (isError || !family?.parent)
    return (
      <div className='flex min-h-dvh w-full flex-col items-center justify-center gap-3 bg-background px-6 text-center'>
        <h1 className='text-pretty font-title text-2xl font-bold leading-tight text-primary'>{t('unavailable')}</h1>
        <p className='max-w-md text-xs leading-relaxed text-muted-foreground'>{t('unavailableNote')}</p>
        <Button asChild size='lg' className='mt-2'>
          <Link href='/products'>{t('backToProducts')}</Link>
        </Button>
      </div>
    )

  return <StudioDesigner family={family} />
}
