import Header from '../../(public)/_components/header'

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='min-h-screen bg-[#EBF0EC]'>
      <Header />
      <main className='flex-1'>{children}</main>
    </div>
  )
}
