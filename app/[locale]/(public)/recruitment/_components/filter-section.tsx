import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Faceted,
  FacetedContent,
  FacetedEmpty,
  FacetedGroup,
  FacetedInput,
  FacetedItem,
  FacetedList,
  FacetedTrigger
} from '@/components/ui/faceted'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import type { I18nKey } from '@/lib/i18n/types'
import { Briefcase01Icon, Building02Icon, Money03Icon, Search01Icon, UnfoldMoreIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useDebounce, useDebouncedCallback } from 'use-debounce'

import { RECRUITMENT_CLIENT_FILTER_PAGE_SIZE } from '../_search-params'
import { formatSalaryValue } from '../helpers'
import { useGetHighestSalary } from '../hooks/use-get-highest-salary'
import { useGetJobDescriptions } from '../hooks/use-get-job-descriptions'
import type { RecruitmentFilters } from '../types'

const getUniqueLocations = (jobDescriptions: { location?: string | null }[]) => {
  const locations = new Map<string, string>()

  jobDescriptions.forEach((job) => {
    const location = job.location?.trim()
    if (!location) return

    locations.set(location.toLowerCase(), location)
  })

  return Array.from(locations.values())
}

const baseFilters = [
  {
    key: 'location',
    id: 'recruitment-location',
    placeholderKey: 'recruitment.sidebar.groups.location.title',
    values: [],
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
  }
] as const

type FilterKey = (typeof baseFilters)[number]['key']
type MultiFilterKey = Extract<FilterKey, 'location' | 'employmentType'>
type FilterOption = {
  value: string
  label?: string
  labelKey?: I18nKey
}

type FilterSectionProps = {
  filters: RecruitmentFilters
  onFilterChange: (filters: Partial<RecruitmentFilters>) => void
  onSearchTitle: (title: string) => void
}

const toSalaryNumber = (value: unknown) => {
  const numericValue = typeof value === 'number' ? value : Number(value)

  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : 0
}

