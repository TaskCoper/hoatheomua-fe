import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { getDefaultPaginationResponse } from '@/shared/utils'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { jobsListQuery } from '../queries'
import type { Job, JobDescriptionParam } from '../types'

export const useGetJobDescriptions = ({
  pageIndex = DEFAULT_PAGE_INDEX,
  pageSize = DEFAULT_PAGE_SIZE,
  title,
  location,
  employmentType,
  salaryMin,
  salaryMax
}: Partial<JobDescriptionParam> = {}) => {
  const {
    data: jobDescriptions = getDefaultPaginationResponse<Job>(),
    isLoading: isLoadingJobDescriptions,
    isError
  } = useQuery({
    ...jobsListQuery({ pageIndex, pageSize, title, location, employmentType, salaryMin, salaryMax }),
    placeholderData: keepPreviousData
  })

  return {
    jobDescriptions,
    isLoadingJobDescriptions,
    isError
  }
}
