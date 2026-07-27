'use client'

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useGetProducts } from '@/features/products/hooks/use-get-products'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link } from '@/lib/i18n/navigation'
import { DEFAULT_PAGE_INDEX } from '@/shared/constants'
import { FlowerIcon, ShoppingBasket02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Image from 'next/image'
import { useState } from 'react'

const SIGNATURE_BOUQUETS_PAGE_SIZE = 8
const SIGNATURE_BOUQUETS_CATEGORY_ID = ['aeccf4a7-7f76-45ac-856b-668866950bd0']

const vndFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
})

const formatVnd = (value: number) => vndFormatter.format(value)

export default function SignatureBouquetsGrid() {
  const { t } = useTranslation()
  const [page, setPage] = useState(DEFAULT_PAGE_INDEX)

  const { products: response, isFetchingProducts: isFetching } = useGetProducts({
    pageIndex: page,
    pageSize: SIGNATURE_BOUQUETS_PAGE_SIZE,
    categoryIds: SIGNATURE_BOUQUETS_CATEGORY_ID
  })

  const value = response?.value
  const products = value?.items ?? []
  const hasPreviousPage = value?.hasPreviousPage ?? false
  const hasNextPage = value?.hasNextPage ?? false

  const handlePreviousPage = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    if (!hasPreviousPage || isFetching) return
    setPage((previous) => previous - 1)
  }

  const handleNextPage = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    if (!hasNextPage || isFetching) return
    setPage((previous) => previous + 1)
  }

  return (
    <section id='signature-bouquets' className='relative left-1/2 -translate-x-1/2 bg-background'>
      <div className='mx-auto grid w-full max-w-7xl gap-4 px-4'>
        <div
          key={products[0]?.id ?? 'empty'}
          className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6'
        >
          {products.map((product) => {
            const avatar = product.coverImage
            const name = product.productName ?? ''
            const retail = product.price ?? 0

            return (
              <article
                key={product.id}
                className='group relative transition-transform duration-300 ease-out hover:-translate-y-3 hover:scale-[1.035]'
              >
                <div
                  aria-hidden='true'
                  className='pointer-events-none absolute inset-0 rounded-[1.9rem] border border-primary opacity-0 transition-all duration-300 ease-out group-hover:translate-x-1.5 group-hover:translate-y-1.5 group-hover:opacity-100'
                />

                <Link
                  href={`/products/${product.id}`}
                  className='relative z-10 flex flex-col overflow-hidden rounded-[1.75rem] bg-card shadow-[0_0.8rem_2rem_rgb(81_108_108_/_7%)] transition-shadow duration-300 group-hover:bg-white group-hover:shadow-[0_1rem_2.5rem_rgb(81_108_108_/_16%)]'
                >
                  <div className='relative isolate flex h-80 items-center justify-center overflow-hidden bg-secondary/40'>
                    {avatar ? (
                      <Image
                        src={avatar}
                        alt={name}
                        fill
                        sizes='(min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw'
                        loading='lazy'
                        quality={70}
                        className='object-cover transition-transform duration-700 ease-out group-hover:scale-105'
                      />
                    ) : (
                      <div className='grid size-24 place-items-center rounded-full bg-primary/10 text-primary'>
                        <HugeiconsIcon icon={FlowerIcon} className='size-10' />
                      </div>
                    )}
                  </div>

                  <div className='flex items-end justify-between gap-4 p-4'>
                    <div className='min-w-0 flex-1'>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <h2 className='truncate text-base font-bold leading-tight text-foreground'>{name}</h2>
                          </TooltipTrigger>

                          <TooltipContent
                            className='max-w-[220px] rounded-2xl border border-border/50 bg-white px-3 py-2 text-xs font-medium text-primary shadow-[0_0.45rem_1.4rem_rgb(81_108_108/12%)] backdrop-blur-sm'
                            iconClassName=' bg-white fill-white'
                          >
                            {name}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <p className='text-xs font-medium text-foreground'>{formatVnd(retail)}</p>
                    </div>

                    <button
                      type='button'
                      onClick={(event) => event.preventDefault()}
                      className='grid size-8 shrink-0 place-items-center rounded-full border border-foreground bg-card text-foreground transition-all duration-200 hover:bg-primary hover:text-primary-foreground hover:scale-[1.15] hover:-rotate-12 active:scale-95'
                      aria-label={t('home.signatureBouquets.addToCart', { name })}
                    >
                      <HugeiconsIcon icon={ShoppingBasket02Icon} className='size-4' />
                    </button>
                  </div>
                </Link>
              </article>
            )
          })}
        </div>

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
                {page}
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
  )
}
