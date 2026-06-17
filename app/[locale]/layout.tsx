import { Toaster } from '@/components/ui/sonner'
import { routing } from '@/lib/i18n/routing'
import ReactQueryProvider from '@/lib/react-query'
import type { Metadata } from 'next'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { Be_Vietnam_Pro, Playfair_Display } from 'next/font/google'
import { notFound } from 'next/navigation'
import { NuqsAdapter } from 'nuqs/adapters/next/app'

import '../globals.css'

const beVietnamPro = Be_Vietnam_Pro({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-sans',
  preload: true
})

const playfairDisplay = Playfair_Display({
  weight: ['600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-title',
  preload: false
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hoatheomua.net'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Hoa Theo Mùa — Hoa tươi cao cấp, giao tận nơi trong 2 giờ tại TP.HCM',
    template: '%s | Hoa Theo Mùa'
  },
  description:
    'Hoa Theo Mùa — Hệ thống hoa tươi online tại TP. Hồ Chí Minh, chuyên cung cấp hoa tươi cao cấp và giao hoa tận nơi siêu nhanh trong 2 giờ.',
  applicationName: 'Hoa Theo Mùa',
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  formatDetection: { telephone: true, address: true, email: true },
  icons: { icon: '/favicon.ico' },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1
    }
  }
}

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function RootLayout({
  children,
  modal,
  params
}: {
  children: React.ReactNode
  modal: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)

  return (
    <html
      lang={locale}
      className={`${beVietnamPro.variable} ${playfairDisplay.variable} font-sans h-full antialiased`}
    >
      <body className='min-h-full flex flex-col'>
        <NuqsAdapter>
          <NextIntlClientProvider>
            <ReactQueryProvider>
              {children}
              {modal}
              <Toaster position='top-center' duration={2000} />
            </ReactQueryProvider>
          </NextIntlClientProvider>
        </NuqsAdapter>
      </body>
    </html>
  )
}
