'use client'

import { usePathname } from '@/lib/i18n/navigation'
import Header from './header'
import HomeHeader from './home-header'

const normalizePublicPathname = (pathname: string) => pathname.replace(/^\/(vi|en)(?=\/|$)/, '') || '/'

export default function PublicHeader() {
  const pathname = usePathname()
  const normalizedPathname = normalizePublicPathname(pathname)

  if (normalizedPathname === '/') {
    return <HomeHeader />
  }

  return <Header />
}
