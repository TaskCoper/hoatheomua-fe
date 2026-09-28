'use client'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  buildBouquetComposition,
  getGatherOffset,
  type BouquetIngredient,
  type BouquetPlacement
} from '@/features/products/bouquet-composition'
import type { ProductDetail, ProductMaterial } from '@/features/products/types'
import { formatVnd } from '@/lib/currency'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link } from '@/lib/i18n/navigation'
import { cn } from '@/shared/utils'
import { ArrowRight02Icon, FlowerIcon, SparklesIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion, useInView, useReducedMotion, type Variants } from 'motion/react'
import Image from 'next/image'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const cardItem: Variants = {
  hidden: { opacity: 0, y: 50, scale: 0.92 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 160, damping: 16 }
  }
}

const STRIP_PREVIEW_COUNT = 4

function toIngredients(materials: ProductMaterial[] | null | undefined): BouquetIngredient[] {
  return (materials ?? []).map((material) => ({
    id: material.id,
    label: material.productName ?? undefined,
    image: material.coverImage
  }))
}

// Keep these phases synchronized: ingredients gather, fly into the first chip,
// then the generated bouquet fades in after the source composition disappears.
const GATHER_DURATION = 0.34
const FLIGHT_DELAY = 0.24
const FLIGHT_DURATION = 0.3
const REVEAL_DELAY = 0.46
const INTRO_HOLD_MS = 900
const ANTICIPATION = -0.14
const GATHER_RESIDUAL = 0.92
const GATHER_SCALE = 0.5
const FLIGHT_SCALE = 0.4
const CHIP_PULSE = 1.16

interface CustomizableProductCardProps {
  product: ProductDetail
  ingredients?: BouquetIngredient[]
  aiPreview?: string | null
  href?: string
  eager?: boolean
  isActive?: boolean
  onHoverStart?: () => void
}

function IngredientTile({
  ingredient,
  placement,
  eager
}: {
  ingredient: BouquetIngredient
  placement: BouquetPlacement
  eager: boolean
}) {
  return (
    <div
      className='relative h-full w-full overflow-hidden bg-secondary shadow-[0_0.5rem_1.1rem_rgb(28_43_43/16%)] ring-1 ring-white/60'
      style={{ borderRadius: placement.blob }}
    >
      {ingredient.image ? (
        <Image
          src={ingredient.image}
          alt=''
          fill
          loading={eager ? 'eager' : 'lazy'}
          priority={eager}
          sizes='(min-width: 1024px) 9vw, (min-width: 640px) 18vw, 34vw'
          quality={60}
          className='object-cover'
        />
      ) : (
        <div aria-hidden='true' className='absolute inset-0 flex items-center justify-center bg-secondary/60'>
          <HugeiconsIcon icon={FlowerIcon} className='size-1/3 text-primary/35' />
        </div>
      )}
      <span
        className='pointer-events-none absolute inset-0 bg-white'
        style={{ opacity: (1 - placement.depth) * 0.34 }}
      />
    </div>
  )
}

function IngredientChip({ ingredient }: { ingredient: BouquetIngredient }) {
  return (
    <span className='relative size-6 shrink-0 overflow-hidden rounded-full bg-secondary shadow-[0_0.15rem_0.4rem_rgb(28_43_43/14%)] ring-1 ring-white/70'>
      {ingredient.image ? (
        <Image
          src={ingredient.image}
          alt={ingredient.label ?? ''}
          fill
          sizes='24px'
          quality={50}
          className='object-cover'
        />
      ) : (
        <span aria-hidden='true' className='absolute inset-0 flex items-center justify-center bg-secondary/60'>
          <HugeiconsIcon icon={FlowerIcon} className='size-3 text-primary/35' />
        </span>
      )}
    </span>
  )
}

