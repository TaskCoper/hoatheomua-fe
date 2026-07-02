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
    <header className='relative isolate min-h-[18rem] w-full overflow-hidden bg-background sm:min-h-[26rem] lg:min-h-[36rem]'>
      <iframe
        title='Hoa Theo Mua home video'
        src={video}
        allow='autoplay; encrypted-media; picture-in-picture'
        referrerPolicy='strict-origin-when-cross-origin'
        className='pointer-events-none absolute left-1/2 top-1/2 z-0 h-[56.25vw] min-h-full w-[177.7778vh] min-w-full -translate-x-1/2 -translate-y-1/2 border-0'
      />
      <div className='pointer-events-none absolute inset-0 z-0 bg-foreground/10' aria-hidden='true' />

      <div className='relative z-10 mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8'>
        <NavBar />
      </div>
    </header>
  )
}
