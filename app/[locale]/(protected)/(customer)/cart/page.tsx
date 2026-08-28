'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { buildProductVariantHref } from '@/features/products/components/product-variant-context'
import { useCheckCoreProducts } from '@/features/products/hooks/use-check-core-products'
import { useGetProductSummary } from '@/features/products/hooks/use-get-product-summary'
import { useGetProductsSellableQuantity } from '@/features/products/hooks/use-get-products-sellable-quantity'
import { useVerifySellableQuantity } from '@/features/products/hooks/use-verify-sellable-quantity'
import { toSellableQuantity } from '@/features/products/stock'
import type { ProductSummary } from '@/features/products/types'
import { useAccountPhoneNumber } from '@/features/users/hooks/use-account-phone-number'
import { useCartHydrated } from '@/hooks/use-cart-hydrated'
import { formatVnd } from '@/lib/currency'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link, useRouter } from '@/lib/i18n/navigation'
import { SparkleDivider } from '@/shared/components/sparkle-dividier'
import { type CartItem, useCartStore } from '@/stores/cart.store'
import { useCheckoutIntentStore } from '@/stores/checkout-intent.store'
import {
  Alert02Icon,
  Delete02Icon,
  FlowerIcon,
  MinusSignIcon,
  PlusSignIcon,
  ShoppingBag03Icon,
  ShoppingBasket02Icon
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion, type Variants } from 'motion/react'
import Image from 'next/image'
import { useMemo, useState } from 'react'

type UnavailableReason = 'missing' | 'out-of-stock' | 'materials'

interface MaterialBlock {
  signature: string
  productIds: ReadonlySet<string>
}

const NO_BLOCKED_PRODUCTS: ReadonlySet<string> = new Set()

interface MergedCartLine {
  cartItem: CartItem
  product: ProductSummary | null
  isResolving: boolean
  isUnavailable: boolean
  unavailableReason: UnavailableReason | null
  stock: number | null
  isOverStock: boolean
  isSelectable: boolean
  unitPrice: number
  lineSubtotal: number
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } }
}

const cardStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } }
}

const cardItem: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 160, damping: 16 } }
}

