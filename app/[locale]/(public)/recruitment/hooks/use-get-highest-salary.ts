import { useQuery } from '@tanstack/react-query'
import { jobDescriptionService } from '../services'

export const useGetHighestSalary = () => {
  const { data: highestSalary = 10_000_000, isLoading: isGettingHighestSalary } = useQuery({
    queryKey: ['highest-salary'],
    queryFn: jobDescriptionService.getHighestSalary
  })

  return { highestSalary, isGettingHighestSalary }
}
