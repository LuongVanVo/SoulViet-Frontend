import { useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'
import { marketplaceApi } from '@/services'

export const usePartnerNames = (partnerIds: string[]) => {
  const uniqueIds = useMemo(
    () => Array.from(new Set(partnerIds.filter(Boolean))),
    [partnerIds]
  )

  const queries = useQueries({
    queries: uniqueIds.map((id) => ({
      queryKey: ['local-partner', id],
      queryFn: () => marketplaceApi.getLocalPartnerById(id),
      staleTime: 1000 * 60 * 10,
      retry: 1,
      enabled: Boolean(id),
    })),
  })

  const partnerNameMap = useMemo(() => {
    const map: Record<string, string> = {}
    uniqueIds.forEach((id, idx) => {
      const data = queries[idx]?.data
      map[id] = data?.businessName?.trim() || `Partner ${id.slice(0, 8)}`
    })
    return map
  }, [uniqueIds, queries])

  const isLoading = queries.some((q) => q.isLoading)
  return { partnerNameMap, isLoading }
}