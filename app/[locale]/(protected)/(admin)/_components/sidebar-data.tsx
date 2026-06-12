import logo from '@/public/images/logo.png'
import {
  BookOpen02Icon,
  ComputerTerminalIcon,
  CropIcon,
  MapsIcon,
  PieChartIcon,
  RoboticIcon,
  Settings05Icon
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Image from 'next/image'

export const teams = [
  {
    name: 'Chi nhánh Phú Nhuận',
    logo: <Image src={logo} alt='Chi nhánh Phú Nhuận' width={24} height={24} className='rounded-full' />,
    plan: 'Hoa Theo Mùa'
  }
]

export const navMain = [
  {
    title: 'Playground',
    url: '#',
    icon: <HugeiconsIcon icon={ComputerTerminalIcon} strokeWidth={2} />,
    isActive: true,
    items: [
      { title: 'History', url: '#' },
      { title: 'Starred', url: '#' },
      { title: 'Settings', url: '#' }
    ]
  },
  {
    title: 'Models',
    url: '#',
    icon: <HugeiconsIcon icon={RoboticIcon} strokeWidth={2} />,
    items: [
      { title: 'Genesis', url: '#' },
      { title: 'Explorer', url: '#' },
      { title: 'Quantum', url: '#' }
    ]
  },
  {
    title: 'Documentation',
    url: '#',
    icon: <HugeiconsIcon icon={BookOpen02Icon} strokeWidth={2} />,
    items: [
      { title: 'Introduction', url: '#' },
      { title: 'Get Started', url: '#' },
      { title: 'Tutorials', url: '#' },
      { title: 'Changelog', url: '#' }
    ]
  },
  {
    title: 'Settings',
    url: '#',
    icon: <HugeiconsIcon icon={Settings05Icon} strokeWidth={2} />,
    items: [
      { title: 'General', url: '#' },
      { title: 'Team', url: '#' },
      { title: 'Billing', url: '#' },
      { title: 'Limits', url: '#' }
    ]
  }
]

export const projects = [
  {
    name: 'Design Engineering',
    url: '#',
    icon: <HugeiconsIcon icon={CropIcon} strokeWidth={2} />
  },
  {
    name: 'Sales & Marketing',
    url: '#',
    icon: <HugeiconsIcon icon={PieChartIcon} strokeWidth={2} />
  },
  {
    name: 'Travel',
    url: '#',
    icon: <HugeiconsIcon icon={MapsIcon} strokeWidth={2} />
  }
]
