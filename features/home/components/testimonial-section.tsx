import TestimonialMotion from '@/features/home/components/testimonial-motion'
import { getPublicConfigsGroup } from '@/features/public-configs/queries.server'
import type { Locale } from '@/lib/i18n/routing'
import type { FeedbacksCollection, FeedbacksCollectionConfigItem } from '@/types/config.type'
import { getLocale, getTranslations } from 'next-intl/server'

async function loadTestimonials() {
  const configs = await getPublicConfigsGroup<FeedbacksCollectionConfigItem>('feedbacks', 'feedbacks.collection')
  const raw = configs[0]?.value.value
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw) as FeedbacksCollection
    return parsed.items ?? []
  } catch {
    return []
  }
}

export default async function TestimonialSection() {
  const [t, locale, items] = await Promise.all([getTranslations(), getLocale(), loadTestimonials()])

  return (
    <div className='relative bg-secondary pt-4 pb-8 overflow-hidden'>
      <TestimonialMotion title={t('home.testimonial.title')} items={items} locale={locale as Locale} />
    </div>
  )
}
