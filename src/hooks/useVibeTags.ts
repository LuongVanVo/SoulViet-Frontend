import { useQuery } from '@tanstack/react-query'
import { apiService } from '../services/mockData'


export const useVibeTags = () => {
    return useQuery({
        queryKey: ['vibeTags'],
        queryFn: apiService.getVibeTags,
        staleTime: 1000 * 60 * 5
    })
}