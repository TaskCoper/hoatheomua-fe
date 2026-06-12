'use client'

import { useState } from 'react'

import { jobs } from '../data'
import FilterSection from './filter-section'
import JobDetail from './job-detail'
import JobList from './job-list'
import RecruitmentSidebar from './recruitment-sidebar'

export default function RecruitmentView() {
  const [selectedJobId, setSelectedJobId] = useState(jobs[0]?.id ?? '')

  const selectedJob = jobs.find((job) => job.id === selectedJobId) ?? jobs[0]

  return (
    <section className='mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8'>
      <div className='w-full space-y-6'>
        <FilterSection />

        <div className='grid w-full min-w-0 grid-cols-1 gap-5 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start xl:grid-cols-[250px_minmax(330px,0.85fr)_minmax(480px,1.35fr)]'>
          <RecruitmentSidebar />
          <JobList jobs={jobs} selectedJobId={selectedJobId} onSelectJob={setSelectedJobId} />
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
