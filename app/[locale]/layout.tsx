import { Toaster } from '@/components/ui/sonner'
import { routing } from '@/lib/i18n/routing'
import ReactQueryProvider from '@/lib/react-query'
import type { Metadata } from 'next'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { Be_Vietnam_Pro, Playfair_Display } from 'next/font/google'
import { notFound } from 'next/navigation'

import '../globals.css'

const beVietnamPro = Be_Vietnam_Pro({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-sans'
})

const playfairDisplay = Playfair_Display({
  weight: ['400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  variable: '--font-title'
})

export const metadata: Metadata = {
  title: 'Hoa Theo Mùa',
  description: 'Hoa Theo Mùa'
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
    <html lang={locale} className={`${beVietnamPro.variable} ${playfairDisplay.variable} font-sans h-full antialiased`}>
      <body className='min-h-full flex flex-col'>
        <NextIntlClientProvider>
          <ReactQueryProvider>
            {children}
            {modal}
            <Toaster position='top-center' duration={2000} />
          </ReactQueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