export default function FilterSection({ filters: selectedFilters, onFilterChange, onSearchTitle }: FilterSectionProps) {
  const { t, locale } = useTranslation()
  const { jobDescriptions } = useGetJobDescriptions({ pageSize: RECRUITMENT_CLIENT_FILTER_PAGE_SIZE })
  const { salary: highestSalary, isGettingHighestSalary } = useGetHighestSalary()
  const jobs = jobDescriptions.value.items
  const [draftTitle, setDraftTitle] = useState(selectedFilters.title)
  const [draftSalary, setDraftSalary] = useState<[number, number] | null>(null)
  const [debouncedTitle] = useDebounce(draftTitle, 500)
  const fallbackHighestSalary = useMemo(() => {
    return jobs.reduce((maxSalary, job) => {
      return Math.max(maxSalary, toSalaryNumber(job.salaryMin), toSalaryNumber(job.salaryMax))
    }, 0)
  }, [jobs])
  const salaryMax = Math.max(toSalaryNumber(highestSalary), fallbackHighestSalary)
  const sliderMax = salaryMax > 0 ? salaryMax : 1
  const salaryStep = salaryMax >= 1_000_000 ? 1_000_000 : 1
  const isSalarySliderDisabled = (isGettingHighestSalary && salaryMax <= 0) || salaryMax <= 0
  const selectedSalaryValue = useMemo<[number, number]>(() => {
    const nextMin = Math.min(toSalaryNumber(selectedFilters.salaryMin), salaryMax)
    const nextMax = Math.min(toSalaryNumber(selectedFilters.salaryMax) || salaryMax, salaryMax)

    return [Math.min(nextMin, nextMax), Math.max(nextMin, nextMax)]
  }, [selectedFilters.salaryMin, selectedFilters.salaryMax, salaryMax])
  const salaryValue = draftSalary ?? selectedSalaryValue
  const salaryRangeLabel = `${formatSalaryValue(salaryValue[0], t, locale)} - ${formatSalaryValue(salaryValue[1], t, locale)}`

  const debouncedApplySalaryFilter = useDebouncedCallback((value: [number, number]) => {
    const nextSalaryMin = value[0] > 0 ? value[0] : undefined
    const nextSalaryMax = value[1] < salaryMax ? value[1] : undefined

    onFilterChange({ salaryMin: nextSalaryMin, salaryMax: nextSalaryMax })
  }, 500)

  const filters = useMemo(
    () =>
      baseFilters.map((filter) => {
        if (filter.key !== 'location') return filter

        return {
          ...filter,
          values: getUniqueLocations(jobs).map((location) => ({
            value: location,
            label: location
          }))
        }
      }),
    [jobs]
  )

  useEffect(() => {
    const nextTitle = debouncedTitle.trim()

    if (nextTitle === selectedFilters.title) return

    onSearchTitle(nextTitle)
  }, [debouncedTitle, onSearchTitle, selectedFilters.title])

  const getOptionLabel = (option: FilterOption) => {
    if (option.label) return option.label
    if (option.labelKey) return t(option.labelKey)

    return option.value
  }

  const getMultiSelectLabel = (key: MultiFilterKey, options: readonly FilterOption[], placeholderKey: I18nKey) => {
    const values = selectedFilters[key]

    if (values.length === 0) return t(placeholderKey)
    if (values.length > 1) return t('dataTable.filter.selectedCount', { count: values.length })

    const selectedOption = options.find((option) => option.value === values[0])
    return selectedOption ? getOptionLabel(selectedOption) : values[0]
  }

  const handleMultiSelectChange = (key: MultiFilterKey, value: string[] | undefined) => {
    onFilterChange({ [key]: value ?? [] })
  }

  const handleSalaryChange = (value: number[]) => {
    const nextMin = Math.min(toSalaryNumber(value[0]), salaryMax)
    const nextMax = Math.min(toSalaryNumber(value[1]) || salaryMax, salaryMax)
    const nextValue: [number, number] = [Math.min(nextMin, nextMax), Math.max(nextMin, nextMax)]

    setDraftSalary(nextValue)
    debouncedApplySalaryFilter(nextValue)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSearchTitle(draftTitle.trim())
  }

  return (
    <Card className='w-full gap-0 overflow-visible rounded-3xl border border-primary/10 bg-card/95 py-0 shadow-sm shadow-primary/5 transition-shadow delay-100 duration-500 ease-out hover:shadow-md hover:shadow-primary/5'>
      <CardContent className='p-1.5'>
        <form
          onSubmit={handleSubmit}
          className='grid w-full grid-cols-1 items-center gap-2.5 md:grid-cols-2 lg:grid-cols-[minmax(220px,1.25fr)_repeat(3,minmax(145px,1fr))_auto]'
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

          {filters.map((filter) => {
            return (
              <div
                key={filter.id}
                className='flex h-9 w-full min-w-0 items-center gap-2.5 overflow-visible rounded-2xl border border-border bg-background px-1.5 transition-all delay-75 duration-500 ease-out hover:border-primary/25 hover:bg-primary/5 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-ring/15 lg:rounded-full'
              >
                <span className='flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary'>
                  <HugeiconsIcon icon={filter.icon} strokeWidth={1.8} className='size-3' />
                </span>

                <div className='grid min-w-0 max-w-full flex-1 gap-0.5 overflow-hidden'>
                  <Faceted<true>
                    multiple
                    value={selectedFilters[filter.key]}
                    onValueChange={(value) => handleMultiSelectChange(filter.key, value)}
                  >
                    <FacetedTrigger
                      id={filter.id}
                      type='button'
                      className='flex !h-5 !min-h-0 !w-full min-w-0 items-center gap-1.5 overflow-hidden rounded-none border-0 bg-transparent !p-0 text-sm leading-5 text-muted-foreground shadow-none whitespace-nowrap outline-none focus-visible:border-0 focus-visible:ring-0'
                    >
                      <span className='min-w-0 flex-1 truncate text-left'>
                        {getMultiSelectLabel(filter.key, filter.values, filter.placeholderKey)}
                      </span>
                      <HugeiconsIcon icon={UnfoldMoreIcon} className='size-4 shrink-0 opacity-50' />
                    </FacetedTrigger>

                    <FacetedContent className='w-64 border border-primary/10'>
                      <FacetedInput placeholder={t('dataTable.filter.searchOptions')} />
                      <FacetedList>
                        <FacetedEmpty>{t('dataTable.filter.noOptionsFound')}</FacetedEmpty>
                        <FacetedGroup>
                          {filter.values.map((option) => (
                            <FacetedItem key={option.value} value={option.value}>
                              <span className='truncate'>{getOptionLabel(option)}</span>
                            </FacetedItem>
                          ))}
                        </FacetedGroup>
                      </FacetedList>
                    </FacetedContent>
                  </Faceted>
                </div>
              </div>
            )
          })}

          <div className='flex h-9 w-full min-w-0 items-center gap-2.5 overflow-visible rounded-2xl border border-border bg-background px-1.5 py-2 transition-all delay-75 duration-500 ease-out hover:border-primary/25 hover:bg-primary/5 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-ring/15 lg:rounded-3xl'>
            <span className='flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary'>
              <HugeiconsIcon icon={Money03Icon} strokeWidth={1.8} className='size-3' />
            </span>

            <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
              <div className='flex min-w-0 items-center justify-between gap-1 text-sm leading-5'>
                <span className='shrink-0 text-primary'>{salaryRangeLabel}</span>
              </div>
              <div className='pr-3 pb-1'>
                <Slider
                  min={0}
                  max={sliderMax}
                  step={salaryStep}
                  value={salaryValue}
                  disabled={isSalarySliderDisabled}
                  onValueChange={handleSalaryChange}
                  className='h-2 w-full'
                  aria-label={t('recruitment.filter.salary.placeholder')}
                />
              </div>
            </div>
          </div>

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
