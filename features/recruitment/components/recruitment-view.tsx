'use client'

import RecruitmentListView from '@/features/recruitment/components/recruitment-list-view'
import { recruitmentSearchParsers } from '@/features/recruitment/search-params'
import { DEFAULT_PAGE_INDEX } from '@/shared/constants'
import { useQueryStates } from 'nuqs'
import { useMemo } from 'react'
import type { RecruitmentFilters } from '../types'

/**
 * Interactive recruitment page: reads filters and the current page from the URL
 * (nuqs) and drives them. Because it reads search params it can't be
 * server-rendered — Next shows the `RecruitmentDefaultView` fallback in the
 * static/ISR HTML, then this swaps in over identical markup once the client hydrates.
 */
export default function RecruitmentView() {
  const [search, setSearch] = useQueryStates(recruitmentSearchParsers)

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

  const handleFilterChange = (nextFilters: Partial<RecruitmentFilters>) => {
    setSearch({
      ...(nextFilters.title !== undefined ? { q: nextFilters.title.length > 0 ? nextFilters.title : null } : {}),
      ...('location' in nextFilters ? { location: nextFilters.location ?? null } : {}),
      ...('employmentType' in nextFilters ? { employmentType: nextFilters.employmentType ?? null } : {}),
      ...('salaryMin' in nextFilters ? { salaryMin: nextFilters.salaryMin ?? null } : {}),
      ...('salaryMax' in nextFilters ? { salaryMax: nextFilters.salaryMax ?? null } : {}),
      // The open job likely isn't in the new result set — drop it so the list
      // auto-selects the first match of the filtered page.
      job: null,
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
      job: null,
      page: DEFAULT_PAGE_INDEX
    })
  }

  const handlePageChange = (nextPage: number) => {
    setSearch({ page: nextPage, job: null })
  }

  const handleSelectJob = (slug: string) => {
    setSearch({ job: slug })
  }

  return (
    <RecruitmentListView
      filters={filters}
      page={search.page}
      selectedSlug={search.job}
      onFilterChange={handleFilterChange}
      onSearchTitle={handleSearchTitle}
      onResetFilters={handleResetFilters}
      onPageChange={handlePageChange}
      onSelectJob={handleSelectJob}
    />
  )
}
