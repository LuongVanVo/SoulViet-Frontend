import { useQuery } from '@tanstack/react-query'
import { apiService } from '@/services/mockData'

export const useCraftSection = () => {
  return useQuery({
    queryKey: ['craftSection'],
    queryFn: apiService.getCraftSection,
    staleTime: 1000 * 60 * 5
  })
}