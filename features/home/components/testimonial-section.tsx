import TestimonialCarousel from '@/features/home/components/testimonial-carousel'
import { getPublicConfigsGroup } from '@/features/public-configs/queries.server'
import type { Locale } from '@/lib/i18n/routing'
import type { FeedbacksCollection, FeedbacksCollectionConfigItem } from '@/types/config.type'
import { QuoteUpIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { getLocale, getTranslations } from 'next-intl/server'

async function loadTestimonials() {
  const configs = await getPublicConfigsGroup<FeedbacksCollectionConfigItem>('feedbacks', 'feedbacks.collection')
  const raw = configs[0]?.value.value
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw) as FeedbacksCollection
    return (parsed.items ?? []).filter((item) => !item.isPlaceholder)
  } catch {
    return []
  }
}

export default async function TestimonialSection() {
  const [t, locale, items] = await Promise.all([getTranslations(), getLocale(), loadTestimonials()])

  return (
    <div className='relative bg-secondary pt-4 pb-8 overflow-hidden'>
      <div className='banner-drift pointer-events-none absolute -left-4 top-2 sm:left-8 sm:top-4' aria-hidden='true'>
        <HugeiconsIcon icon={QuoteUpIcon} className='size-16 text-card/60 sm:size-24' />
      </div>

      <div className='mx-auto w-full max-w-7xl space-y-4 px-4 py-4 relative'>
        <h1 className='animate-in fade-in slide-in-from-bottom-4 duration-700 text-center font-title text-2xl md:text-3xl lg:text-4xl font-bold'>
          {t('home.testimonial.title')}
        </h1>

        <TestimonialCarousel items={items} locale={locale as Locale} />
      </div>
    </div>
  )
}
