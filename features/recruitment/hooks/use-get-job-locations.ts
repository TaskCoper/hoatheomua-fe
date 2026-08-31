import { useQuery } from '@tanstack/react-query'
import { jobDescriptionService } from '../services'

export const useGetJobLocations = () => {
  const { data: locations, isLoading: isGettingJobLocations } = useQuery({
    queryKey: ['locations'],
    queryFn: jobDescriptionService.getJobLocations
  })

  return { locations, isGettingJobLocations }
}
