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
import { motion, type Variants } from 'motion/react'
import { createSerializer } from 'nuqs'
import { useEffect, useRef } from 'react'
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

const serializeRecruitmentSearch = createSerializer(recruitmentSearchParsers)

/**
 * Presentational body of the recruitment page. Filters and the current page arrive
 * as props (not read from the URL here), so this can be rendered both by the
 * interactive `RecruitmentView` (nuqs-driven) and by the server-side
 * `RecruitmentDefaultView` fallback. Job data comes from `useGetJobDescriptions`,
 * which reads the route's prefetched React Query cache - so page 1 with no filters
 * renders real HTML on the server. Job selection stays local state; it isn't in the URL.
 */
export default function RecruitmentListView({
  filters,
  page,
  selectedSlug,
  onFilterChange,
  onSearchTitle,
  onResetFilters,
  onPageChange,
  onSelectJob
}: {
  filters: RecruitmentFilters
  page: number
  selectedSlug: string | null
  onFilterChange: (next: Partial<RecruitmentFilters>) => void
  onSearchTitle: (title: string) => void
  onResetFilters: () => void
  onPageChange: (page: number) => void
  onSelectJob: (slug: string) => void
}) {
  const { t } = useTranslation()
  const detailPaneRef = useRef<HTMLDivElement | null>(null)

  const { locations } = useGetJobLocations()
  const { highestSalary } = useGetHighestSalary()

  const { jobDescriptions, isLoadingJobDescriptions } = useGetJobDescriptions({
    pageIndex: page,
    pageSize: RECRUITMENT_PAGE_SIZE,
    title: filters.title || undefined,
    location: filters.location,
    employmentType: filters.employmentType,
    salaryMin: filters.salaryMin,
    salaryMax: filters.salaryMax
  })

  const jobs = jobDescriptions.value.items
  // Selection lives in the URL (`?job=slug`); fall back to the first result so the
  // right pane is never empty. Matching by slug keeps the value shareable and
  // consistent with the canonical `/recruitment/[slug]` SEO page.
  const selectedJob = jobs.find((job) => job.slug === selectedSlug) ?? jobs[0]
  const activeSelectedSlug = selectedJob?.slug ?? ''

  // On narrow screens the detail sits below the list, so bring it into view when
  // the user taps a card. Desktop keeps both panes visible, so no scrolling there.
  useEffect(() => {
    if (!selectedSlug || typeof window === 'undefined') return
    if (!window.matchMedia('(max-width: 1023px)').matches) return
    detailPaneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [selectedSlug])

  const hasActiveFilters =
    filters.title.trim().length > 0 ||
    filters.location !== undefined ||
    filters.employmentType !== undefined ||
    filters.salaryMin !== undefined ||
    filters.salaryMax !== undefined

  // Real URL for a given page, carrying the active filters so an opened-in-new-tab
  // link lands on the same filtered view. Defaults (empty query, page 1) serialize
  // away. `onClick` still handles the fast in-app transition for plain clicks.
  const pageHref = (nextPage: number) =>
    serializeRecruitmentSearch({
      q: filters.title.trim().length > 0 ? filters.title : null,
      location: filters.location ?? null,
      employmentType: filters.employmentType ?? null,
      salaryMin: filters.salaryMin ?? null,
      salaryMax: filters.salaryMax ?? null,
      page: nextPage
    })

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
          onFilterChange={onFilterChange}
          onSearchTitle={onSearchTitle}
          onResetFilters={onResetFilters}
        />

        {isLoadingJobDescriptions ? (
          <div className='grid min-h-96 place-items-center'>
            <Spinner />
          </div>
        ) : jobs.length === 0 ? (
          <section className='h-96 w-full min-w-0'>
            <p className='mt-10 text-center text-sm text-muted-foreground'>{t('dataTable.table.noResults')}</p>
          </section>
        ) : (
          /* LinkedIn-style master/detail. On lg+ the row is capped to the viewport
             and each pane scrolls on its own; below that it stacks and the page
             scrolls normally. */
          <div className='grid w-full min-w-0 grid-cols-12 gap-4 lg:h-[calc(100dvh-11rem)]'>
            <div className='col-span-12 lg:col-span-4 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pr-1'>
              <JobList
                jobs={jobs}
                selectedSlug={activeSelectedSlug}
                onSelectJob={onSelectJob}
                isLoading={isLoadingJobDescriptions}
                pageIndex={jobDescriptions.value.pageIndex}
                pageSize={jobDescriptions.value.pageSize}
                totalCount={jobDescriptions.value.totalCount}
                hasNextPage={jobDescriptions.value.hasNextPage}
                hasPreviousPage={jobDescriptions.value.hasPreviousPage}
                onPageChange={onPageChange}
                pageHref={pageHref}
              />
            </div>

            {selectedJob ? (
              <div
                ref={detailPaneRef}
                className='col-span-12 w-full min-w-0 scroll-mt-24 lg:col-span-8 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pl-1'
              >
                {/* `detailHref` renders a crawlable, shareable button beside the apply
                    CTA that links to the job's own SEO page. Only passed here in the
                    master-detail view - the detail page itself omits it. */}
                <JobDetail job={selectedJob} detailHref={`/recruitment/${selectedJob.slug}`} />
              </div>
            ) : null}
          </div>
        )}
      </motion.div>
    </motion.section>
  )
}
