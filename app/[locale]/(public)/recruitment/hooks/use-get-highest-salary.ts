import { useQuery } from '@tanstack/react-query'
import { jobDescriptionService } from '../services'
export const useGetHighestSalary = () => {
  const { data: salary, isLoading: isGettingHighestSalary } = useQuery({
    queryKey: ['highest-salary'],
    queryFn: () => jobDescriptionService.getHighestSalaryJobDescription(),
    enabled: true
  })
  return { salary, isGettingHighestSalary }
}
