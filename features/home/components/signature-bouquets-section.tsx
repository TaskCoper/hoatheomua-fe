import { getTranslations } from 'next-intl/server'
import SignatureBouquetsGrid from '@/features/home/components/signature-bouquets-grid'
import { SparkleDivider } from '@/shared/components/sparkle-dividier'

export default async function SignatureBouquetsSection() {
  const t = await getTranslations()

  return (
    <>
      <div className='animate-in fade-in slide-in-from-bottom-4 duration-700 my-4 sm:my-6 md:my-8 lg:my-10 space-y-2 overflow-hidden px-4'>
        <div className='mx-auto w-full max-w-7xl space-y-0.5 sm:space-y-1 md:space-y-1.5 lg:space-y-2'>
          <div className='flex items-center justify-start sm:justify-center gap-3'>
            <SparkleDivider
              className='min-w-0 max-w-96 flex-1 hidden sm:flex'
              iconClassName='sm:size-5 md:size-6 lg:size-7'
              color='#516c6c'
            />

            <h1 className='shrink-0 text-center font-title text-2xl md:text-3xl lg:text-4xl font-bold'>
              {t('home.signatureBouquets.title')}
            </h1>

            <SparkleDivider
              className='min-w-0 max-w-96 flex-1 hidden sm:flex'
              iconClassName='sm:size-5 md:size-6 lg:size-7'
              direction='rtl'
              color='#516c6c'
            />
          </div>

          <p className='leading-relaxed mx-auto max-w-full sm:max-w-140 md:max-w-200 text-left sm:text-center text-xs sm:text-sm text-foreground'>
            {t('home.signatureBouquets.description')}
          </p>
        </div>
      </div>

      <SignatureBouquetsGrid />
    </>
  )
}
