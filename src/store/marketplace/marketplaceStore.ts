import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PriceTier } from '@/types'

export interface MarketplaceFilterState {
  searchText: string
  categoryId: string | null
  priceTier: PriceTier
  location: string | null

  setSearchText: (value: string) => void
  setCategoryId: (value: string | null) => void
  setPriceTier: (value: PriceTier) => void
  setLocation: (value: string | null) => void

  resetFilters: () => void
}

const initialState: Omit<MarketplaceFilterState, keyof MarketplaceFilterState> = {
  searchText: '',
  categoryId: null,
  priceTier: 'free',
  location: null,

  setSearchText: () => {},
  setCategoryId: () => {},
  setPriceTier: () => {},
  setLocation: () => {},
  resetFilters: () => {},
}

export const useMarketplaceStore = create<MarketplaceFilterState>()(
  persist(
    (set) => ({
      ...initialState,
      searchText: '',
      categoryId: null,
      priceTier: 'free',
      location: null,

      setSearchText: (searchText) => set({ searchText }),
      setCategoryId: (categoryId) => set({ categoryId }),
      setPriceTier: (priceTier) => set({ priceTier }),
      setLocation: (location) => set({ location }),

      resetFilters: () =>
        set({
          searchText: '',
          categoryId: null,
          priceTier: 'free',
          location: null,
        }),
    }),
    { name: 'marketplace-filters' }
  )
)