export default function CustomizableProductCard({
  product,
  ingredients,
  aiPreview,
  href,
  eager = false,
  isActive = false,
  onHoverStart
}: CustomizableProductCardProps) {
  const { t } = useTranslation()
  const prefersReducedMotion = useReducedMotion()

  const preview = aiPreview ?? product.coverImage

  const [hasComposed, setHasComposed] = useState(false)
  // No image to decode when there's no preview - the placeholder is ready immediately.
  const [isPreviewReady, setIsPreviewReady] = useState(() => !preview)
  const [flight, setFlight] = useState({ x: 0, y: 0 })

  const articleRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const chipRef = useRef<HTMLSpanElement>(null)
  const isInView = useInView(articleRef, { once: true, amount: 0.5 })

  const name = product.productName ?? ''
  const retail = product.price ?? 0
  const oldPrice = product.oldPrice ?? 0
  const hasDiscount = oldPrice > retail
  const discountPercent = hasDiscount ? Math.round(((oldPrice - retail) / oldPrice) * 100) : 0

  const stems = useMemo(() => ingredients ?? toIngredients(product.materials), [ingredients, product.materials])
  const composition = useMemo(() => buildBouquetComposition(stems), [stems])
  const previews = stems.slice(0, STRIP_PREVIEW_COUNT)
  const overflowCount = stems.length - previews.length

  // Reduced-motion users skip the ingredient flight and see the finished preview immediately.
  const isComposed = hasComposed || Boolean(prefersReducedMotion)
  const isFlying = isComposed && !prefersReducedMotion

  const measureFlight = useCallback(() => {
    const stage = stageRef.current
    const chip = chipRef.current
    if (!stage || !chip) return

    const from = stage.getBoundingClientRect()
    const to = chip.getBoundingClientRect()
    // Both rectangles use viewport coordinates, so their center delta can be
    // applied directly to the stage even when the card moves responsively.
    setFlight({
      x: to.left + to.width / 2 - (from.left + from.width / 2),
      y: to.top + to.height / 2 - (from.top + from.height / 2)
    })
  }, [])

  useEffect(() => {
    // Wait for both visibility and image decode/load before starting; otherwise
    // the composition could disappear into a preview that has not painted yet.
    if (hasComposed || prefersReducedMotion || !isInView || !isPreviewReady) return

    const timer = window.setTimeout(() => {
      measureFlight()
      setHasComposed(true)
    }, INTRO_HOLD_MS)

    return () => window.clearTimeout(timer)
  }, [hasComposed, isInView, isPreviewReady, prefersReducedMotion, measureFlight])

  return (
    <motion.article
      ref={articleRef}
      variants={cardItem}
      whileHover={{ y: -10, scale: 1.025 }}
      transition={{ type: 'spring', stiffness: 240, damping: 18 }}
      onHoverStart={onHoverStart}
      className='group relative h-full'
    >
      {isActive ? (
        <div
          aria-hidden='true'
          className='pointer-events-none absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-4xl border border-primary'
        />
      ) : null}

      <Link
        href={href ?? `/products/${product.id}/studio`}
        className='relative z-10 flex h-full flex-col overflow-hidden rounded-3xl bg-card shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] ring-1 ring-foreground/5 transition-[box-shadow,transform] duration-300 hover:shadow-[0_1.2rem_3rem_rgb(81_108_108/18%)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.995]'
      >
        <div className='p-2 pb-0'>
          <div className='relative h-[19.5rem] overflow-hidden rounded-2xl bg-secondary/55'>
            <div
              aria-hidden='true'
              className='pointer-events-none absolute inset-0 bg-[radial-gradient(85%_65%_at_50%_30%,rgb(255_255_255/62%),transparent_74%)]'
            />
            <div aria-hidden='true' className='absolute inset-x-0 top-1/2 -translate-y-[54%]'>
              <motion.div
                initial={false}
                animate={{
                  x: isFlying ? flight.x : 0,
                  y: isFlying ? flight.y : 0,
                  scale: isFlying ? FLIGHT_SCALE : 1,
                  opacity: isComposed ? (isFlying ? [1, 1, 0] : 0) : 1
                }}
                transition={{
                  duration: FLIGHT_DURATION,
                  delay: isFlying ? FLIGHT_DELAY : 0,
                  ease: [0.55, 0, 0.3, 1],
                  opacity: isFlying
                    ? { duration: FLIGHT_DURATION, delay: FLIGHT_DELAY, times: [0, 0.62, 1] }
                    : { duration: 0.28 }
                }}
              >
                <div ref={stageRef} className='relative mx-auto aspect-square w-full max-w-[17rem]'>
                  <motion.div
                    className='absolute bottom-[14%] left-1/2 h-[5%] w-[46%] -translate-x-1/2 rounded-[50%] bg-primary/15 blur-[6px]'
                    animate={{ opacity: isFlying ? 0 : 1 }}
                    transition={{ duration: GATHER_DURATION * 0.6 }}
                  />

                  {composition.map(({ ingredient, placement }) => {
                    const gather = getGatherOffset(placement)

                    return (
                      <div
                        key={ingredient.id}
                        className='absolute'
                        style={{
                          top: placement.top,
                          left: placement.left,
                          width: placement.width,
                          zIndex: placement.zIndex
                        }}
                      >
                        <div className='-translate-x-1/2 -translate-y-1/2'>
                          <motion.div
                            className='relative aspect-square w-full'
                            animate={
                              isFlying
                                ? {
                                    x: ['0%', `${gather.x * ANTICIPATION}%`, `${gather.x * GATHER_RESIDUAL}%`],
                                    y: ['0%', `${gather.y * ANTICIPATION}%`, `${gather.y * GATHER_RESIDUAL}%`],
                                    rotate: [placement.rotation, placement.rotation * 1.22, placement.rotation * 0.3],
                                    scale: [placement.scale, placement.scale * 1.04, placement.scale * GATHER_SCALE]
                                  }
                                : {
                                    x: '0%',
                                    y: '0%',
                                    rotate: placement.rotation,
                                    scale: placement.scale
                                  }
                            }
                            transition={
                              isFlying
                                ? {
                                    duration: GATHER_DURATION,
                                    times: [0, 0.28, 1],
                                    ease: ['easeOut', [0.45, 0, 0.2, 1]],
                                    delay: placement.depth * 0.05
                                  }
                                : { type: 'spring', stiffness: 210, damping: 20 }
                            }
                          >
                            <IngredientTile ingredient={ingredient} placement={placement} eager={eager} />
                          </motion.div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            </div>

            <motion.div
              aria-hidden='true'
              className='pointer-events-none absolute inset-0 z-20'
              initial={false}
              animate={{ opacity: isComposed ? 1 : 0, scale: isComposed ? 1 : 1.04 }}
              transition={{
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1],
                delay: isFlying ? REVEAL_DELAY : 0
              }}
            >
              {preview ? (
                <Image
                  src={preview}
                  alt=''
                  fill
                  loading='lazy'
                  sizes='(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 92vw'
                  quality={70}
                  onLoad={() => setIsPreviewReady(true)}
                  className='object-cover'
                />
              ) : (
                <div className='absolute inset-0 flex items-center justify-center bg-secondary/60'>
                  <HugeiconsIcon icon={FlowerIcon} className='size-12 text-primary/35' />
                </div>
              )}
            </motion.div>

            <div className='absolute inset-x-3 bottom-3 z-30 flex items-end justify-between gap-2'>
              <span
                aria-hidden='true'
                className={cn(
                  'inline-flex items-center rounded-full bg-white/70 py-1 pl-1 shadow-[0_0.25rem_0.75rem_rgb(28_43_43/10%)] backdrop-blur-md',
                  overflowCount > 0 ? 'pr-2.5' : 'pr-1'
                )}
              >
                {previews.map((ingredient, index) => (
                  <motion.span
                    key={ingredient.id}
                    ref={index === 0 ? chipRef : undefined}
                    className={index === 0 ? 'flex' : '-ml-2 flex'}
                    animate={isFlying ? { scale: [1, CHIP_PULSE, 1] } : { scale: 1 }}
                    transition={{
                      duration: 0.32,
                      delay: FLIGHT_DELAY + FLIGHT_DURATION - 0.08 + index * 0.05,
                      ease: 'easeOut'
                    }}
                  >
                    <IngredientChip ingredient={ingredient} />
                  </motion.span>
                ))}

                {overflowCount > 0 ? (
                  <span className='ml-2 text-[0.6875rem] font-semibold tracking-wide text-primary/75'>
                    +{overflowCount}
                  </span>
                ) : null}
              </span>
              <span className='inline-flex items-center gap-1 rounded-full bg-white/70 px-2 py-1 text-[0.625rem] font-medium text-primary shadow-[0_0.25rem_0.75rem_rgb(28_43_43/10%)] backdrop-blur-md'>
                <HugeiconsIcon icon={SparklesIcon} className='size-3' />
                {t('products.card.aiPreview')}
              </span>
            </div>
          </div>
        </div>

        <div className='flex flex-1 flex-col gap-1 p-4 sm:p-3 md:p-4 lg:p-5'>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <h2 className='line-clamp-2 font-title text-base font-bold leading-tight text-primary sm:text-base md:text-lg'>
                  {name}
                </h2>
              </TooltipTrigger>

              <TooltipContent
                className='max-w-[220px] rounded-2xl border border-border/50 bg-white px-3 py-2 text-xs font-medium text-primary shadow-[0_0.45rem_1.4rem_rgb(81_108_108/12%)] backdrop-blur-sm'
                iconClassName=' bg-white fill-white'
              >
                {name}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <p className='text-xs font-medium text-muted-foreground'>
            {t('products.card.madeToOrder')} · {t('products.card.ingredientCount', { count: stems.length })}
          </p>

          <div className='mt-auto flex items-end justify-between gap-3 pt-3.5'>
            <div className='-space-y-0.5'>
              <div className='flex items-center gap-1.5'>
                <p className='text-xs font-medium text-muted-foreground'>{t('products.card.priceFrom')}</p>

                {hasDiscount ? (
                  <>
                    <p className='text-[0.625rem] text-muted-foreground line-through'>{formatVnd(oldPrice)}</p>
                    <span className='rounded-full bg-rose-500/10 px-1.5 text-[0.625rem] font-semibold text-rose-600'>
                      -{discountPercent}%
                    </span>
                  </>
                ) : null}
              </div>

              <p className='font-title text-sm font-bold text-primary sm:text-base'>{formatVnd(retail)}</p>
            </div>

            <span
              aria-hidden='true'
              className='inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/45 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground'
            >
              <HugeiconsIcon
                icon={ArrowRight02Icon}
                className='size-4 transition-transform duration-300 group-hover:translate-x-0.5'
              />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
