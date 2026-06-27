'use client'

import { productDetailQuery } from '@/features/products/queries'
import type { ProductDetail } from '@/features/products/types'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import type { CartItem } from '@/stores/cart.store'
import { useQueries } from '@tanstack/react-query'
import { useLocale } from 'next-intl'
import Image from 'next/image'
import { useMemo } from 'react'

const vndFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
})

const formatVnd = (value: number) => vndFormatter.format(value)

export function CheckoutItemsPreview({ items }: { items: CartItem[] }) {
  const { t } = useTranslation()
  const locale = useLocale()

  const productIds = useMemo(() => Array.from(new Set(items.map((item) => item.productId))), [items])

  const productQueries = useQueries({
    queries: productIds.map((id) => productDetailQuery(String(id), locale))
  })

  const productById = useMemo(() => {
    const map = new Map<number, ProductDetail>()
    productIds.forEach((id, index) => {
      const data = productQueries[index]?.data?.value?.data
      if (data) map.set(id, data as ProductDetail)
    })
    return map
  }, [productIds, productQueries])

  const lines = useMemo(
    () =>
      items.map((item) => {
        const product = productById.get(item.productId)
        const unitPrice = product?.prices?.retail ?? 0
        return {
          lineId: item.lineId,
          name: product?.name ?? `#${item.productId}`,
          image: product?.images?.avatar ?? null,
          quantity: item.quantity,
          unitPrice,
          subtotal: unitPrice * item.quantity
        }
      }),
    [items, productById]
  )

  const subtotal = lines.reduce((sum, line) => sum + line.subtotal, 0)

  return (
    <section className='rounded-3xl bg-card p-4 border border-border'>
      <header className='mb-3 flex items-center justify-between'>
        <h3 className='font-heading text-sm font-semibold'>{t('orders.checkout.productsHeading')}</h3>
        <span className='text-xs text-muted-foreground'>{t('orders.checkout.lineCount', { count: lines.length })}</span>
      </header>
      <ul className='divide-y divide-border/60'>
        {lines.map((line) => (
          <li key={line.lineId} className='flex items-center gap-3 py-2.5 first:pt-0 last:pb-0'>
            <div className='relative size-12 shrink-0 overflow-hidden rounded-2xl bg-secondary/40 ring-1 ring-foreground/5'>
              {line.image ? (
                <Image src={line.image} alt={line.name} fill className='object-cover' sizes='48px' />
              ) : null}
            </div>
            <div className='min-w-0 flex-1'>
              <p className='truncate text-sm font-medium'>{line.name}</p>
              <p className='text-xs text-muted-foreground'>
                {t('orders.checkout.lineQty', { qty: line.quantity, price: formatVnd(line.unitPrice) })}
              </p>
            </div>
            <span className='text-sm font-semibold text-primary'>{formatVnd(line.subtotal)}</span>
          </li>
        ))}
      </ul>
      <div className='mt-3 flex items-baseline justify-between border-t border-border/60 pt-3'>
        <span className='text-sm font-medium text-muted-foreground'>{t('orders.checkout.subtotal')}</span>
        <span className='font-title text-lg font-bold text-primary'>{formatVnd(subtotal)}</span>
      </div>
    </section>
  )
}
