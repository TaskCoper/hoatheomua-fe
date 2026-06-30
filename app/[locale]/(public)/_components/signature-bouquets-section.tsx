'use client'

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { DEFAULT_PRODUCT_SORT } from '@/features/products/constants'
import { useGetProducts } from '@/features/products/hooks/use-get-products'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link } from '@/lib/i18n/navigation'
import { FlowerIcon, ShoppingBasket02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion, type Variants } from 'motion/react'
import Image from 'next/image'
import { useState } from 'react'
import { SparkleDivider } from './sparkle-dividier'

const SIGNATURE_BOUQUETS_PAGE_SIZE = 8
const SIGNATURE_BOUQUETS_CATEGORY_ID = [58901]

const vndFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
})

const formatVnd = (value: number) => vndFormatter.format(value)

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } }
}

const cardStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } }
}

const cardItem: Variants = {
  hidden: { opacity: 0, y: 50, scale: 0.88, rotate: -2 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotate: 0,
    transition: { type: 'spring', stiffness: 150, damping: 16 }
  }
}

export default function SignatureBouquetsSection() {
  const { t } = useTranslation()
  const [activeIndex, setActiveIndex] = useState(0)
  const [cursorStack, setCursorStack] = useState([0])

  const currentCursor = cursorStack.at(-1) ?? 0
  const isFirstPage = currentCursor === 0
  const nextParam = isFirstPage ? undefined : { id: currentCursor }

  const { products: response, isFetchingProducts: isFetching } = useGetProducts({
    size: SIGNATURE_BOUQUETS_PAGE_SIZE,
    categoryIds: SIGNATURE_BOUQUETS_CATEGORY_ID,
    sort: DEFAULT_PRODUCT_SORT,
    next: nextParam
  })

  const products = response?.value?.data ?? []
  const nextCursor = response?.value?.paginator?.next?.id ?? 0
  const hasPreviousPage = cursorStack.length > 1
  const hasNextPage = products.length === SIGNATURE_BOUQUETS_PAGE_SIZE && nextCursor > 0 && nextCursor !== currentCursor

  const handlePreviousPage = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    if (!hasPreviousPage || isFetching) return
    setCursorStack((previous) => previous.slice(0, -1))
  }

  const handleNextPage = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    if (!hasNextPage || isFetching) return
    setCursorStack((previous) => [...previous, nextCursor])
  }

  return (
    <>
      <motion.div
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-80px' }}
        variants={fadeUp}
        className='my-4 sm:my-6 md:my-8 lg:my-10 space-y-2 overflow-hidden px-4'
      >
        <div className='mx-auto w-full max-w-7xl space-y-0.5 sm:space-y-1 md:space-y-1.5 lg:space-y-2'>
          <div className='flex items-center justify-start sm:justify-center gap-3'>
            <SparkleDivider
              className='min-w-0 max-w-96 flex-1 hidden sm:flex'
              iconClassName='sm:size-5 md:size-6 lg:size-7'
              color='#516c6c'
            />

            <h1 className='shrink-0 text-center font-title text-2xl md:text-3xl lg:text-4xl font-bold'>
              {t('home.signatureBouquets.title')}
            </h1>

            <SparkleDivider
              className='min-w-0 max-w-96 flex-1 hidden sm:flex'
              iconClassName='sm:size-5 md:size-6 lg:size-7'
              direction='rtl'
              color='#516c6c'
            />
          </div>

          <p className='leading-relaxed mx-auto max-w-full sm:max-w-140 md:max-w-200 text-left sm:text-center text-xs sm:text-sm text-foreground'>
            {t('home.signatureBouquets.description')}
          </p>
        </div>
      </motion.div>

      <section id='signature-bouquets' className='relative left-1/2 -translate-x-1/2 bg-background'>
        <div className='mx-auto grid w-full max-w-7xl gap-4 px-4'>
          <motion.div
            key={products[0]?.id ?? 'empty'}
            initial='hidden'
            animate='visible'
            variants={cardStagger}
            className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6'
          >
            {products.map((product, index) => {
              const isActive = index === activeIndex
              const avatar = product.images?.avatar
              const retail = product.prices?.retail ?? 0

              return (
                <motion.article
                  key={product.id}
                  variants={cardItem}
                  whileHover={{ y: -12, scale: 1.035 }}
                  transition={{ type: 'spring', stiffness: 240, damping: 18 }}
                  onHoverStart={() => setActiveIndex(index)}
                  className={['group relative', isActive ? 'rounded-[1.75rem]' : ''].join(' ')}
                >
                  {isActive ? (
                    <div
                      aria-hidden='true'
                      className='pointer-events-none absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-[1.9rem] border border-primary'
                    />
                  ) : null}

                  <Link
                    href={`/products/${product.id}`}
                    className={[
                      'relative z-10 flex flex-col overflow-hidden rounded-[1.75rem] bg-card shadow-[0_0.8rem_2rem_rgb(81_108_108_/_7%)]',
                      isActive ? 'bg-white shadow-[0_1rem_2.5rem_rgb(81_108_108_/_16%)]' : ''
                    ].join(' ')}
                  >
                    <div className='relative isolate flex h-80 items-center justify-center overflow-hidden bg-secondary/40'>
                      {avatar ? (
                        <Image
                          src={avatar}
                          alt={product.name ?? ''}
                          fill
                          sizes='(min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw'
                          loading='lazy'
                          quality={70}
                          className='object-cover transition-transform duration-700 ease-out group-hover:scale-105'
                        />
                      ) : (
                        <>
                          <motion.div
                            aria-hidden='true'
                            animate={{ rotate: 360 }}
                            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                            className='absolute inset-3 rounded-2xl border border-dashed border-primary/15'
                          />
                          <div className='grid size-24 place-items-center rounded-full bg-primary/10 text-primary'>
                            <HugeiconsIcon icon={FlowerIcon} className='size-10' />
                          </div>
                        </>
                      )}
                    </div>

                    <div className='flex items-end justify-between gap-4 p-4'>
                      <div className='min-w-0 flex-1'>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <h2 className='truncate text-base font-bold leading-tight text-foreground'>
                                {product.name}
                              </h2>
                            </TooltipTrigger>

                            <TooltipContent
                              className='max-w-[220px] rounded-2xl border border-border/50 bg-white px-3 py-2 text-xs font-medium text-primary shadow-[0_0.45rem_1.4rem_rgb(81_108_108/12%)] backdrop-blur-sm'
                              iconClassName=' bg-white fill-white'
                            >
                              {product.name}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <p className='text-xs font-medium text-foreground'>{formatVnd(retail)}</p>
                      </div>

                      <motion.button
                        type='button'
                        whileHover={{ scale: 1.15, rotate: -12 }}
                        whileTap={{ scale: 0.92 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 12 }}
                        onClick={(event) => event.preventDefault()}
                        className='grid size-8 shrink-0 place-items-center rounded-full border border-foreground bg-card text-foreground transition-colors hover:bg-primary hover:text-primary-foreground'
                        aria-label={t('home.signatureBouquets.addToCart', { name: product.name })}
                      >
                        <HugeiconsIcon icon={ShoppingBasket02Icon} className='size-4' />
                      </motion.button>
                    </div>
                  </Link>
                </motion.article>
              )
            })}
          </motion.div>

          <Pagination className='mt-6'>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href='#signature-bouquets'
                  text={t('products.grid.previous')}
                  aria-disabled={!hasPreviousPage || isFetching}
                  className={!hasPreviousPage || isFetching ? 'pointer-events-none opacity-50' : undefined}
                  onClick={handlePreviousPage}
                />
              </PaginationItem>
              <PaginationItem>
                <span className='flex h-9 min-w-9 items-center justify-center rounded-md px-3 text-sm font-medium text-muted-foreground'>
                  {cursorStack.length}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href='#signature-bouquets'
                  text={t('products.grid.next')}
                  aria-disabled={!hasNextPage || isFetching}
                  className={!hasNextPage || isFetching ? 'pointer-events-none opacity-50' : undefined}
                  onClick={handleNextPage}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </section>
    </>
  )
}
