'use client'

import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { useQueryStates } from 'nuqs'
import { useMemo, useState } from 'react'

import { RECRUITMENT_CLIENT_FILTER_PAGE_SIZE, recruitmentSearchParsers } from '../_search-params'
import { useGetJobDescriptions } from '../hooks/use-get-job-descriptions'
import type { RecruitmentFilters } from '../types'
import FilterSection from './filter-section'
import JobDetail from './job-detail'
import JobList from './job-list'

const toSalaryNumber = (value: unknown) => {
  const numericValue = typeof value === 'number' ? value : Number(value)

  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : 0
}

export default function RecruitmentView() {
  const [search, setSearch] = useQueryStates(recruitmentSearchParsers)
  const [selectedJobId, setSelectedJobId] = useState('')

  const filters: RecruitmentFilters = useMemo(
    () => ({
      title: search.q,
      location: search.location,
      employmentType: search.employmentType,
      salaryMin: search.salaryMin ?? undefined,
      salaryMax: search.salaryMax ?? undefined
    }),
    [search.q, search.location, search.employmentType, search.salaryMin, search.salaryMax]
  )

  const hasClientSideFilters =
    filters.location.length > 0 ||
    filters.employmentType.length > 0 ||
    filters.salaryMin !== undefined ||
    filters.salaryMax !== undefined

  const { jobDescriptions, isLoadingJobDescription, isError } = useGetJobDescriptions({
    pageIndex: hasClientSideFilters ? DEFAULT_PAGE_INDEX : search.page,
    pageSize: hasClientSideFilters ? RECRUITMENT_CLIENT_FILTER_PAGE_SIZE : DEFAULT_PAGE_SIZE,
    title: filters.title || undefined
  })

  const sourceJobs = jobDescriptions.value.items
  const filteredJobs = useMemo(() => {
    return sourceJobs.filter((job) => {
      const jobSalaryMin = toSalaryNumber(job.salaryMin)
      const jobSalaryMax = toSalaryNumber(job.salaryMax)
      const matchesLocation = filters.location.length === 0 || filters.location.includes(job.location)
      const matchesEmploymentType = filters.employmentType.length === 0 || filters.employmentType.includes(job.employmentType)
      const matchesSalaryMin = filters.salaryMin === undefined || Math.max(jobSalaryMin, jobSalaryMax) >= filters.salaryMin
      const matchesSalaryMax = filters.salaryMax === undefined || Math.min(jobSalaryMin, jobSalaryMax) <= filters.salaryMax

      return matchesLocation && matchesEmploymentType && matchesSalaryMin && matchesSalaryMax
    })
  }, [sourceJobs, filters.location, filters.employmentType, filters.salaryMin, filters.salaryMax])

  const jobs = useMemo(() => {
    if (!hasClientSideFilters) return filteredJobs

    const start = (search.page - 1) * DEFAULT_PAGE_SIZE
    return filteredJobs.slice(start, start + DEFAULT_PAGE_SIZE)
  }, [filteredJobs, hasClientSideFilters, search.page])

  const totalCount = hasClientSideFilters ? filteredJobs.length : jobDescriptions.value.totalCount
  const hasPreviousPage = hasClientSideFilters ? search.page > DEFAULT_PAGE_INDEX : jobDescriptions.value.hasPreviousPage
  const hasNextPage = hasClientSideFilters
    ? search.page * DEFAULT_PAGE_SIZE < filteredJobs.length
    : jobDescriptions.value.hasNextPage

  const selectedJob = jobs.find((job) => job.id === selectedJobId) ?? jobs[0]
  const activeSelectedJobId = selectedJob?.id ?? ''

  const handleFilterChange = (nextFilters: Partial<RecruitmentFilters>) => {
    setSearch({
      ...(nextFilters.title !== undefined ? { q: nextFilters.title.length > 0 ? nextFilters.title : null } : {}),
      ...('location' in nextFilters
        ? { location: nextFilters.location && nextFilters.location.length > 0 ? nextFilters.location : null }
        : {}),
      ...('employmentType' in nextFilters
        ? {
            employmentType:
              nextFilters.employmentType && nextFilters.employmentType.length > 0 ? nextFilters.employmentType : null
          }
        : {}),
      ...('salaryMin' in nextFilters ? { salaryMin: nextFilters.salaryMin ?? null } : {}),
      ...('salaryMax' in nextFilters ? { salaryMax: nextFilters.salaryMax ?? null } : {}),
      page: DEFAULT_PAGE_INDEX
    })
  }

  const handleSearchTitle = (title: string) => {
    handleFilterChange({ title })
  }

  const handlePageChange = (nextPage: number) => {
    setSearch({ page: nextPage })
  }

  return (
    <section className='mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8'>
      <div className='w-full space-y-6'>
        <FilterSection filters={filters} onFilterChange={handleFilterChange} onSearchTitle={handleSearchTitle} />

        <div
          className='grid w-full min-w-0 grid-cols-1 gap-5
    lg:grid-cols-[minmax(320px,0.7fr)_minmax(0,1.3fr)]'
        >
          {' '}
          {/* <RecruitmentSidebar filters={filters} onFilterChange={handleFilterChange} /> */}
          <JobList
            jobs={jobs}
            selectedJobId={activeSelectedJobId}
            onSelectJob={setSelectedJobId}
            isLoading={isLoadingJobDescription}
            isError={isError}
            pageIndex={search.page}
            pageSize={DEFAULT_PAGE_SIZE}
            totalCount={totalCount}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
            onPageChange={handlePageChange}
          />
          {selectedJob ? (
            <div className='w-full min-w-0 lg:col-start-2 xl:col-start-auto'>
              <JobDetail job={selectedJob} />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
