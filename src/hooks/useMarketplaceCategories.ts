import { useQuery } from '@tanstack/react-query'
import { marketplaceApi } from '@/services'
import type { MarketplaceCategory } from '@/types'

export const useMarketplaceCategories = () => {
  return useQuery<MarketplaceCategory[]>({
    queryKey: ['marketplace-categories'],
    queryFn: async () => {
      try {
        return await marketplaceApi.getMarketplaceCategories()
      } catch {
        return []
      } 
    },
    staleTime: 1000 * 60 * 60, // 1h
  })
}