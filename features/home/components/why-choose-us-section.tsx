import WhyChooseUsMotion, { type WhyChooseUsStrings } from '@/features/home/components/why-choose-us-motion'
import { getTranslations } from 'next-intl/server'

export default async function WhyChooseUsSection() {
  const t = await getTranslations()

  const strings: WhyChooseUsStrings = {
    title: t('home.whyChooseUs.title'),
    description: t('home.whyChooseUs.description'),
    bannerAlt: t('home.whyChooseUs.bannerAlt'),
    features: {
      fresh: {
        title: t('home.whyChooseUs.features.fresh.title'),
        description: t('home.whyChooseUs.features.fresh.description')
      },
      payment: {
        title: t('home.whyChooseUs.features.payment.title'),
        description: t('home.whyChooseUs.features.payment.description')
      },
      warranty: {
        title: t('home.whyChooseUs.features.warranty.title'),
        description: t('home.whyChooseUs.features.warranty.description')
      },
      refund: {
        title: t('home.whyChooseUs.features.refund.title'),
        description: t('home.whyChooseUs.features.refund.description')
      }
    }
  }

  return (
    <div className='space-y-2 overflow-hidden px-4'>
      <WhyChooseUsMotion strings={strings} />
    </div>
  )
}
