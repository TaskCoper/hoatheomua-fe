import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Briefcase01Icon, Building02Icon, Money03Icon, Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { useDebounce } from 'use-debounce'

import type { RecruitmentFilters } from '../types'

const filters = [
  {
    key: 'location',
    id: 'recruitment-location',
    placeholderKey: 'recruitment.sidebar.groups.location.title',
    values: [
      { value: 'TP.HCM', labelKey: 'recruitment.sidebar.groups.location.hoChiMinhCity' },
      { value: 'Hà Nội', labelKey: 'recruitment.sidebar.groups.location.haNoi' },
      { value: 'Đà Nẵng', labelKey: 'recruitment.sidebar.groups.location.daNang' }
    ],
    icon: Building02Icon
  },
  {
    key: 'employmentType',
    id: 'recruitment-employment-type',
    placeholderKey: 'recruitment.filter.employmentType.placeholder',
    values: [
      { value: 'fullTime', labelKey: 'recruitment.filter.employmentType.options.fullTime' },
      { value: 'partTime', labelKey: 'recruitment.filter.employmentType.options.partTime' }
    ],
    icon: Briefcase01Icon
  },
  {
    key: 'salaryRange',
    id: 'recruitment-salary',
    placeholderKey: 'recruitment.filter.salary.placeholder',
    values: [
      { value: 'below-8', labelKey: 'recruitment.filter.salary.options.below8' },
      { value: '8-12', labelKey: 'recruitment.filter.salary.options.range8To12' },
      { value: '12-18', labelKey: 'recruitment.filter.salary.options.range12To18' },
      { value: 'above-18', labelKey: 'recruitment.filter.salary.options.above18' }
    ],
    icon: Money03Icon
  }
] as const

type FilterKey = (typeof filters)[number]['key']

type FilterSectionProps = {
  filters: RecruitmentFilters
  onFilterChange: (filters: Partial<RecruitmentFilters>) => void
  onSearchTitle: (title: string) => void
}

export default function FilterSection({ filters: selectedFilters, onFilterChange, onSearchTitle }: FilterSectionProps) {
  const { t } = useTranslation()
  const [draftTitle, setDraftTitle] = useState(selectedFilters.title)
  const [debouncedTitle] = useDebounce(draftTitle, 500)

  useEffect(() => {
    const nextTitle = debouncedTitle.trim()

    if (nextTitle === selectedFilters.title) return

    onSearchTitle(nextTitle)
  }, [debouncedTitle, onSearchTitle, selectedFilters.title])

  const getOptionLabel = (option: (typeof filters)[number]['values'][number]) => t(option.labelKey)

  const getSelectValue = (key: FilterKey) => {
    if (key === 'employmentType') return selectedFilters.employmentType ?? 'all'
    if (key === 'salaryRange') return selectedFilters.salaryRange ?? 'all'
    return selectedFilters.location ?? 'all'
  }

  const handleSelectChange = (key: FilterKey, value: string) => {
    if (key === 'employmentType') {
      onFilterChange({ employmentType: value === 'all' ? undefined : value })
      return
    }

    if (key === 'salaryRange') {
      onFilterChange({ salaryRange: value === 'all' ? undefined : (value as RecruitmentFilters['salaryRange']) })
      return
    }

    onFilterChange({ location: value === 'all' ? undefined : value })
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSearchTitle(draftTitle.trim())
  }

  return (
    <Card className='w-full gap-0 overflow-visible rounded-3xl border border-primary/10 bg-card/95 py-0 shadow-sm shadow-primary/5 transition-shadow delay-100 duration-500 ease-out hover:shadow-md hover:shadow-primary/5 lg:rounded-full'>
      <CardContent className='p-1.5'>
        <form
          onSubmit={handleSubmit}
          className='grid w-full grid-cols-1 gap-2.5 md:grid-cols-2 lg:grid-cols-[minmax(220px,1.25fr)_repeat(3,minmax(145px,1fr))_auto]'
        >
          <div className='flex h-9 w-full min-w-0 items-center gap-2.5 rounded-2xl border border-border bg-background px-1.5 transition-all delay-75 duration-500 ease-out hover:border-primary/25 hover:bg-primary/5 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-ring/15 lg:rounded-full'>
            <span className='flex size-6.5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary'>
              <HugeiconsIcon icon={Search01Icon} strokeWidth={1.8} className='size-3' />
            </span>
            <div className='grid min-w-0 flex-1 gap-1'>
              <Input
                id='recruitment-position'
                value={draftTitle}
                onChange={(event) => setDraftTitle(event.target.value)}
                placeholder={t('recruitment.filter.positionPlaceholder')}
                className='h-5 rounded-none border-0  bg-transparent p-0 text-sm leading-5 shadow-none placeholder:text-muted-foreground focus-visible:border-0 focus-visible:ring-0'
              />
            </div>
          </div>

          {filters.map((filter) => (
            <div
              key={filter.id}
              className='flex h-9 w-full min-w-0 items-center gap-2.5 overflow-visible rounded-2xl border border-border bg-background px-1.5 transition-all delay-75 duration-500 ease-out hover:border-primary/25 hover:bg-primary/5 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-ring/15 lg:rounded-full'
            >
              <span className='flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary'>
                <HugeiconsIcon icon={filter.icon} strokeWidth={1.8} className='size-3' />
              </span>

              <div className='grid min-w-0 max-w-full flex-1 gap-0.5 overflow-hidden'>
                <Select
                  value={getSelectValue(filter.key)}
                  onValueChange={(value) => handleSelectChange(filter.key, value)}
                >
                  <SelectTrigger
                    id={filter.id}
                    className='!h-5 !min-h-0 !w-full min-w-0 gap-1.5 overflow-hidden rounded-none border-0 bg-transparent !p-0 text-sm leading-5 text-muted-foreground shadow-none whitespace-nowrap focus-visible:border-0 focus-visible:ring-0 data-[size=default]:!h-5 data-[size=sm]:!h-5 *:data-[slot=select-value]:min-w-0 *:data-[slot=select-value]:truncate [&_svg]:ml-1 [&_svg]:size-4 [&_svg]:shrink-0'
                  >
                    <SelectValue placeholder={t(filter.placeholderKey)} />
                  </SelectTrigger>

                  <SelectContent className='border border-primary/10'>
                    <SelectItem value='all'>{t(filter.placeholderKey)}</SelectItem>
                    {filter.values.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {getOptionLabel(option)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}

          <Button
            type='submit'
            className='h-9 w-full transform-gpu rounded-2xl px-5 text-sm transition-all duration-500 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] md:col-span-2 md:mx-auto md:w-48 lg:col-span-1 lg:w-auto lg:min-w-28 lg:rounded-full'
          >
            <HugeiconsIcon icon={Search01Icon} strokeWidth={1.8} className='size-3' />
            {t('recruitment.filter.search')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
