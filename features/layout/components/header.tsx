import NavShell from '@/features/layout/components/nav-shell'

export default function Header() {
  return (
    <>
      <NavShell />
      <div aria-hidden='true' className='h-16 sm:h-[4.5rem] lg:h-20' />
    </>
  )
}
