import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { useMarketplaceStore } from '@/store'
import { marketplaceApi } from '@/services'
import type { MarketplaceItem } from '@/types'

type LocationOption = { id: string; label: string }

const formatVnd = (value: number) => {
  const rounded = Math.round(value)
  return `${new Intl.NumberFormat('vi-VN').format(rounded)}₫`
}

const mapProductTypeToKind = (productType: number): MarketplaceItem['kind'] => {
  // Backend enum:
  // 1 = PhysicalGoods  -> product
  // 2 = WorkshopTicket -> tour
  return productType === 2 ? 'tour' : 'product'
}

const useDebouncedValue = <T,>(value: T, delayMs: number) => {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs)
    return () => window.clearTimeout(t)
  }, [value, delayMs])
  return debounced
}

export const useMarketplaceItems = () => {
  const searchText = useMarketplaceStore((s) => s.searchText)
  const categoryId = useMarketplaceStore((s) => s.categoryId)
  const priceTier = useMarketplaceStore((s) => s.priceTier)
  const location = useMarketplaceStore((s) => s.location) // provinceId

  const debouncedSearchText = useDebouncedValue(searchText, 300)

  return useQuery<{
    items: MarketplaceItem[]
    locations: LocationOption[]
  }>({
    queryKey: ['marketplace-items', debouncedSearchText, categoryId, priceTier, location],
    queryFn: async () => {
        const PageNumber = 1
        const PageSize = 20
        const priceRange = (() => {
          switch (priceTier) {
            case 'free':
              return { MinPrice: undefined as number | undefined, MaxPrice: undefined as number | undefined }
            case 'premium':
              return { MinPrice: 0, MaxPrice: 500000 }
            case 'exclusive':
              return { MinPrice: 500000, MaxPrice: undefined as number | undefined }
            default:
              return { MinPrice: undefined as number | undefined, MaxPrice: undefined as number | undefined }
          }
        })()
        const baseParams = {
          SearchTerm: debouncedSearchText || undefined,
          MinPrice: priceRange.MinPrice,
          MaxPrice: priceRange.MaxPrice,
          SortBy: 'newest',
          PageNumber,
          PageSize,
        }
        // 1) Fetch items theo filter hiện tại (có ProvinceId, có CategoryId)
        const paramsForItems = {
          ...baseParams,
          CategoryId: categoryId || undefined,
          ProvinceId: location || undefined,
        }
        // 2) Fetch options theo filter hiện tại nhưng bỏ ProvinceId/CategoryId
        //    => location dropdown không bị "co lại" khi bạn chọn 1 tỉnh.
        const paramsForOptions = {
          ...baseParams,
          CategoryId: undefined,
          ProvinceId: undefined,
        }
        const [resItems, resOptions] = await Promise.all([
          marketplaceApi.getPublishedProductsForTourists(paramsForItems),
          marketplaceApi.getPublishedProductsForTourists(paramsForOptions),
        ])
        const rawItems = resItems?.items ?? []
        const rawOptionsItems = resOptions?.items ?? []
        const items: MarketplaceItem[] = rawItems.map((p, idx) => {
          const kind = mapProductTypeToKind(p.productType)
          const finalPrice = (p.promotionalPrice ?? p.price) as number
          const originalPriceText = p.promotionalPrice != null ? formatVnd(p.price) : undefined
          return {
            id: p.id,
            kind,
            badgeLabel: kind === 'tour' ? 'TOUR' : 'PRODUCT',
            title: p.name ?? '',
            description: p.description ?? '',
            priceText: formatVnd(finalPrice),
            originalPriceText,
            priceValue: finalPrice,
            location: p.provinceName ?? '',
            imageUrl: p.media?.mainImage ?? '',
            likes: 0,
            featured: idx === 0,
            categoryId: p.categoryId,
          }
        })
        const categories = (() => {
          const map = new Map<string, string>()
          for (const p of rawOptionsItems) {
            if (!p.categoryId) continue
            if (!map.has(p.categoryId)) map.set(p.categoryId, p.categoryName ?? 'Category')
          }
          return Array.from(map.entries()).map(([id, label]) => ({ id, label }))
        })()
        const locations = (() => {
          const map = new Map<string, string>()
          for (const p of rawOptionsItems) {
            if (!p.provinceId) continue
            if (!map.has(p.provinceId)) map.set(p.provinceId, p.provinceName ?? 'Location')
          }
          return Array.from(map.entries()).map(([id, label]) => ({ id, label }))
        })()
        return { items, categories, locations }
      },
    staleTime: 1000 * 60 * 60, // 1h
  })
}