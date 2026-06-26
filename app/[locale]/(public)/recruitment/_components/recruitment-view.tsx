'use client'

import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { useQueryStates } from 'nuqs'
import { useMemo, useState } from 'react'

import { useGetJobDescriptions } from '../hooks/use-get-job-descriptions'
import { recruitmentSearchParsers } from '../_search-params'
import type { RecruitmentFilters } from '../types'
import FilterSection from './filter-section'
import JobDetail from './job-detail'
import JobList from './job-list'
import RecruitmentSidebar from './recruitment-sidebar'

const getSalaryParams = (salaryRange: RecruitmentFilters['salaryRange']) => {
  if (salaryRange === 'below-8') return { salaryMin: undefined, salaryMax: 8000000 }
  if (salaryRange === '8-12') return { salaryMin: 8000000, salaryMax: 12000000 }
  if (salaryRange === '12-18') return { salaryMin: 12000000, salaryMax: 18000000 }
  if (salaryRange === 'above-18') return { salaryMin: 18000000, salaryMax: undefined }

  return { salaryMin: undefined, salaryMax: undefined }
}

export default function RecruitmentView() {
  const [search, setSearch] = useQueryStates(recruitmentSearchParsers)
  const [selectedJobId, setSelectedJobId] = useState('')

  const filters: RecruitmentFilters = useMemo(
    () => ({
      title: search.q,
      location: search.location ?? undefined,
      employmentType: search.employmentType ?? undefined,
      salaryRange: search.salaryRange ?? undefined
    }),
    [search.q, search.location, search.employmentType, search.salaryRange]
  )

  const salaryParams = useMemo(() => getSalaryParams(filters.salaryRange), [filters.salaryRange])

  const { jobDescriptions, isLoadingJobDescription, isError } = useGetJobDescriptions({
    pageIndex: search.page,
    pageSize: DEFAULT_PAGE_SIZE,
    title: filters.title || undefined,
    location: filters.location,
    employmentType: filters.employmentType,
    salaryMin: salaryParams.salaryMin,
    salaryMax: salaryParams.salaryMax
  })

  const jobs = jobDescriptions.value.items
  const selectedJob = jobs.find((job) => job.id === selectedJobId) ?? jobs[0]
  const activeSelectedJobId = selectedJob?.id ?? ''

  const handleFilterChange = (nextFilters: Partial<RecruitmentFilters>) => {
    setSearch({
      ...(nextFilters.title !== undefined ? { q: nextFilters.title.length > 0 ? nextFilters.title : null } : {}),
      ...('location' in nextFilters ? { location: nextFilters.location ?? null } : {}),
      ...('employmentType' in nextFilters ? { employmentType: nextFilters.employmentType ?? null } : {}),
      ...('salaryRange' in nextFilters ? { salaryRange: nextFilters.salaryRange ?? null } : {}),
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
    <section className='mx-auto w-full max-w-8xl px-4 pb-16 sm:px-6 lg:px-8'>
      <div className='w-full space-y-6'>
        <FilterSection filters={filters} onFilterChange={handleFilterChange} onSearchTitle={handleSearchTitle} />

        <div className='grid w-full min-w-0 grid-cols-1 gap-5 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start xl:grid-cols-[250px_minmax(265px,0.68fr)_minmax(560px,1.52fr)]'>
          <RecruitmentSidebar filters={filters} onFilterChange={handleFilterChange} />
          <JobList
            jobs={jobs}
            selectedJobId={activeSelectedJobId}
            onSelectJob={setSelectedJobId}
            isLoading={isLoadingJobDescription}
            isError={isError}
            pageIndex={jobDescriptions.value.pageIndex}
            pageSize={jobDescriptions.value.pageSize}
            totalCount={jobDescriptions.value.totalCount}
            hasNextPage={jobDescriptions.value.hasNextPage}
            hasPreviousPage={jobDescriptions.value.hasPreviousPage}
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
