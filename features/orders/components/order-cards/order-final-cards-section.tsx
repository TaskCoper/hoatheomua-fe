'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { ImageCompositionIcon, ViewIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useOrderAiCards } from '../../hooks/use-order-ai-cards'
import { useOrderFinalCards } from '../../hooks/use-order-final-cards'
import type { OrderItem } from '../../types'
import OrderSectionCard from '../order-section-card'
import OrderCardArtwork from './order-card-artwork'
import OrderCardStudioDialog from './order-card-studio-dialog'

/** Only reached before anything has been measured and with no size on the card. */
const DEFAULT_CARD_RATIO = 3 / 4

interface OrderFinalCardsSectionProps {
  items: OrderItem[]
}

/**
 * The artworks the florist prints, away from the item list - a card is settled once its version
 * is chosen, so what it looks like matters more here than which line it was bought on. Opening
 * one reaches the studio as a viewer: the choice is made and nothing in there can move it.
 */
export default function OrderFinalCardsSection({ items }: OrderFinalCardsSectionProps) {
  const { t } = useTranslation()
  const { cards } = useOrderAiCards(items)
  const { finalCards, isLoadingFinalCards } = useOrderFinalCards(cards)

  if (finalCards.length === 0) return null

  return (
    <OrderSectionCard
      icon={ImageCompositionIcon}
      title={t('orders.cards.final.heading')}
      aside={t('orders.cards.cardCount', { count: finalCards.length })}
    >
      <p className='mb-3 text-xs leading-relaxed text-muted-foreground'>{t('orders.cards.final.description')}</p>

      <ul className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4'>
        {finalCards.map(({ card, version }) => {
          const ratio = card.sizeRatio ?? DEFAULT_CARD_RATIO

          return (
            <li key={`${card.orderDetailsId}-${card.id}`}>
              <OrderCardStudioDialog card={card}>
                <button
                  type='button'
                  className='group flex w-full flex-col gap-2 rounded-2xl bg-secondary/15 p-2 text-left ring-1 ring-foreground/5 transition-colors hover:bg-secondary/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'
                  aria-label={t('orders.cards.final.viewAriaLabel', { name: version?.name || card.productName })}
                >
                  <span className='relative block'>
                    {isLoadingFinalCards && !version ? (
                      <Skeleton style={{ aspectRatio: ratio }} className='w-full rounded-xl' />
                    ) : (
                      <OrderCardArtwork
                        showWords
                        imageUrl={version?.imageUrl ?? card.templateImageUrl}
                        alt={
                          version
                            ? t('orders.cards.previewAlt', { index: version.label })
                            : t('orders.cards.final.missing')
                        }
                        message={version?.content.message ?? card.content.message}
                        writingMethod={version?.writingMethod ?? card.writingMethod}
                        sizes='(min-width: 1024px) 12rem, (min-width: 640px) 18vw, 40vw'
                        style={{ aspectRatio: ratio }}
                        className='w-full rounded-xl ring-1 ring-foreground/10'
                      />
                    )}

                    <span className='absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-card/90 text-primary opacity-0 ring-1 ring-primary/10 backdrop-blur-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100'>
                      <HugeiconsIcon icon={ViewIcon} strokeWidth={2} className='size-3.5' />
                    </span>
                  </span>

                  {/* The card's own name leads; the product it is printed for is the context under it. */}
                  <span className='min-w-0'>
                    <span className='block truncate text-xs font-semibold text-foreground'>
                      {version?.name || card.productName}
                    </span>
                    <span className='mt-0.5 block truncate text-[0.7rem] text-muted-foreground'>
                      {version?.name
                        ? `${card.productName} · ${t('orders.cards.versions.label', { index: version.label })}`
                        : version
                          ? t('orders.cards.versions.label', { index: version.label })
                          : null}
                    </span>
                  </span>
                </button>
              </OrderCardStudioDialog>
            </li>
          )
        })}
      </ul>
    </OrderSectionCard>
  )
}
