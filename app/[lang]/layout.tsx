import type { Metadata } from 'next'
import { Be_Vietnam_Pro } from 'next/font/google'
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
  return (
    <html lang={lang} className={`${beVietnamPro.className} h-full antialiased`}>
      <body className='min-h-full flex flex-col'>{children}</body>
    </html>
  )
}
