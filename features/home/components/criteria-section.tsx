import CriteriaMotion, { type CriteriaStrings } from '@/features/home/components/criteria-motion'
import { getTranslations } from 'next-intl/server'

export default async function CriteriaSection() {
  const t = await getTranslations()

  const strings: CriteriaStrings = {
    affordable: {
      title: t('home.criteria.affordable.title'),
      description: t('home.criteria.affordable.description')
    },
    gardenFresh: {
      title: t('home.criteria.gardenFresh.title'),
      description: t('home.criteria.gardenFresh.description')
    },
    fastDelivery: {
      title: t('home.criteria.fastDelivery.title'),
      description: t('home.criteria.fastDelivery.description')
    },
    dedicatedSupport: {
      title: t('home.criteria.dedicatedSupport.title'),
      description: t('home.criteria.dedicatedSupport.description')
    },
    ecoPack: {
      title: t('home.criteria.ecoPack.title'),
      description: t('home.criteria.ecoPack.description')
    }
  }

  return (
    <div className='w-full bg-secondary flex items-center relative py-4 lg:py-10'>
      <CriteriaMotion strings={strings} />
    </div>
  )
}