export default function CartPage() {
  const { t } = useTranslation()

  const router = useRouter()
  const setCheckoutIntent = useCheckoutIntentStore((state) => state.setIntent)
  const hasHydrated = useCartHydrated()
  const items = useCartStore((state) => state.items)

  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const incrementItem = useCartStore((state) => state.incrementItem)
  const decrementItem = useCartStore((state) => state.decrementItem)
  const clearCart = useCartStore((state) => state.clearCart)

  const [deselectedIds, setDeselectedIds] = useState<Set<string>>(() => new Set())
  const [materialBlock, setMaterialBlock] = useState<MaterialBlock | null>(null)

  const cartSignature = useMemo(() => items.map((item) => `${item.lineId}:${item.quantity}`).join('|'), [items])
  const materialBlockedIds = materialBlock?.signature === cartSignature ? materialBlock.productIds : NO_BLOCKED_PRODUCTS

  const { slug: mySlug, hasPhoneNumber, isLoading: isLoadingPhoneNumber } = useAccountPhoneNumber()
  const isPhoneMissing = !isLoadingPhoneNumber && !hasPhoneNumber

  const productIds = useMemo(
    () => (hasHydrated ? Array.from(new Set(items.map((item) => item.productId))) : []),
    [items, hasHydrated]
  )

  const { productSummaryById } = useGetProductSummary({ productIds })

  // Product details can be served from cache; stock cannot. This is the number
  // every line below is judged against.
  const { sellableQuantityById } = useGetProductsSellableQuantity({ productIds })
  const { verifySellableQuantity, isVerifyingSellableQuantity } = useVerifySellableQuantity()
  const { checkCoreProducts, isCheckingCoreProducts } = useCheckCoreProducts()

  const mergedLines = useMemo<MergedCartLine[]>(() => {
    return items.map<MergedCartLine>((cartItem) => {
      const state = productSummaryById.get(cartItem.productId)
      const product = state?.product ?? null
      const isResolving = state?.isResolving ?? true

      const liveStock = sellableQuantityById.get(cartItem.productId)
      const rawStock = liveStock ?? product?.sellableQuantity
      const isStockKnown = typeof rawStock === 'number' && Number.isFinite(rawStock)
      const stock = isStockKnown ? toSellableQuantity(rawStock) : null
      const unitPrice = product?.price ?? 0
      const lineSubtotal = unitPrice * cartItem.quantity

      const base = {
        cartItem,
        product,
        unitPrice,
        lineSubtotal
      }

      if (isResolving) {
        return {
          ...base,
          isResolving,
          isUnavailable: false,
          unavailableReason: null,
          stock,
          isOverStock: false,
          isSelectable: false
        }
      }

      if (!product) {
        return {
          ...base,
          product: null,
          isResolving: false,
          isUnavailable: true,
          unavailableReason: 'missing',
          stock: null,
          isOverStock: false,
          isSelectable: false
        }
      }

      if (stock === 0) {
        return {
          ...base,
          isResolving: false,
          isUnavailable: true,
          unavailableReason: 'out-of-stock',
          stock,
          isOverStock: false,
          isSelectable: false
        }
      }

      if (materialBlockedIds.has(cartItem.productId)) {
        return {
          ...base,
          isResolving: false,
          isUnavailable: true,
          unavailableReason: 'materials',
          stock,
          isOverStock: false,
          isSelectable: false
        }
      }

      const isOverStock = stock !== null && cartItem.quantity > stock
      return {
        ...base,
        isResolving: false,
        isUnavailable: false,
        unavailableReason: null,
        stock,
        isOverStock,
        isSelectable: !isOverStock
      }
    })
  }, [items, productSummaryById, sellableQuantityById, materialBlockedIds])

  const isLineChecked = (line: MergedCartLine) => line.isSelectable && !deselectedIds.has(line.cartItem.lineId)

  const selectableLines = mergedLines.filter((line) => line.isSelectable)
  const selectedLines = mergedLines.filter(isLineChecked)
  const allSelectableChecked = selectableLines.length > 0 && selectedLines.length === selectableLines.length
  const noneChecked = selectedLines.length === 0

  const toggleLine = (lineId: string) => {
    setDeselectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(lineId)) next.delete(lineId)
      else next.add(lineId)
      return next
    })
  }

  const toggleAll = () => {
    if (allSelectableChecked) {
      setDeselectedIds(new Set(selectableLines.map((line) => line.cartItem.lineId)))
    } else {
      setDeselectedIds(new Set())
    }
  }

  const subtotal = selectedLines.reduce((sum, line) => sum + line.lineSubtotal, 0)
  const selectedCartItems = selectedLines.map((line) => line.cartItem)

  // Stock can move between the moment a line was added and the moment checkout is
  // pressed. On a shortage the fresh numbers land in the query cache, which re-marks
  // the offending lines as over-stock or sold out and drops them out of the selection.
  const handleCheckout = async () => {
    const wanted = selectedLines.map((line) => ({
      productId: line.cartItem.productId,
      productName: line.product?.productName ?? null,
      quantity: line.cartItem.quantity
    }))

    const [stock, core] = await Promise.all([verifySellableQuantity(wanted), checkCoreProducts(wanted)])
    setMaterialBlock({ signature: cartSignature, productIds: core.blockedProductIds })
    if (!stock.ok || !core.ok) return

    setCheckoutIntent(selectedCartItems, 'cart')
    router.push('/checkout')
  }

  if (!hasHydrated) {
    return (
      <section className='relative px-4 pt-4 pb-12 sm:pt-6 md:pt-8 lg:pt-10'>
        <CartHeading title={t('cart.title')} />
        <div className='mx-auto mt-6 grid w-full max-w-7xl gap-5 sm:gap-6 lg:mt-10 lg:grid-cols-3 lg:gap-6'>
          <div className='space-y-3 lg:col-span-2'>
            <Skeleton className='h-14 w-full rounded-3xl' />
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className='h-40 w-full rounded-3xl sm:h-36' />
            ))}
          </div>
          <Skeleton className='h-72 w-full rounded-3xl lg:col-span-1' />
        </div>
      </section>
    )
  }

  if (items.length === 0) {
    return (
      <section className='relative px-4 pt-4 sm:pt-6 md:pt-8 lg:pt-10'>
        <CartHeading title={t('cart.title')} subtitle={t('cart.empty.description')} />

        <motion.div
          initial='hidden'
          animate='visible'
          variants={fadeUp}
          className='mx-auto mt-8 flex w-full max-w-md flex-col items-center gap-4 rounded-3xl bg-card px-6 py-12 text-center shadow-[0_0.8rem_2rem_rgb(81_108_108/10%)] ring-1 ring-foreground/5'
        >
          <div className='bob-tilt-sm grid size-20 place-items-center rounded-full bg-secondary/40 text-primary ring-1 ring-primary/10'>
            <HugeiconsIcon icon={ShoppingBag03Icon} className='size-9' strokeWidth={1.5} />
          </div>
          <h2 className='font-title text-xl font-bold text-primary sm:text-2xl'>{t('cart.empty.title')}</h2>
          <p className='text-sm leading-relaxed text-muted-foreground'>{t('cart.empty.description')}</p>
          <Button asChild size='lg' className='mt-2'>
            <Link href='/products'>
              <HugeiconsIcon icon={ShoppingBasket02Icon} className='size-4' />
              {t('cart.empty.continueShopping')}
            </Link>
          </Button>
        </motion.div>
      </section>
    )
  }

  return (
    <section className='relative px-4 pt-4 pb-12 sm:pt-6 md:pt-8 lg:pt-10'>
      <CartHeading title={t('cart.title')} subtitle={t('cart.summary.shippingNote')} />

      <div className='mx-auto mt-6 grid w-full max-w-7xl gap-5 sm:gap-6 lg:mt-10 lg:grid-cols-3 lg:gap-6'>
        <section className='space-y-3 lg:col-span-2'>
          <motion.div
            initial='hidden'
            animate='visible'
            variants={fadeUp}
            className='flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-card px-4 py-3 shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] ring-1 ring-foreground/5 sm:px-5'
          >
            <label className='flex items-center gap-3 text-sm font-semibold text-primary'>
              <Checkbox
                checked={allSelectableChecked}
                disabled={selectableLines.length === 0}
                onCheckedChange={toggleAll}
                aria-label={t('cart.actions.selectAll')}
              />
              <span>{t('cart.actions.selectAll')}</span>
            </label>

            <div className='flex items-center gap-3'>
              <span className='text-xs font-medium text-muted-foreground'>
                {t('cart.summary.selected', { count: selectedLines.length, total: mergedLines.length })}
              </span>
              <Button
                variant='ghost'
                size='sm'
                onClick={clearCart}
                className='text-muted-foreground hover:text-destructive'
              >
                <HugeiconsIcon icon={Delete02Icon} className='size-4' />
                {t('cart.actions.clear')}
              </Button>
            </div>
          </motion.div>

          <motion.ul initial='hidden' animate='visible' variants={cardStagger} className='space-y-3'>
            {mergedLines.map((line) => (
              <CartLineRow
                key={line.cartItem.lineId}
                line={line}
                checked={isLineChecked(line)}
                onToggle={() => toggleLine(line.cartItem.lineId)}
                onIncrement={() => incrementItem(line.cartItem.lineId)}
                onDecrement={() => decrementItem(line.cartItem.lineId)}
                onRemove={() => removeItem(line.cartItem.lineId)}
                onUseMax={(stock) => updateQuantity(line.cartItem.lineId, stock)}
                t={t}
              />
            ))}
          </motion.ul>
        </section>

        <aside className='lg:col-span-1'>
          <motion.div
            initial='hidden'
            animate='visible'
            variants={fadeUp}
            className='sticky top-6 space-y-4 rounded-3xl bg-card p-5 shadow-[0_0.8rem_2rem_rgb(81_108_108/10%)] ring-1 ring-foreground/5'
          >
            <div className='flex items-center gap-2'>
              <span className='grid size-9 place-items-center rounded-xl bg-secondary/40 text-primary ring-1 ring-primary/10'>
                <HugeiconsIcon icon={ShoppingBasket02Icon} className='size-4' />
              </span>
              <h2 className='font-title text-lg font-bold text-primary'>{t('cart.summary.title')}</h2>
            </div>

            <div className='space-y-3 border-b border-border/70 pb-4'>
              <div className='flex items-center justify-between text-xs text-muted-foreground'>
                <span>{t('cart.summary.selected', { count: selectedLines.length, total: mergedLines.length })}</span>
              </div>
              <div className='flex items-baseline justify-between gap-3'>
                <span className='text-sm font-semibold text-foreground'>{t('cart.summary.subtotal')}</span>
                <motion.span
                  key={subtotal}
                  data-testid='cart-subtotal'
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className='font-title text-2xl font-bold text-primary'
                >
                  {formatVnd(subtotal)}
                </motion.span>
              </div>
            </div>

            {materialBlockedIds.size > 0 && (
              <div className='flex items-start gap-2 rounded-2xl bg-destructive/8 px-3 py-2.5 ring-1 ring-destructive/10'>
                <HugeiconsIcon icon={Alert02Icon} className='mt-0.5 size-3.5 shrink-0 text-destructive' />
                <p className='text-xs leading-relaxed text-destructive'>{t('cart.unavailable.materialsNote')}</p>
              </div>
            )}

            <p className='text-xs leading-relaxed text-muted-foreground'>{t('cart.summary.shippingNote')}</p>

            <motion.div
              whileHover={!noneChecked ? { y: -2, scale: 1.02 } : undefined}
              whileTap={!noneChecked ? { scale: 0.97 } : undefined}
              transition={{ type: 'spring', stiffness: 320, damping: 14 }}
            >
              {!noneChecked && isPhoneMissing && mySlug ? (
                <Button asChild className='w-full' size='lg' variant='outline'>
                  <Link href={`/users/${mySlug}`}>{t('profile.editPersonalInfo')}</Link>
                </Button>
              ) : (
                <Button
                  disabled={noneChecked || isVerifyingSellableQuantity || isCheckingCoreProducts}
                  className='w-full'
                  size='lg'
                  onClick={handleCheckout}
                >
                  <HugeiconsIcon icon={ShoppingBasket02Icon} className='size-4' />
                  {isVerifyingSellableQuantity || isCheckingCoreProducts
                    ? t('products.stock.checking')
                    : t('cart.actions.checkout')}
                </Button>
              )}
            </motion.div>

            {noneChecked && <p className='text-center text-xs text-muted-foreground'>{t('cart.summary.empty')}</p>}

            {!noneChecked && isPhoneMissing && (
              <p className='text-center text-xs text-destructive'>{t('orders.checkout.contactMissing')}</p>
            )}
          </motion.div>
        </aside>
      </div>
    </section>
  )
}

function CartHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <motion.div
      initial='hidden'
      animate='visible'
      variants={fadeUp}
      className='mx-auto w-full max-w-7xl space-y-0.5 sm:space-y-1 md:space-y-1.5 lg:space-y-2'
    >
      <div className='flex items-center justify-start sm:justify-center gap-3'>
        <SparkleDivider
          className='min-w-0 max-w-96 flex-1 hidden sm:flex'
          iconClassName='sm:size-5 md:size-6 lg:size-7'
          color='#516c6c'
        />

        <h1 className='shrink-0 text-center font-title text-2xl md:text-3xl lg:text-4xl font-bold'>{title}</h1>

        <SparkleDivider
          className='min-w-0 max-w-96 flex-1 hidden sm:flex'
          iconClassName='sm:size-5 md:size-6 lg:size-7'
          direction='rtl'
          color='#516c6c'
        />
      </div>

      {subtitle ? (
        <p className='leading-relaxed mx-auto max-w-full sm:max-w-200 text-left sm:text-center text-xs sm:text-sm text-foreground'>
          {subtitle}
        </p>
      ) : null}
    </motion.div>
  )
}

interface CartLineRowProps {
  line: MergedCartLine
  checked: boolean
  onToggle: () => void
  onIncrement: () => void
  onDecrement: () => void
  onRemove: () => void
  onUseMax: (stock: number) => void
  t: ReturnType<typeof useTranslation>['t']
}

