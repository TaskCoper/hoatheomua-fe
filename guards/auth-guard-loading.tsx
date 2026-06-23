import logo from '@/public/images/logo.png'
import Image from 'next/image'

export default function AuthGuardLoading() {
  return (
    <div className='flex min-h-svh items-center justify-center'>
      <Image src={logo} alt='Hoa Theo Mùa' priority className='h-32 w-auto' />
    </div>
  )
}
