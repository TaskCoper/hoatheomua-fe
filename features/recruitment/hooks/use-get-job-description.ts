import { useQuery } from '@tanstack/react-query'
import { jobDescriptionService } from '../services'

export const useGetJobDescriptionDetail = (id: string) => {
  const {
    data: jobDescription,
    isLoading: isLoadingJobDescription,
    isError
  } = useQuery({
    queryKey: ['jobDescription', id],
    queryFn: () => jobDescriptionService.getDescriptionById(id),
    enabled: Boolean(id),
    retry: false
  })

  return {
    jobDescription,
    isLoadingJobDescription,
    isError
  }
}
