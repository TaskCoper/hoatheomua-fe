'use client'

import { Spinner } from '@/components/ui/spinner'
import FilterSection from '@/features/recruitment/components/filter-section'
import JobDetail from '@/features/recruitment/components/job-detail'
import JobList from '@/features/recruitment/components/job-list'
import { useGetHighestSalary } from '@/features/recruitment/hooks/use-get-highest-salary'
import { useGetJobDescriptions } from '@/features/recruitment/hooks/use-get-job-descriptions'
import { useGetJobLocations } from '@/features/recruitment/hooks/use-get-job-locations'
import { RECRUITMENT_PAGE_SIZE, recruitmentSearchParsers } from '@/features/recruitment/search-params'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { SparkleDivider } from '@/shared/components/sparkle-dividier'
import { DEFAULT_PAGE_INDEX } from '@/shared/constants'
import { motion, type Variants } from 'motion/react'
import { useQueryStates } from 'nuqs'
import { useMemo, useState } from 'react'
import type { RecruitmentFilters } from '../types'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } }
}

const containerStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } }
}

const SALARY_MIN = 0

export default function RecruitmentView() {
  const { t } = useTranslation()
  const [search, setSearch] = useQueryStates(recruitmentSearchParsers)
  const [selectedJobId, setSelectedJobId] = useState('')

  const { locations } = useGetJobLocations()
  const { highestSalary } = useGetHighestSalary()

  const filters: RecruitmentFilters = useMemo(
    () => ({
      title: search.q,
      location: search.location ?? undefined,
      employmentType: search.employmentType ?? undefined,
      salaryMin: search.salaryMin ?? undefined,
      salaryMax: search.salaryMax ?? undefined
    }),
    [search.q, search.location, search.employmentType, search.salaryMin, search.salaryMax]
  )

  const { jobDescriptions, isLoadingJobDescriptions } = useGetJobDescriptions({
    pageIndex: search.page,
    pageSize: RECRUITMENT_PAGE_SIZE,
    title: filters.title || undefined,
    location: filters.location,
    employmentType: filters.employmentType,
    salaryMin: filters.salaryMin,
    salaryMax: filters.salaryMax
  })

  const jobs = jobDescriptions.value.items
  const selectedJob = jobs.find((job) => job.id === selectedJobId) ?? jobs[0]
  const activeSelectedJobId = selectedJob?.id ?? ''
  const hasActiveFilters =
    filters.title.trim().length > 0 ||
    filters.location !== undefined ||
    filters.employmentType !== undefined ||
    filters.salaryMin !== undefined ||
    filters.salaryMax !== undefined

  const handleFilterChange = (nextFilters: Partial<RecruitmentFilters>) => {
    setSearch({
      ...(nextFilters.title !== undefined ? { q: nextFilters.title.length > 0 ? nextFilters.title : null } : {}),
      ...('location' in nextFilters ? { location: nextFilters.location ?? null } : {}),
      ...('employmentType' in nextFilters ? { employmentType: nextFilters.employmentType ?? null } : {}),
      ...('salaryMin' in nextFilters ? { salaryMin: nextFilters.salaryMin ?? null } : {}),
      ...('salaryMax' in nextFilters ? { salaryMax: nextFilters.salaryMax ?? null } : {}),
      page: DEFAULT_PAGE_INDEX
    })
  }

  const handleSearchTitle = (title: string) => {
    handleFilterChange({ title })
  }

  const handleResetFilters = () => {
    setSearch({
      q: null,
      location: null,
      employmentType: null,
      salaryMin: null,
      salaryMax: null,
      page: DEFAULT_PAGE_INDEX
    })
  }

  const handlePageChange = (nextPage: number) => {
    setSearch({ page: nextPage })
  }

  return (
    <motion.section
      initial='hidden'
      animate='visible'
      variants={containerStagger}
      className='relative px-4 pt-4 sm:pt-6 md:pt-8 lg:pt-10'
    >
      <motion.div
        variants={fadeUp}
        className='mx-auto w-full max-w-7xl space-y-0.5 sm:space-y-1 md:space-y-1.5 lg:space-y-2'
      >
        <div className='flex items-center justify-start gap-3 sm:justify-center'>
          <SparkleDivider
            className='hidden min-w-0 max-w-96 flex-1 sm:flex'
            iconClassName='sm:size-5 md:size-6 lg:size-7'
            color='#516c6c'
          />

          <h1 className='text-center font-title text-2xl font-bold md:text-3xl lg:text-4xl'>
            {t('recruitment.hero.title')}
          </h1>

          <SparkleDivider
            className='hidden min-w-0 max-w-96 flex-1 sm:flex'
            iconClassName='sm:size-5 md:size-6 lg:size-7'
            direction='rtl'
            color='#516c6c'
          />
        </div>

        <p className='mx-auto max-w-full text-left text-xs leading-relaxed text-foreground sm:max-w-200 sm:text-center sm:text-sm'>
          {t('recruitment.hero.description')}
        </p>
      </motion.div>

      <motion.div variants={fadeUp} className='mx-auto mt-6 w-full max-w-7xl space-y-6 lg:mt-10'>
        <FilterSection
          filters={filters}
          locations={locations ?? []}
          salaryMin={SALARY_MIN}
          salaryMax={highestSalary}
          hasActiveFilters={hasActiveFilters}
          onFilterChange={handleFilterChange}
          onSearchTitle={handleSearchTitle}
          onResetFilters={handleResetFilters}
        />

        <div className='grid w-full min-w-0 grid-cols-12 gap-4'>
          {isLoadingJobDescriptions ? (
            <Spinner />
          ) : jobs.length === 0 ? (
            <section className='w-full min-w-0 space-y-4 col-span-12 h-96'>
              <p className='text-center mt-10 text-sm text-muted-foreground'>{t('dataTable.table.noResults')}</p>
            </section>
          ) : (
            <>
              <div className='col-span-12 lg:col-span-4'>
                <JobList
                  jobs={jobs}
                  selectedJobId={activeSelectedJobId}
                  onSelectJob={setSelectedJobId}
                  isLoading={isLoadingJobDescriptions}
                  pageIndex={jobDescriptions.value.pageIndex}
                  pageSize={jobDescriptions.value.pageSize}
                  totalCount={jobDescriptions.value.totalCount}
                  hasNextPage={jobDescriptions.value.hasNextPage}
                  hasPreviousPage={jobDescriptions.value.hasPreviousPage}
                  onPageChange={handlePageChange}
                />
              </div>

              {selectedJob ? (
                <div className='w-full min-w-0 col-span-12 lg:col-span-8'>
                  <JobDetail job={selectedJob} />
                </div>
              ) : null}
            </>
          )}
        </div>
      </motion.div>
    </motion.section>
  )
}
