import { useQuery } from '@tanstack/react-query'
import { jobDescriptionService } from '../services'

export const useGetJobDescription = ({ slug }: { slug: string }) => {
  const {
    data: jobDescription,
    isLoading: isLoadingJobDescription,
    isError
  } = useQuery({
    queryKey: ['job-description', slug],
    queryFn: () => jobDescriptionService.getDescription({ slug }),
    enabled: !!slug
  })

  return {
    jobDescription,
    isLoadingJobDescription,
    isError
  }
}
