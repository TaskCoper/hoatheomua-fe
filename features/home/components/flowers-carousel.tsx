'use client'

import {
  detectSeamCrossing,
  offsetFromActive,
  padWholeDeck,
  resolveActiveIndex,
  resolveAnchorIndex,
  shouldFetchNextPage,
  shouldFetchPreviousPage,
  type WindowAnchor
} from '@/features/home/carousel-window'
import type { CarouselFlower } from '@/features/home/hooks/use-infinite-carousel-flowers'
import { useInfiniteCarouselFlowers } from '@/features/home/hooks/use-infinite-carousel-flowers'
import type { CarouselProductsParams } from '@/features/products/section-defaults'
import { Link } from '@/lib/i18n/navigation'
import image10 from '@/public/images/10.webp'
import image11 from '@/public/images/11.webp'
import image2 from '@/public/images/2.webp'
import image3 from '@/public/images/3.webp'
import image5 from '@/public/images/5.webp'
import image6 from '@/public/images/6.webp'
import image7 from '@/public/images/7.webp'
import image8 from '@/public/images/8.webp'
import image9 from '@/public/images/9.webp'
import Autoplay from 'embla-carousel-autoplay'
import useEmblaCarousel from 'embla-carousel-react'
import Image, { type StaticImageData } from 'next/image'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

/** A remote flower widened with the local fallback deck, which has no product to link to. */
type CarouselSlide = Omit<CarouselFlower, 'image' | 'href'> & {
  image: string | StaticImageData
  href?: string
}

// Shown only before the first page lands, or if the category has nothing with a photo.
const FALLBACK_SLIDES: CarouselSlide[] = [
  { id: 'local-1', label: 'Hoa Vườn', price: '550.000đ/Bó', image: image11 },
  { id: 'local-2', label: 'Hồng Pastel Mộng Mơ', price: '650.000đ/Bó', image: image2 },
  { id: 'local-3', label: 'Vườn Hoa Hồng Phấn', price: '550.000đ/Bó', image: image3 },
  { id: 'local-4', label: 'Hồng Ngọt Ngào', price: '600.000đ/Bó', image: image10 },
  { id: 'local-5', label: 'Cẩm Tú Cầu Bung Nở', price: '750.000đ/Bó', image: image5 },
  { id: 'local-6', label: 'Hồng Thanh Lịch', price: '625.000đ/Bó', image: image6 },
  { id: 'local-7', label: 'Hồng Cổ Điển', price: '800.000đ/Bó', image: image7 },
  { id: 'local-8', label: 'Hoa Dại', price: '675.000đ/Bó', image: image8 },
  { id: 'local-9', label: 'Hồng Pastel', price: '700.000đ/Bó', image: image9 }
]

const AUTO_INTERVAL = 10_000
const EASE = 'cubic-bezier(0.32, 0.72, 0, 1)'
// Only slides this close to the active one mount an image. The viewport never shows
// more than ~5 slides, so everything past this is off screen.
const IMAGE_WINDOW_FORWARD = 3
const IMAGE_WINDOW_BACK = 2
// Intrinsic hint only - the real size is the CSS custom properties below.
const IMAGE_DIMENSION = 460
const FLOWER_RING_COLORS = {
  secondary: '#bcd0c7',
  primary: '#516c6c'
}
// This client component still renders on the server, where `useLayoutEffect` warns.
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

