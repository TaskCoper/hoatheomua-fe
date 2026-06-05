import pedalsRight from '@/public/images/pedals-right.png'
import Image from 'next/image'
import Footer from './_components/footer'
import Header from './_components/header'

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex min-h-full flex-1 flex-col bg-background relative'>
      <Image
        src={pedalsRight}
        alt='Pedals Right'
        className='wind-wiggle-right absolute -right-1.5 top-0 h-52 w-auto hidden lg:block'
      />

      <Header />

      <main className='flex-1'>{children}</main>

      <Footer />
    </div>
  )
}
