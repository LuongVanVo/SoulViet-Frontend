import { useQuery } from '@tanstack/react-query'
import { apiService } from '../services/mockData'

export const useTouristAttractions = () => {
  return useQuery({
    queryKey: ['touristAttractions'],
    queryFn: apiService.getTouristAttractionsCards,
    staleTime: 1000 * 60 * 5
  })
}