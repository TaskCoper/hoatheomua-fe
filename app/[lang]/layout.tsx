import { DictionaryProvider } from '@/lib/i18n/dictionary-provider'
import type { Metadata } from 'next'
import { Be_Vietnam_Pro } from 'next/font/google'
import { notFound } from 'next/navigation'
import { getDictionary, hasLocale } from './dictionaries'

import '../globals.css'

const beVietnamPro = Be_Vietnam_Pro({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: 'Hoa Theo Mùa',
  description: 'Hoa Theo Mùa'
}

export async function generateStaticParams() {
  return [{ lang: 'vi' }, { lang: 'en' }]
}

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!hasLocale(lang)) {
    notFound()
  }

  const dictionary = await getDictionary(lang)

  return (
    <html lang={lang} className={`${beVietnamPro.className} h-full antialiased`}>
      <body className='min-h-full flex flex-col'>
        <DictionaryProvider locale={lang} dictionary={dictionary}>
          {children}
        </DictionaryProvider>
      </body>
    </html>
  )
}
