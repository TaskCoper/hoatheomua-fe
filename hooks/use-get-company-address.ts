import companyAddressService from '@/services/company-address.service'
import { useQuery } from '@tanstack/react-query'

export const useGetCompanyAddress = () => {
  const { data: companyAddress, isLoading: isLoadingCompanyAddress } = useQuery({
    queryKey: ['company-address'],
    queryFn: companyAddressService.getCompanyAddress
  })

  return { companyAddress, isLoadingCompanyAddress }
}
