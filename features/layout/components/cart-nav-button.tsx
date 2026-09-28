'use client'

import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link } from '@/lib/i18n/navigation'
import { cn } from '@/shared/utils'
import { useCartStore } from '@/stores/cart.store'
import { ShoppingBasket03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

export default function CartNavButton({
  className,
  size = 'icon-sm'
}: {
  className?: string
  size?: 'icon-sm' | 'lg'
}) {
  const { t } = useTranslation()
  const hasHydrated = useCartStore((state) => state.hasHydrated)
  const count = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0))

  const showBadge = hasHydrated && count > 0
  const label = showBadge ? t('header.aria.cartCount', { count }) : t('header.aria.openCart')

  return (
    <Button
      asChild
      variant='outline'
      size={size === 'lg' ? 'icon-lg' : 'icon-sm'}
      className={cn('relative border-none ring ring-primary ring-inset', className)}
    >
      <Link href='/cart' aria-label={label}>
        <HugeiconsIcon icon={ShoppingBasket03Icon} />
        {showBadge ? (
          <span
            aria-hidden='true'
            className='absolute -top-1 -right-1 grid min-w-4.5 place-items-center rounded-full bg-primary px-1 text-[0.625rem] leading-4.5 font-bold text-primary-foreground ring-2 ring-background tabular-nums'
          >
            {count > 99 ? '99+' : count}
          </span>
        ) : null}
      </Link>
    </Button>
  )
}
