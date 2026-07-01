'use client'

import { Button } from '@/components/ui/button'
import type { ProductUnit } from '@/features/products/types'
import { useGetMe } from '@/features/users/hooks/use-get-me'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { usePathname, useRouter } from '@/lib/i18n/navigation'
import { buildLineId, MAX_QUANTITY, useCartStore, type CartItem } from '@/stores/cart.store'
import { useCheckoutIntentStore } from '@/stores/checkout-intent.store'
import { FlashIcon, MinusSignIcon, PlusSignIcon, ShoppingBasket02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion } from 'motion/react'
import { useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

const vndFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
})

const formatVnd = (value: number) => vndFormatter.format(value)

export default function ProductPurchaseBox({
  productId,
  variantId: variantIdOverride = null,
  productName,
  available,
  retail,
  oldPrice,
  units
}: {
  productId: number
  variantId?: number | null
  productName: string
  available: number
  retail: number
  oldPrice: number
  units: ProductUnit[]
}) {
  const { t } = useTranslation()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isAuthenticated, isGettingMe, me } = useGetMe()

  const addItem = useCartStore((state) => state.addItem)
  const setCheckoutIntent = useCheckoutIntentStore((state) => state.setIntent)
  const variantOptions = useMemo(() => units.filter((unit) => unit.name && unit.price?.retail > 0), [units])
  const hasVariants = variantOptions.length > 1
  const inStock = available > 0

  const [activeUnitId, setActiveUnitId] = useState<number | null>(hasVariants ? (variantOptions[0]?.id ?? null) : null)
  const [quantity, setQuantity] = useState(1)

  const activeUnit = hasVariants ? (variantOptions.find((unit) => unit.id === activeUnitId) ?? null) : null
  const currentRetail = activeUnit?.price?.retail ?? retail
  const currentOld = activeUnit ? Math.max(oldPrice, activeUnit.price?.retail ?? 0) : oldPrice
  const hasDiscount = currentOld > currentRetail
  const discountPercent = hasDiscount ? Math.round(((currentOld - currentRetail) / currentOld) * 100) : 0

  const variantId = variantIdOverride ?? activeUnit?.id ?? null
  const unitName = activeUnit?.name ?? null
  const selectedOptions = useMemo<Record<string, string>>(() => {
    const opts: Record<string, string> = {}
    if (unitName) opts.unit = unitName
    return opts
  }, [unitName])

  const targetLineId = useMemo(
    () => buildLineId(productId, variantId, selectedOptions),
    [productId, variantId, selectedOptions]
  )

  const inCartQuantity = useCartStore(
    (state) => state.items.find((item) => item.lineId === targetLineId)?.quantity ?? 0
  )

  const isVerified = !!me?.isEmailVerified
  const isQualifiedBuyer = isAuthenticated && isVerified
  const remainingStock = Math.max(0, Math.min(available, MAX_QUANTITY) - inCartQuantity)
  const hasRoomInCart = remainingStock > 0
  const canAdd = isQualifiedBuyer && inStock && hasRoomInCart
  const isPurchaseDisabled = isGettingMe || !inStock || (isQualifiedBuyer && !hasRoomInCart)
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
      variantId,
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
      variantId,
      quantity: effectiveQuantity,
      selectedOptions,
      addedAt: now,
      updatedAt: now
    }
  }, [targetLineId, productId, variantId, effectiveQuantity, selectedOptions])

  const handleBuyNow = () => {
    if (!guardPurchase()) return
    setCheckoutIntent([buyNowItem], 'buy-now')
    router.push('/checkout')
  }

  return (
    <div className='space-y-5 rounded-3xl bg-card px-4 py-5 shadow-[0_0.8rem_2rem_rgb(81_108_108/10%)] ring-1 ring-foreground/5'>
      {hasVariants ? (
        <div className='space-y-2'>
          <p className='text-xs font-semibold uppercase tracking-widest text-muted-foreground'>
            {t('products.detail.purchase.packaging')}
          </p>
          <div className='flex flex-wrap gap-2'>
            {variantOptions.map((unit) => {
              const isActive = unit.id === activeUnitId

              return (
                <motion.button
                  key={unit.id}
                  type='button'
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 16 }}
                  onClick={() => setActiveUnitId(unit.id)}
                  aria-pressed={isActive}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-secondary/30 text-primary ring-1 ring-foreground/10 hover:bg-secondary/60'
                  }`}
                >
                  {unit.name}
                </motion.button>
              )
            })}
          </div>
        </div>
      ) : null}

      <div className='grid gap-4'>
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
            <span className='min-w-8 text-center text-sm font-semibold text-primary'>{effectiveQuantity}</span>
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
              key={currentRetail}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className='font-title text-4xl font-bold text-primary'
            >
              {formatVnd(currentRetail)}
            </motion.span>
            {hasDiscount ? (
              <span className='text-sm text-muted-foreground line-through'>{formatVnd(currentOld)}</span>
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
          whileHover={isPurchaseDisabled ? undefined : { y: -3, scale: 1.03 }}
          whileTap={isPurchaseDisabled ? undefined : { scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 320, damping: 14 }}
          className='min-w-32 flex-1'
        >
          <Button
            type='button'
            size='lg'
            variant='secondary'
            className='w-full'
            disabled={isPurchaseDisabled}
            onClick={handleBuyNow}
          >
            <HugeiconsIcon icon={FlashIcon} />
            {t('products.detail.purchase.buyNow')}
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
