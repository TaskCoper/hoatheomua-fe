'use client'

import { Button } from '@/components/ui/button'
import { availableOf, useProductVariant } from '@/features/products/components/product-variant-context'
import type { ProductDetail } from '@/features/products/types'
import { useAccountPhoneNumber } from '@/features/users/hooks/use-account-phone-number'
import { useGetMe } from '@/features/users/hooks/use-get-me'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { formatVnd } from '@/lib/currency'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link, usePathname, useRouter } from '@/lib/i18n/navigation'
import { cn } from '@/shared/utils'
import { buildLineId, MAX_QUANTITY, useCartStore, type CartItem } from '@/stores/cart.store'
import { useCheckoutIntentStore } from '@/stores/checkout-intent.store'
import { FlashIcon, MinusSignIcon, PlusSignIcon, ShoppingBasket02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion } from 'motion/react'
import { useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

function variantLabel(child: ProductDetail): string {
  const name = child.productName?.trim()
  if (name) return name
  const parts = [child.size, child.color].filter((part): part is string => Boolean(part && part.trim()))
  if (parts.length) return parts.join(' · ')
  return child.productCode?.trim() || child.id
}

export default function ProductPurchaseBox() {
  const { t } = useTranslation()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isAuthenticated, isGettingMe, me } = useGetMe()

  const addItem = useCartStore((state) => state.addItem)
  const setCheckoutIntent = useCheckoutIntentStore((state) => state.setIntent)

  const { product, variants, hasVariants, selectedId, selected, setSelectedId } = useProductVariant()

  const productId = selected.id
  const productName = selected.productName ?? product.productName ?? ''
  const available = availableOf(selected)
  const retail = selected.price ?? 0
  const oldPrice = selected.oldPrice ?? 0
  const inStock = available > 0

  const [quantity, setQuantity] = useState(1)

  const mounted = useHasMounted()

  const hasDiscount = oldPrice > retail
  const discountPercent = hasDiscount ? Math.round(((oldPrice - retail) / oldPrice) * 100) : 0

  const selectedOptions = useMemo<Record<string, string>>(() => ({}), [])
  const targetLineId = useMemo(() => buildLineId(productId, null, selectedOptions), [productId, selectedOptions])

  const inCartQuantity = useCartStore(
    (state) => state.items.find((item) => item.lineId === targetLineId)?.quantity ?? 0
  )

  const isVerified = !!me?.isEmailVerified
  const isQualifiedBuyer = mounted && isAuthenticated && isVerified
  const remainingStock = Math.max(0, Math.min(available, MAX_QUANTITY) - inCartQuantity)
  const hasRoomInCart = remainingStock > 0
  const canAdd = isQualifiedBuyer && inStock && hasRoomInCart
  const isPurchaseDisabled = !mounted || isGettingMe || !inStock || (isQualifiedBuyer && !hasRoomInCart)

  const { slug: mySlug, hasPhoneNumber, isLoading: isLoadingPhoneNumber } = useAccountPhoneNumber()

  const isPhoneMissing = isQualifiedBuyer && !isLoadingPhoneNumber && !hasPhoneNumber
  const isBuyNowDisabled = isPurchaseDisabled || isPhoneMissing

  const stepperCap = Math.max(remainingStock, 1)
  const effectiveQuantity = Math.min(Math.max(quantity, 1), stepperCap)

  const decrement = () => setQuantity(Math.max(1, effectiveQuantity - 1))
  const increment = () => setQuantity(Math.min(stepperCap, effectiveQuantity + 1))

  const guardPurchase = () => {
    if (isGettingMe) return false

    if (!isAuthenticated) {
      const queryString = searchParams.toString()
      const from = `${pathname}${queryString ? `?${queryString}` : ''}`
      router.push(`/sign-in?from=${encodeURIComponent(from)}`)
      return false
    }

    if (!isVerified) {
      const verifyParams = me?.email ? `?${new URLSearchParams({ email: me.email }).toString()}` : ''
      router.push(`/verify-sent${verifyParams}`)
      return false
    }

    return inStock && hasRoomInCart
  }

  const handleAddToCart = () => {
    if (!guardPurchase()) return

    addItem({
      productId,
      variantId: null,
      quantity: effectiveQuantity,
      selectedOptions
    })

    toast.success(t('products.detail.purchase.addedToCart'), { description: productName })
  }

  const buyNowItem = useMemo<CartItem>(() => {
    const now = new Date().toISOString()
    return {
      lineId: targetLineId,
      productId,
      variantId: null,
      quantity: effectiveQuantity,
      selectedOptions,
      addedAt: now,
      updatedAt: now
    }
  }, [targetLineId, productId, effectiveQuantity, selectedOptions])

  const handleBuyNow = () => {
    if (!guardPurchase()) return
    if (!hasPhoneNumber) {
      toast.error(t('orders.checkout.contactMissing'))
      return
    }
    setCheckoutIntent([buyNowItem], 'buy-now')
    router.push('/checkout')
  }

  return (
    <div
      data-testid='purchase-box'
      className='space-y-5 rounded-3xl bg-card px-4 py-5 shadow-[0_0.8rem_2rem_rgb(81_108_108/10%)] ring-1 ring-foreground/5'
    >
      <div className='grid gap-4'>
        {hasVariants ? (
          <div className='space-y-2'>
            <p className='text-sm font-semibold text-muted-foreground'>{t('products.detail.purchase.variant')}</p>
            <div className='flex flex-wrap gap-2'>
              {variants.map((child) => {
                const isSelected = child.id === selectedId
                const soldOut = availableOf(child) <= 0
                return (
                  <button
                    key={child.id}
                    type='button'
                    onClick={() => setSelectedId(child.id)}
                    aria-pressed={isSelected}
                    className={cn(
                      'cursor-pointer rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-foreground/10 bg-secondary/20 text-secondary-foreground hover:border-primary/40',
                      soldOut && !isSelected && 'opacity-50'
                    )}
                  >
                    {variantLabel(child)}
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}

        <div className='space-y-2'>
          <p className='text-sm font-semibold text-muted-foreground'>{t('products.detail.purchase.quantity')}</p>

          <div className='inline-flex items-center gap-1 rounded-full bg-secondary/20 p-1 ring-1 ring-foreground/10'>
            <Button
              type='button'
              size='icon-sm'
              variant='ghost'
              className='rounded-full'
              onClick={decrement}
              aria-label={t('products.detail.purchase.decreaseQuantity')}
              disabled={!inStock || effectiveQuantity <= 1}
            >
              <HugeiconsIcon icon={MinusSignIcon} className='size-3.5' />
            </Button>
            <span data-testid='purchase-quantity' className='min-w-8 text-center text-sm font-semibold text-primary'>
              {effectiveQuantity}
            </span>
            <Button
              type='button'
              size='icon-sm'
              variant='ghost'
              className='rounded-full'
              onClick={increment}
              aria-label={t('products.detail.purchase.increaseQuantity')}
              disabled={!canAdd || effectiveQuantity >= remainingStock}
            >
              <HugeiconsIcon icon={PlusSignIcon} className='size-3.5' />
            </Button>
          </div>

          {inStock && inCartQuantity > 0 && canAdd ? (
            <p className='text-xs text-muted-foreground'>
              {t('products.detail.purchase.inCartInfo', { inCart: inCartQuantity, remaining: remainingStock })}
            </p>
          ) : null}
          {inStock && isQualifiedBuyer && !hasRoomInCart ? (
            <p className='text-xs text-rose-500'>{t('products.detail.purchase.stockLimit')}</p>
          ) : null}
          {!inStock ? <p className='text-xs text-rose-500'>{t('products.detail.purchase.outOfStock')}</p> : null}
        </div>

        <div className='space-y-1'>
          <p className='text-sm font-semibold text-muted-foreground'>{t('products.detail.purchase.priceLabel')}</p>
          <div className='flex items-baseline gap-2'>
            <motion.span
              key={retail}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className='font-title text-4xl font-bold text-primary'
            >
              {formatVnd(retail)}
            </motion.span>
            {hasDiscount ? (
              <span className='text-sm text-muted-foreground line-through'>{formatVnd(oldPrice)}</span>
            ) : null}
          </div>
          {hasDiscount ? (
            <p className='text-xs font-semibold text-rose-500'>
              {t('products.detail.purchase.savings', { percent: discountPercent })}
            </p>
          ) : null}
        </div>
      </div>

      <div className='flex flex-wrap items-center gap-3'>
        <motion.div
          whileHover={isPurchaseDisabled ? undefined : { y: -3, scale: 1.03 }}
          whileTap={isPurchaseDisabled ? undefined : { scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 320, damping: 14 }}
          className='min-w-40 flex-1'
        >
          <Button type='button' size='lg' disabled={isPurchaseDisabled} className='w-full' onClick={handleAddToCart}>
            <HugeiconsIcon icon={ShoppingBasket02Icon} />
            {t('products.detail.purchase.addToCart')}
          </Button>
        </motion.div>

        <motion.div
          whileHover={isBuyNowDisabled ? undefined : { y: -3, scale: 1.03 }}
          whileTap={isBuyNowDisabled ? undefined : { scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 320, damping: 14 }}
          className='min-w-32 flex-1'
        >
          <Button
            type='button'
            size='lg'
            variant='secondary'
            className='w-full'
            disabled={isBuyNowDisabled}
            onClick={handleBuyNow}
          >
            <HugeiconsIcon icon={FlashIcon} />
            {t('products.detail.purchase.buyNow')}
          </Button>
        </motion.div>

        {isPhoneMissing && mySlug ? (
          <div className='flex w-full items-center justify-between gap-3 rounded-xl bg-destructive/10 px-3.5 py-2.5'>
            <p className='text-xs text-destructive'>{t('orders.checkout.contactMissing')}</p>
            <Button asChild type='button' variant='outline' size='sm' className='shrink-0'>
              <Link href={`/users/${mySlug}`}>{t('profile.editPersonalInfo')}</Link>
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
