'use client'

import { useGetPublicConfigs } from '@/hooks/use-get-public-configs'
import { CompanyConfigItem } from '@/types/config.type'
import NavBar from './nav-bar'

export default function HomeHeader() {
  const { configs: companyConfigs } = useGetPublicConfigs<CompanyConfigItem, 'company.bg_video'>({
    group: 'company',
    key: 'company.bg_video'
  })
  const video = companyConfigs[0]?.value.value

  return (
    <header className='relative isolate aspect-[64/27] w-full overflow-hidden bg-background'>
      <video
        src={video}
        autoPlay
        muted
        loop
        playsInline
        preload='auto'
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 h-full w-full object-cover'
      />
      <div className='pointer-events-none absolute inset-0 z-0 bg-foreground/10' aria-hidden='true' />

      <div className='absolute inset-x-0 top-0 z-10 mx-auto w-full max-w-7xl p-2 sm:p-4 lg:p-6'>
        <NavBar />
      </div>
    </header>
  )
}