const FLOWERS_CAROUSEL_CLASS_NAME =
  'relative left-1/2 h-[calc(var(--flower-image-active)+5.5rem)] w-screen max-w-none -translate-x-1/2 [--flower-image-active:clamp(10.5rem,56vw,13rem)] [--flower-image-corner:clamp(7.25rem,42vw,9.5rem)] [--flower-image-rest:clamp(5.75rem,32vw,7.25rem)] [--flower-ring-active:clamp(6.5rem,34vw,8rem)] [--flower-ring-corner:clamp(5rem,28vw,6.25rem)] [--flower-ring-rest:clamp(4rem,22vw,4.75rem)] [--flower-slide:clamp(7.5rem,42vw,9rem)] sm:[--flower-image-active:16rem] sm:[--flower-image-corner:11.5rem] sm:[--flower-image-rest:9.5rem] sm:[--flower-ring-active:10rem] sm:[--flower-ring-corner:7.5rem] sm:[--flower-ring-rest:5.75rem] sm:[--flower-slide:11.5rem] md:[--flower-image-active:22rem] md:[--flower-image-corner:16rem] md:[--flower-image-rest:12rem] md:[--flower-ring-active:13.75rem] md:[--flower-ring-corner:9rem] md:[--flower-ring-rest:6.75rem] md:[--flower-slide:14rem] lg:h-140 lg:[--flower-image-active:28.8rem] lg:[--flower-image-corner:19.8rem] lg:[--flower-image-rest:14.4rem] lg:[--flower-ring-active:17.2rem] lg:[--flower-ring-corner:9.5rem] lg:[--flower-ring-rest:5.9rem] lg:[--flower-slide:19.5rem] xl:[--flower-slide:23.5rem]'

