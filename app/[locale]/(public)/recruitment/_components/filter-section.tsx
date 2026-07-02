import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Briefcase01Icon, Building02Icon, Cancel01Icon, Money03Icon, Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useDebounce } from 'use-debounce'

import { formatCurrency } from '../helpers'
import type { RecruitmentFilters } from '../types'

type FilterSectionProps = {
  filters: RecruitmentFilters
  locations: string[]
  salaryMin: number
  salaryMax: number
  hasActiveFilters: boolean
  onFilterChange: (filters: Partial<RecruitmentFilters>) => void
  onSearchTitle: (title: string) => void
  onResetFilters: () => void
}

const employmentTypeOptions = [
  { value: 'fullTime', labelKey: 'recruitment.filter.employmentType.options.fullTime' },
  { value: 'partTime', labelKey: 'recruitment.filter.employmentType.options.partTime' }
] as const

export default function FilterSection({
  filters: selectedFilters,
  locations,
  salaryMin,
  salaryMax,
  hasActiveFilters,
  onFilterChange,
  onSearchTitle,
  onResetFilters
}: FilterSectionProps) {
  const { t } = useTranslation()
  const [draftTitle, setDraftTitle] = useState(selectedFilters.title)
  const [debouncedTitle] = useDebounce(draftTitle, 500)

  useEffect(() => {
    if (debouncedTitle !== draftTitle) return

    const nextTitle = debouncedTitle.trim()

    if (nextTitle === selectedFilters.title) return

    onSearchTitle(nextTitle)
  }, [debouncedTitle, draftTitle, onSearchTitle, selectedFilters.title])

  const currentSalary = useMemo<[number, number]>(
    () => [selectedFilters.salaryMin ?? salaryMin, selectedFilters.salaryMax ?? salaryMax],
    [selectedFilters.salaryMin, selectedFilters.salaryMax, salaryMin, salaryMax]
  )

  const [draftSalary, setDraftSalary] = useState<[number, number]>(currentSalary)
  const [draftSalarySource, setDraftSalarySource] = useState<[number, number]>(currentSalary)

  if (draftSalarySource[0] !== currentSalary[0] || draftSalarySource[1] !== currentSalary[1]) {
    setDraftSalarySource(currentSalary)
    setDraftSalary(currentSalary)
  }

  const hasSalaryFilter = selectedFilters.salaryMin !== undefined || selectedFilters.salaryMax !== undefined

  const salaryLabel = hasSalaryFilter
    ? `${formatCurrency(currentSalary[0])} - ${formatCurrency(currentSalary[1])}`
    : t('recruitment.filter.salary.placeholder')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSearchTitle(draftTitle.trim())
  }

  const handleLocationChange = (value: string) => {
    onFilterChange({ location: value === 'all' ? undefined : value })
  }

  const handleEmploymentTypeChange = (value: string) => {
    onFilterChange({ employmentType: value === 'all' ? undefined : value })
  }

  const clampSalary = (min: number, max: number): [number, number] => {
    const clampedMin = Math.min(Math.max(min, salaryMin), salaryMax)
    const clampedMax = Math.min(Math.max(max, salaryMin), salaryMax)
    return clampedMin > clampedMax ? [clampedMax, clampedMax] : [clampedMin, clampedMax]
  }

  const handleSalaryInputChange = (index: 0 | 1, raw: string) => {
    const parsed = Number(raw)
    if (raw === '' || Number.isNaN(parsed)) return
    setDraftSalary((prev) => {
      const next: [number, number] = index === 0 ? [parsed, prev[1]] : [prev[0], parsed]
      return clampSalary(next[0], next[1])
    })
  }

  const handleSalaryCommit = (value: number[]) => {
    const [min, max] = clampSalary(value[0], value[1])
    onFilterChange({
      salaryMin: min > salaryMin ? min : undefined,
      salaryMax: max < salaryMax ? max : undefined
    })
  }

  const handleResetFilters = () => {
    setDraftTitle('')
    setDraftSalary([salaryMin, salaryMax])
    setDraftSalarySource([salaryMin, salaryMax])
    onResetFilters()
  }

  const salaryStep = Math.max(1, Math.round((salaryMax - salaryMin) / 100))

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

          <div className='flex h-9 w-full min-w-0 items-center gap-2.5 overflow-visible rounded-2xl border border-border bg-background px-1.5 transition-all delay-75 duration-500 ease-out hover:border-primary/25 hover:bg-primary/5 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-ring/15 lg:rounded-full'>
            <span className='flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary'>
              <HugeiconsIcon icon={Building02Icon} strokeWidth={1.8} className='size-3' />
            </span>

            <div className='grid min-w-0 max-w-full flex-1 gap-0.5 overflow-hidden'>
              <Select value={selectedFilters.location ?? 'all'} onValueChange={handleLocationChange}>
                <SelectTrigger
                  id='recruitment-location'
                  className='!h-5 !min-h-0 !w-full min-w-0 gap-1.5 overflow-hidden rounded-none border-0 bg-transparent !p-0 text-sm leading-5 text-muted-foreground shadow-none whitespace-nowrap focus-visible:border-0 focus-visible:ring-0 data-[size=default]:!h-5 data-[size=sm]:!h-5 *:data-[slot=select-value]:min-w-0 *:data-[slot=select-value]:truncate [&_svg]:ml-1 [&_svg]:size-4 [&_svg]:shrink-0'
                >
                  <SelectValue placeholder={t('recruitment.sidebar.groups.location.title')} />
                </SelectTrigger>

                <SelectContent className='border border-primary/10'>
                  <SelectItem value='all'>{t('recruitment.sidebar.groups.location.title')}</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='flex h-9 w-full min-w-0 items-center gap-2.5 overflow-visible rounded-2xl border border-border bg-background px-1.5 transition-all delay-75 duration-500 ease-out hover:border-primary/25 hover:bg-primary/5 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-ring/15 lg:rounded-full'>
            <span className='flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary'>
              <HugeiconsIcon icon={Briefcase01Icon} strokeWidth={1.8} className='size-3' />
            </span>

            <div className='grid min-w-0 max-w-full flex-1 gap-0.5 overflow-hidden'>
              <Select value={selectedFilters.employmentType ?? 'all'} onValueChange={handleEmploymentTypeChange}>
                <SelectTrigger
                  id='recruitment-employment-type'
                  className='!h-5 !min-h-0 !w-full min-w-0 gap-1.5 overflow-hidden rounded-none border-0 bg-transparent !p-0 text-sm leading-5 text-muted-foreground shadow-none whitespace-nowrap focus-visible:border-0 focus-visible:ring-0 data-[size=default]:!h-5 data-[size=sm]:!h-5 *:data-[slot=select-value]:min-w-0 *:data-[slot=select-value]:truncate [&_svg]:ml-1 [&_svg]:size-4 [&_svg]:shrink-0'
                >
                  <SelectValue placeholder={t('recruitment.filter.employmentType.placeholder')} />
                </SelectTrigger>

                <SelectContent className='border border-primary/10'>
                  <SelectItem value='all'>{t('recruitment.filter.employmentType.placeholder')}</SelectItem>
                  {employmentTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {t(option.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <button
                type='button'
                id='recruitment-salary'
                className='flex h-9 w-full min-w-0 items-center gap-2.5 overflow-visible rounded-2xl border border-border bg-background px-1.5 text-left transition-all delay-75 duration-500 ease-out hover:border-primary/25 hover:bg-primary/5 focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring/15 focus-visible:outline-none lg:rounded-full'
              >
                <span className='flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary'>
                  <HugeiconsIcon icon={Money03Icon} strokeWidth={1.8} className='size-3' />
                </span>
                <span className='min-w-0 flex-1 truncate text-sm leading-5 text-muted-foreground'>{salaryLabel}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent align='start' className='w-72 gap-3'>
              <div className='grid grid-cols-2 items-end gap-2'>
                <label className='flex flex-col gap-1 text-xs text-muted-foreground'>
                  {t('recruitment.filter.salary.min')}
                  <Input
                    type='number'
                    inputMode='numeric'
                    min={salaryMin}
                    max={draftSalary[1]}
                    value={draftSalary[0]}
                    onChange={(event) => handleSalaryInputChange(0, event.target.value)}
                    onBlur={() => handleSalaryCommit(draftSalary)}
                    className='h-8 text-sm'
                  />
                </label>
                <label className='flex flex-col gap-1 text-xs text-muted-foreground'>
                  {t('recruitment.filter.salary.max')}
                  <Input
                    type='number'
                    inputMode='numeric'
                    min={draftSalary[0]}
                    max={salaryMax}
                    value={draftSalary[1]}
                    onChange={(event) => handleSalaryInputChange(1, event.target.value)}
                    onBlur={() => handleSalaryCommit(draftSalary)}
                    className='h-8 text-sm'
                  />
                </label>
              </div>
              <Slider
                min={salaryMin}
                max={salaryMax}
                step={salaryStep}
                value={draftSalary}
                onValueChange={(value) => setDraftSalary([value[0], value[1]] as [number, number])}
                onValueCommit={handleSalaryCommit}
              />
              <div className='flex items-center justify-between text-[10px] text-muted-foreground'>
                <span>{formatCurrency(salaryMin)}</span>
                <span>{formatCurrency(salaryMax)}</span>
              </div>
            </PopoverContent>
          </Popover>

          <div className='flex w-full flex-col gap-2 md:col-span-2 md:w-auto md:flex-row lg:col-span-1'>
            {hasActiveFilters ? (
              <Button
                type='button'
                variant='outline'
                onClick={handleResetFilters}
                className='w-auto transform-gpu rounded-2xl text-sm transition-all duration-500 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] md:w-auto lg:rounded-full'
              >
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.8} className='size-3' />
                {t('recruitment.filter.reset')}
              </Button>
            ) : null}

            <Button
              type='submit'
              className='w-auto transform-gpu rounded-2xl text-sm transition-all duration-500 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] lg:min-w-28 lg:rounded-full'
            >
              <HugeiconsIcon icon={Search01Icon} strokeWidth={1.8} className='size-3' />
              {t('recruitment.filter.search')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
