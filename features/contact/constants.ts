import { InstagramIcon, Location01Icon, Mail01Icon, PhoneCheckIcon } from '@hugeicons/core-free-icons'

export const contactLinks = [
  { icon: InstagramIcon, labelKey: 'contact.links.instagram', valueKey: 'contact.links.instagramValue', href: '#' },
  {
    icon: Mail01Icon,
    labelKey: 'contact.links.email',
    valueKey: 'contact.links.emailValue',
    href: 'mailto:hello@hoatheomua.vn'
  },
  {
    icon: PhoneCheckIcon,
    labelKey: 'contact.links.phone',
    valueKey: 'contact.links.phoneValue',
    href: 'tel:+84901234567'
  },
  { icon: Location01Icon, labelKey: 'contact.links.address', valueKey: 'contact.links.addressValue', href: '#' }
] as const
