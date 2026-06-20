'use client'

import { useTranslation } from '@/lib/i18n/dictionary-provider'
import Image from 'next/image'

const CONTACT_CHANNELS = [
  {
    key: 'zalo',
    href: 'https://zalo.me/hoatheomua',
    src: 'https://hoatheomua.net/wp-content/uploads/2025/06/icon-web-4-1.webp',
    labelKey: 'floatingContact.zalo'
  },
  {
    key: 'messenger',
    href: 'https://www.facebook.com/messages/t/Hoatheomua.tana',
    src: 'https://hoatheomua.net/wp-content/uploads/2025/06/icon-web-1-1.webp',
    labelKey: 'floatingContact.messenger'
  }
] as const

export default function FloatingContact() {
  const { t } = useTranslation()

  return (
    <div className='pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6'>
      {CONTACT_CHANNELS.map((channel) => {
        const label = t(channel.labelKey)
        return (
          <a
            key={channel.key}
            href={channel.href}
            target='_blank'
            rel='noopener noreferrer'
            aria-label={label}
            title={label}
            className='pointer-events-auto group relative flex size-12 items-center justify-center rounded-full bg-card shadow-lg ring-1 ring-foreground/10 transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-xl sm:size-14'
          >
            <Image
              src={channel.src}
              alt=''
              width={56}
              height={56}
              aria-hidden='true'
              className='size-8 object-contain transition-transform duration-300 group-hover:scale-110 sm:size-10'
            />
          </a>
        )
      })}
    </div>
  )
}