function CartLineRow({ line, checked, onToggle, onIncrement, onDecrement, onRemove, onUseMax, t }: CartLineRowProps) {
  const { cartItem, product, isResolving, isUnavailable, unavailableReason, stock, isOverStock, isSelectable } = line
  const unitName = cartItem.selectedOptions?.unit
  const avatar = product?.coverImage ?? null
  const retailPrice = product?.price ?? 0
  const oldPrice = product?.oldPrice ?? 0
  const hasDiscount = product ? oldPrice > retailPrice : false
  const productHref = product
    ? buildProductVariantHref(product.parent?.id ?? product.id, product.parent?.id ? product.id : null)
    : null

  return (
    <motion.li
      data-testid='cart-line'
      variants={cardItem}
      whileHover={!isUnavailable ? { y: -3 } : undefined}
      transition={{ type: 'spring', stiffness: 240, damping: 20 }}
      className={`group relative flex flex-col gap-5 overflow-hidden rounded-3xl bg-card p-5 shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] ring-1 ring-foreground/5 transition-shadow duration-300 hover:shadow-[0_1rem_2.4rem_rgb(81_108_108/14%)] sm:flex-row sm:items-stretch ${
        isUnavailable ? 'opacity-60' : ''
      }`}
    >
      <div className='flex items-start gap-4 sm:flex-1'>
        <Checkbox
          checked={checked}
          disabled={!isSelectable}
          onCheckedChange={onToggle}
          aria-label={t('cart.actions.selectLine')}
          className='mt-2'
        />

        {product?.id && productHref ? (
          <Link
            href={productHref}
            className='relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-secondary/30 ring-1 ring-foreground/8 sm:size-28'
          >
            {avatar ? (
              <Image
                src={avatar}
                alt={product.productName ?? ''}
                fill
                sizes='112px'
                quality={65}
                className='object-cover transition-transform duration-500 ease-out group-hover:scale-105'
              />
            ) : (
              <HugeiconsIcon icon={FlowerIcon} className='size-9 text-primary/40' />
            )}
          </Link>
        ) : isResolving ? (
          <Skeleton className='size-24 shrink-0 sm:size-28' />
        ) : (
          <div className='flex size-24 shrink-0 items-center justify-center rounded-2xl bg-secondary/30 ring-1 ring-foreground/8 sm:size-28'>
            <HugeiconsIcon icon={FlowerIcon} className='size-9 text-muted-foreground/50' />
          </div>
        )}

        <div className='min-w-0 flex-1 space-y-1 py-0.5'>
          {product?.id && productHref ? (
            <>
              <Link
                href={productHref}
                className='font-title line-clamp-2 text-base font-bold leading-snug text-primary hover:text-primary/80 sm:text-lg'
              >
                {product.parent?.productName ?? product.productName}
              </Link>
              {product.parent && (
                <p className='line-clamp-1 text-xs font-medium text-muted-foreground'>{product.productName}</p>
              )}
            </>
          ) : isResolving ? (
            <Skeleton className='h-4 w-32' />
          ) : (
            <div className='text-sm font-semibold text-muted-foreground'>{t('cart.unavailable.missing')}</div>
          )}

          {unitName && (
            <p className='inline-flex items-center gap-1 text-xs font-medium text-muted-foreground'>
              <span className='inline-block size-1 rounded-full bg-muted-foreground/50' aria-hidden='true' />
              {t('cart.unitLabel', { unit: unitName })}
            </p>
          )}

          {isResolving && <Skeleton className='h-4 w-20' />}

          {product && !isResolving && (
            <div className='flex items-baseline gap-2 pt-0.5'>
              <span className='font-title text-lg font-bold text-primary'>{formatVnd(retailPrice)}</span>
              {hasDiscount && <span className='text-xs text-muted-foreground line-through'>{formatVnd(oldPrice)}</span>}
            </div>
          )}

          {isUnavailable && unavailableReason && (
            <p className='inline-flex items-center gap-1.5 text-xs font-medium text-destructive'>
              <HugeiconsIcon icon={Alert02Icon} className='size-3.5 shrink-0' />
              {
                {
                  missing: t('cart.unavailable.missing'),
                  'out-of-stock': t('cart.unavailable.outOfStock'),
                  materials: t('cart.unavailable.materials')
                }[unavailableReason]
              }
            </p>
          )}

          {!isUnavailable && !isOverStock && typeof stock === 'number' && stock > 0 && stock <= 5 && (
            <p className='inline-flex items-center gap-1 text-xs font-medium text-warning'>
              <span className='inline-block size-1 rounded-full bg-warning' aria-hidden='true' />
              {t('cart.inStock', { stock })}
            </p>
          )}

          {!isUnavailable && isOverStock && typeof stock === 'number' && (
            <button
              type='button'
              onClick={() => onUseMax(stock)}
              className='cursor-pointer flex items-center gap-1.5 rounded-xl bg-destructive/8 px-2.5 py-1.5 text-left text-xs font-medium text-destructive ring-1 ring-destructive/10 transition-colors hover:bg-destructive/12'
            >
              <HugeiconsIcon icon={Alert02Icon} className='size-3.5 shrink-0' />
              {t('cart.overStockAction', { stock })}
            </button>
          )}
        </div>
      </div>

      <div className='flex items-center justify-between gap-4 border-t border-border/60 pt-4 sm:w-32 sm:flex-none sm:flex-col sm:items-end sm:justify-between sm:border-t-0 sm:border-l sm:border-border/60 sm:pt-0 sm:pl-6'>
        <div className='inline-flex items-center divide-x divide-border/70 rounded-full border border-border/70'>
          <Button
            type='button'
            size='icon-xs'
            variant='ghost'
            className='rounded-l-full rounded-r-none'
            onClick={onDecrement}
            disabled={isUnavailable || cartItem.quantity <= 1}
            aria-label={t('cart.actions.decrease')}
          >
            <HugeiconsIcon icon={MinusSignIcon} className='size-3.5' />
          </Button>
          <span
            data-testid='cart-line-quantity'
            className='min-w-8 text-center text-sm font-semibold tabular-nums text-primary'
          >
            {cartItem.quantity}
          </span>
          <Button
            type='button'
            size='icon-xs'
            variant='ghost'
            className='rounded-l-none rounded-r-full'
            onClick={onIncrement}
            disabled={isUnavailable || (typeof stock === 'number' && cartItem.quantity >= stock)}
            aria-label={t('cart.actions.increase')}
          >
            <HugeiconsIcon icon={PlusSignIcon} className='size-3.5' />
          </Button>
        </div>

        {!isUnavailable && product && (
          <div className='text-right'>
            <p className='text-[0.625rem] font-medium text-muted-foreground'>{t('cart.lineSubtotal')}</p>
            <p data-testid='cart-line-subtotal' className='font-title text-lg font-bold text-primary'>
              {formatVnd(line.lineSubtotal)}
            </p>
          </div>
        )}

        <Button
          variant='ghost'
          size='icon-sm'
          onClick={onRemove}
          aria-label={t('cart.actions.remove')}
          className='rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
        >
          <HugeiconsIcon icon={Delete02Icon} className='size-4' />
        </Button>
      </div>
    </motion.li>
  )
}
