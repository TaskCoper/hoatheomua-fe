import { getCompanyBgVideo } from '@/features/company/queries.server'
import HomeHero from '@/features/home/components/home-hero'

export default async function HomeLayout({ children }: { children: React.ReactNode }) {
  const homeVideoSrc = await getCompanyBgVideo()

  return (
    <>
      <HomeHero videoSrc={homeVideoSrc} />
      {children}
    </>
  )
}