export default function FlowersCarousel({ params }: { params: CarouselProductsParams | null }) {
  const {
    items,
    hasLoadedItems,
    isFetchingNextPage,
    isFetchingPreviousPage,
    isAtCatalogEnd,
    isAtCatalogStart,
    isWholeCatalogResident,
    firstPageIndex,
    lastPageIndex,
    loadNextPage,
    loadPreviousPage,
    prefetchPage,
    swapWindowToPage
  } = useInfiniteCarouselFlowers(params)

  const slides = useMemo(() => {
    const deck: CarouselSlide[] = hasLoadedItems ? items : FALLBACK_SLIDES
    // Padding is only ever applied to a deck that is already whole; a paginated window is
    // always at least a page wide and grows before it is exhausted.
    return isWholeCatalogResident || !hasLoadedItems ? padWholeDeck(deck) : deck
  }, [hasLoadedItems, isWholeCatalogResident, items])

  // Identity, not position: a trimmed page shifts every index, so the active slide is
  // tracked by id and its index is re-derived whenever the window moves.
  const [activeItemId, setActiveItemId] = useState<string | null>(null)
  const activeIndex = useMemo(() => resolveActiveIndex(slides, activeItemId), [activeItemId, slides])

  const slidesRef = useRef(slides)
  const slideCountRef = useRef(slides.length)
  const pendingAnchorRef = useRef<WindowAnchor | null>(null)
  // Set for exactly as long as we are driving embla ourselves. `reInit` emits `select`
  // synchronously, and that synthetic hop must never be read as the user wrapping.
  const isReAnchoringRef = useRef(false)
  const handleSelectRef = useRef<() => void>(() => {})

  // Must land before the re-anchor effect below, which re-inits embla and so runs the
  // handler while still inside this commit.
  useIsomorphicLayoutEffect(() => {
    slidesRef.current = slides
  }, [slides])

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      // Always a real loop. Crossing the seam is only *reachable* at the catalog's true
      // ends, because the window is always grown before the active slide gets there; the
      // seam handler below swaps the window when the matching boundary page is not
      // resident. See the comment on `handleSeamCrossing`.
      loop: true,
      align: 'center',
      containScroll: false,
      duration: 30,
      // Slides are added and trimmed under embla's feet; its own mutation observer would
      // re-init while keeping the old *index*, which after a trim is a different flower.
      // Position is restored by id in the re-anchor effect instead.
      watchSlides: false
    },
    [Autoplay({ delay: AUTO_INTERVAL, stopOnInteraction: false, stopOnMouseEnter: false })]
  )

  /**
   * The deck wrapped. With pages still ahead this cannot normally happen - the window is
   * extended long before the seam - so a crossing means one of:
   *  - the whole catalog is resident: embla's wrap is already the true catalog wrap;
   *  - the boundary page is evicted: swap the window onto it, synchronously, so the very
   *    next frame shows the catalog's real first (or last) flower;
   *  - that page is not cached yet (a failed or slow prefetch): the deck loops inside the
   *    resident window this once, and the page is warmed for the next crossing.
   */
  const handleSeamCrossing = useCallback(
    (direction: 'forward' | 'backward') => {
      const boundaryPage = direction === 'forward' ? firstPageIndex : lastPageIndex
      const alreadyResident = direction === 'forward' ? isAtCatalogStart : isAtCatalogEnd
      if (alreadyResident || boundaryPage === null) return

      pendingAnchorRef.current = direction === 'forward' ? 'first' : 'last'
      if (swapWindowToPage(boundaryPage)) return

      pendingAnchorRef.current = null
      prefetchPage(boundaryPage)
    },
    [firstPageIndex, isAtCatalogEnd, isAtCatalogStart, lastPageIndex, prefetchPage, swapWindowToPage]
  )

  useIsomorphicLayoutEffect(() => {
    handleSelectRef.current = () => {
      if (!emblaApi) return

      const deck = slidesRef.current
      const index = emblaApi.selectedScrollSnap()
      setActiveItemId(deck[index]?.id ?? null)

      if (isReAnchoringRef.current) return

      const crossing = detectSeamCrossing(emblaApi.previousScrollSnap(), index, deck.length)
      if (crossing) handleSeamCrossing(crossing)
    }
  }, [emblaApi, handleSeamCrossing])

  useEffect(() => {
    if (!emblaApi) return

    const listener = () => handleSelectRef.current()
    listener()
    emblaApi.on('select', listener)
    emblaApi.on('reInit', listener)

    return () => {
      emblaApi.off('select', listener)
      emblaApi.off('reInit', listener)
    }
  }, [emblaApi])

  // Re-measure and re-anchor before paint whenever the resident window changes - a page
  // appended, prepended, trimmed, or swapped at a boundary. `startIndex` is the active
  // item's *new* index, so the same flower stays centred and nothing visibly jumps.
  useIsomorphicLayoutEffect(() => {
    if (!emblaApi || slides.length === 0) return

    let target = activeIndex

    if (pendingAnchorRef.current) {
      target = resolveAnchorIndex(slides.length, pendingAnchorRef.current)
      pendingAnchorRef.current = null
      setActiveItemId(slides[target].id)
    }

    const countChanged = slideCountRef.current !== slides.length
    slideCountRef.current = slides.length

    if (!countChanged && emblaApi.selectedScrollSnap() === target) return

    isReAnchoringRef.current = true
    try {
      emblaApi.reInit({ startIndex: target })
    } finally {
      isReAnchoringRef.current = false
    }
  }, [activeIndex, emblaApi, slides])

  // Extend the window while there is still runway, so the seam is only ever reached at
  // the catalog's true ends.
  useEffect(() => {
    if (!hasLoadedItems) return

    const paging = {
      hasNextPage: !isAtCatalogEnd,
      hasPreviousPage: !isAtCatalogStart,
      isFetchingNextPage,
      isFetchingPreviousPage
    }
    if (shouldFetchNextPage(activeIndex, slides.length, paging)) loadNextPage()
    if (shouldFetchPreviousPage(activeIndex, paging)) loadPreviousPage()
  }, [
    activeIndex,
    hasLoadedItems,
    isAtCatalogEnd,
    isAtCatalogStart,
    isFetchingNextPage,
    isFetchingPreviousPage,
    loadNextPage,
    loadPreviousPage,
    slides.length
  ])

  // Once the catalog's last page is resident with page one already evicted, warm page one
  // so the wrap onto it costs nothing. Only users who travel the whole catalog pay for it.
  useEffect(() => {
    if (!isAtCatalogEnd || isAtCatalogStart) return
    prefetchPage(firstPageIndex)
  }, [firstPageIndex, isAtCatalogEnd, isAtCatalogStart, prefetchPage])

  const offsetOf = useCallback(
    (index: number) => offsetFromActive(index, activeIndex, slides.length, true),
    [activeIndex, slides.length]
  )

  return (
    <div className={FLOWERS_CAROUSEL_CLASS_NAME}>
      <div className='h-full overflow-hidden' ref={emblaRef}>
        <div className='flex h-full items-center'>
          {slides.map((slide, index) => {
            const offset = offsetOf(index)
            const distanceFromActive = Math.abs(offset)
            const isActive = distanceFromActive === 0
            const isCornerItem = distanceFromActive === 1
            const isRendered = offset <= IMAGE_WINDOW_FORWARD && offset >= -IMAGE_WINDOW_BACK

            const imageSize = isActive
              ? 'var(--flower-image-active)'
              : isCornerItem
                ? 'var(--flower-image-corner)'
                : 'var(--flower-image-rest)'
            const ringSize = isActive
              ? 'var(--flower-ring-active)'
              : isCornerItem
                ? 'var(--flower-ring-corner)'
                : 'var(--flower-ring-rest)'
            const ringColor = isActive ? FLOWER_RING_COLORS.primary : FLOWER_RING_COLORS.secondary

            const slideClassName = [
              'w-[var(--flower-slide)] shrink-0 cursor-pointer px-3 text-center focus:outline-none',
              isActive ? 'relative z-20' : isCornerItem ? 'relative z-10' : ''
            ].join(' ')

            const body = (
              <div
                className='flex flex-col items-center text-center'
                style={{
                  opacity: distanceFromActive <= 2 ? 1 : 0.72,
                  transition: `opacity 550ms ${EASE}`
                }}
              >
                <div
                  className='grid place-items-center'
                  style={{
                    width: imageSize,
                    height: imageSize,
                    transition: `width 550ms ${EASE}, height 550ms ${EASE}`
                  }}
                >
                  <span
                    aria-hidden
                    className='col-start-1 row-start-1 rounded-full'
                    style={{
                      width: ringSize,
                      height: ringSize,
                      backgroundColor: ringColor,
                      transition: `width 550ms ${EASE}, height 550ms ${EASE}, background-color 550ms ${EASE}`
                    }}
                  />

                  {isRendered ? (
                    <Image
                      src={slide.image}
                      alt=''
                      aria-hidden='true'
                      width={IMAGE_DIMENSION}
                      height={IMAGE_DIMENSION}
                      className='pointer-events-none col-start-1 row-start-1 object-contain'
                      style={{
                        width: imageSize,
                        height: imageSize,
                        transition: `width 550ms ${EASE}, height 550ms ${EASE}`
                      }}
                      sizes='(min-width: 1024px) 320px, (min-width: 768px) 256px, 128px'
                      loading={distanceFromActive <= 1 ? 'eager' : 'lazy'}
                      fetchPriority='low'
                      quality={55}
                    />
                  ) : null}
                </div>

                {isRendered ? (
                  <>
                    <span className='block w-full truncate text-xs font-semibold text-foreground sm:text-sm'>
                      {slide.label}
                    </span>

                    <span
                      className='mt-1.5 rounded-full bg-primary px-3 py-1 text-[0.625rem] font-semibold text-primary-foreground sm:mt-2 sm:px-4 sm:py-1.5 sm:text-xs'
                      style={{
                        opacity: isActive ? 1 : 0,
                        transform: `translateY(${isActive ? 0 : -4}px)`,
                        transition: `opacity 350ms ${EASE}, transform 350ms ${EASE}`
                      }}
                    >
                      {slide.price}
                    </span>
                  </>
                ) : null}
              </div>
            )

            const ariaLabel = `${slide.label}${slide.price ? ` - ${slide.price}` : ''}`

            // A side slide is a target to bring forward, the centred one is a real link
            // to the product - same element either way so the size transition never
            // restarts from a remount.
            return slide.href ? (
              <Link
                key={slide.id}
                href={slide.href}
                className={slideClassName}
                aria-label={ariaLabel}
                onClick={(event) => {
                  if (isActive) return
                  event.preventDefault()
                  emblaApi?.scrollTo(index)
                }}
              >
                {body}
              </Link>
            ) : (
              <button
                key={slide.id}
                type='button'
                className={slideClassName}
                onClick={() => emblaApi?.scrollTo(index)}
                aria-label={ariaLabel}
              >
                {body}
              </button>
            )
          })}
        </div>
      </div>

      {/* Absolutely positioned so a page arriving never nudges the deck. */}
      {isFetchingPreviousPage ? (
        <span
          aria-hidden
          className='pointer-events-none absolute left-3 top-1/2 size-2 animate-pulse rounded-full bg-primary/50'
        />
      ) : null}
      {isFetchingNextPage ? (
        <span
          aria-hidden
          className='pointer-events-none absolute right-3 top-1/2 size-2 animate-pulse rounded-full bg-primary/50'
        />
      ) : null}
    </div>
  )
}
