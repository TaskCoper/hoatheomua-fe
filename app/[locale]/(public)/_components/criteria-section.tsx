import { Award05Icon, DeliveryTruck01Icon, EcoEnergyIcon, Flower2Icon, PartyIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { getTranslations } from 'next-intl/server'

const CRITERIAS = [
  {
    id: 1,
    icon: Flower2Icon,
    titleKey: 'home.criteria.affordable.title',
    descriptionKey: 'home.criteria.affordable.description'
  },
  {
    id: 100,
    icon: DeliveryTruck01Icon,
    titleKey: 'home.criteria.gardenFresh.title',
    descriptionKey: 'home.criteria.gardenFresh.description'
  },
  {
    id: 200,
    icon: Award05Icon,
    titleKey: 'home.criteria.fastDelivery.title',
    descriptionKey: 'home.criteria.fastDelivery.description'
  },
  {
    id: 300,
    icon: PartyIcon,
    titleKey: 'home.criteria.dedicatedSupport.title',
    descriptionKey: 'home.criteria.dedicatedSupport.description'
  },
  {
    id: 400,
    icon: EcoEnergyIcon,
    titleKey: 'home.criteria.ecoPack.title',
    descriptionKey: 'home.criteria.ecoPack.description'
  }
] as const

const FLOAT_STYLES = ['2.4s', '2.7s', '3.0s', '2.6s', '2.9s'] as const

export default async function CriteriaSection() {
  const t = await getTranslations()

  return (
    <div className='w-full bg-secondary flex items-center relative py-4 lg:py-10'>
      <div className='mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 z-10 sm:grid sm:grid-cols-6 sm:gap-x-4 sm:gap-y-4 sm:*:col-span-2 sm:[&>*:nth-child(4)]:col-start-2 lg:grid-cols-5 lg:gap-x-10 lg:*:col-span-1 lg:[&>*:nth-child(4)]:col-start-auto'>
        {CRITERIAS.map((criteria, index) => (
          <div
            key={criteria.id}
            className='group flex w-full flex-row gap-2 items-center transition-transform duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.04] sm:flex-col sm:text-center lg:text-left lg:items-start'
          >
            <div
              className='float-y p-1.5 rounded-full flex justify-center items-center bg-primary w-fit shadow-lg transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-[1.18]'
              style={{ ['--float-duration' as string]: FLOAT_STYLES[index] }}
            >
              <HugeiconsIcon icon={criteria.icon} className='size-5 sm:size-6 md:size-7 text-white' />
            </div>

            <div className='-space-y-0.5'>
              <p className='font-semibold text-foreground text-xs sm:text-sm lg:text-base line-clamp-1'>
                {t(criteria.titleKey)}
              </p>
              <p className='text-[0.625rem] text-foreground'>{t(criteria.descriptionKey)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
