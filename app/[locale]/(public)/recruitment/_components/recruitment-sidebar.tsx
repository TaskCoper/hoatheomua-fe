import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useGetAddresses } from '@/features/addresses/hooks/use-get-addresses'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import flowerImage from '@/public/images/flower.png'
import pedalsRight from '@/public/images/pedals-right.png'
import { FavouriteIcon, QuoteUpIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Image from 'next/image'
import { useMemo } from 'react'
import type { RecruitmentFilters } from '../types'

const jobTypeGroup = {
  titleKey: 'recruitment.sidebar.groups.jobType.title',
  items: [
    {
      labelKey: 'recruitment.sidebar.groups.jobType.fullTime',
      filterKey: 'employmentType',
      value: 'fullTime'
    },
    {
      labelKey: 'recruitment.sidebar.groups.jobType.partTime',
      filterKey: 'employmentType',
      value: 'partTime'
    }
  ]
} as const

type JobTypeItem = (typeof jobTypeGroup)['items'][number]
type LocationItem = {
  label: string
  filterKey: 'location'
  value: string
}
type SidebarFilterItem = JobTypeItem | LocationItem

const getUniqueCities = (addresses: { city?: string | null }[]) => {
  const cities = new Map<string, string>()

  addresses.forEach((address) => {
    const city = address.city?.trim()
    if (!city) return

    cities.set(city.toLowerCase(), city)
  })

  return Array.from(cities.values())
}

const getItemLabel = (item: SidebarFilterItem, t: ReturnType<typeof useTranslation>['t']) => {
  if ('labelKey' in item) return t(item.labelKey)

  return item.label
}

const getItemKey = (item: SidebarFilterItem) => {
  if ('labelKey' in item) return item.labelKey

  return item.value
}

const baseGroups = [
  {
    ...jobTypeGroup
  }
] as const

type RecruitmentSidebarProps = {
  filters: RecruitmentFilters
  onFilterChange: (filters: Partial<RecruitmentFilters>) => void
}

export default function RecruitmentSidebar({ filters, onFilterChange }: RecruitmentSidebarProps) {
  const { t } = useTranslation()
  const { addresses } = useGetAddresses({ enabled: true })

  const groups = useMemo(
    () => [
      ...baseGroups,
      {
        titleKey: 'recruitment.sidebar.groups.location.title' as const,
        items: getUniqueCities(addresses).map((city) => ({
          label: city,
          filterKey: 'location' as const,
          value: city
        }))
      }
    ],
    [addresses]
  )

  const isFilterChecked = (item: SidebarFilterItem) => {
    if (item.filterKey === 'employmentType') return filters.employmentType === item.value
    return filters.location === item.value
  }

  const handleFilterChange = (item: SidebarFilterItem, checked: boolean) => {
    if (item.filterKey === 'employmentType') {
      onFilterChange({ employmentType: checked ? item.value : undefined })
      return
    }

    onFilterChange({ location: checked ? item.value : undefined })
  }

  return (
    <aside className='w-full space-y-4 xl:sticky xl:top-6'>
      <Card className='w-full gap-0 border border-primary/10 bg-card py-5 shadow-sm shadow-primary/5 transition-shadow delay-100 duration-500 ease-out hover:shadow-md hover:shadow-primary/5'>
        <CardContent className='w-full px-5'>
          {groups.map((group, groupIndex) => (
            <div key={group.titleKey}>
              {groupIndex > 0 ? <DecorativeSidebarSeparator className='my-5' /> : null}
              <div className='mb-4 flex items-center justify-between gap-3'>
                <h3 className='text-sm font-semibold text-primary'>{t(group.titleKey)}</h3>
              </div>

              <div className='space-y-3'>
                {group.items.map((item, itemIndex) => {
                  const checkboxId = `recruitment-filter-${groupIndex}-${itemIndex}`
                  const itemLabel = getItemLabel(item, t)

                  return (
                    <Label
                      key={getItemKey(item)}
                      htmlFor={checkboxId}
                      className='group -mx-2 flex cursor-pointer items-center gap-3 rounded-2xl px-2 py-1 text-sm font-normal leading-5 text-foreground transition-colors delay-75 duration-500 ease-out hover:bg-primary/5 focus-within:bg-primary/5'
                    >
                      <Checkbox
                        id={checkboxId}
                        checked={isFilterChecked(item)}
                        onCheckedChange={(checked) => handleFilterChange(item, checked === true)}
                        aria-label={itemLabel}
                      />
                      <span className='min-w-0 flex-1'>{itemLabel}</span>
                    </Label>
                  )
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className='relative w-full transform-gpu gap-4 overflow-hidden border border-primary/10 bg-primary/5 py-6 text-center shadow-sm shadow-primary/5 transition-all duration-700 ease-out hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/10'>
        <div
          className='pointer-events-none absolute -bottom-12 -left-12 z-0 size-40 opacity-25 blur-sm'
          aria-hidden='true'
        >
          <Image src={flowerImage} alt='' fill sizes='160px' className='object-contain' />
        </div>
        <div
          className='pointer-events-none absolute -right-8 -top-12 z-0 h-40 w-28 opacity-30 blur-sm'
          aria-hidden='true'
        >
          <Image src={pedalsRight} alt='' fill sizes='112px' className='object-contain' />
        </div>
        <div
          className='pointer-events-none absolute inset-0 z-0 bg-gradient-to-t from-card/80 via-card/45 to-card/20'
          aria-hidden='true'
        />
        <HugeiconsIcon
          icon={QuoteUpIcon}
          strokeWidth={1.4}
          className='absolute -right-2 -top-2 z-0 size-16 text-primary/10'
          aria-hidden='true'
        />
        <CardContent className='relative z-10 w-full px-6'>
          <p className='font-title text-base italic leading-7 text-primary'>{t('recruitment.sidebar.quote')}</p>
          <div className='mx-auto mt-5 flex size-9 items-center justify-center rounded-full border border-primary/20 bg-background/60 text-primary'>
            <HugeiconsIcon icon={FavouriteIcon} strokeWidth={1.8} className='size-4' aria-hidden='true' />
          </div>
        </CardContent>
      </Card>
    </aside>
  )
}

function DecorativeSidebarSeparator({ className }: { className?: string }) {
  return (
    <div className={['relative', className].filter(Boolean).join(' ')}>
      <Separator className='bg-primary/10' />
      <span className='absolute left-1/2 top-1/2 grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-primary/10 bg-card text-primary shadow-sm'>
        <HugeiconsIcon icon={FavouriteIcon} strokeWidth={1.8} className='size-3.5' aria-hidden='true' />
      </span>
    </div>
  )
}
