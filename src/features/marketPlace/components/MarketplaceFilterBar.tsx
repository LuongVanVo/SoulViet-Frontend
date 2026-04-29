import { useMemo, useRef, useState, useEffect } from 'react'
import { Search, ChevronDown, MapPin, Wallet, Package } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useMarketplaceStore } from '@/store/marketplace/marketplaceStore'
import type { PriceTier } from '@/types'
import { useTranslation } from 'react-i18next'

type Option = { id: string; label: string }


function useClickOutside(
  ref: React.RefObject<HTMLDivElement | null>,
  onOutside: () => void,
  enabled: boolean
) {
  useEffect(() => {
    if (!enabled) return
    const handler = (e: MouseEvent) => {
      const el = ref.current
      if (!el) return
      if (e.target instanceof Node && !el.contains(e.target)) onOutside()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [ref, onOutside, enabled])
}

function Dropdown({
  label,
  valueLabel,
  icon,
  options,
  selectedId,
  onSelect,
  dropdownSearchPlaceholder,
  noResultsText,
}: {
  label: string
  valueLabel: string
  icon: React.ReactNode
  options: Option[]
  selectedId: string
  onSelect: (id: string) => void
  dropdownSearchPlaceholder: string
  noResultsText: string
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useClickOutside(ref, () => setOpen(false), open)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return options
    return options.filter((o) => o.label.toLowerCase().includes(q))
  }, [options, search])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-[56px] w-full items-center justify-between gap-3 rounded-full bg-white/90 px-5 text-sm font-semibold text-[#2b1f17] ring-1 ring-black/5 backdrop-blur-md hover:bg-white"
        aria-label={label}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-[#3c4a42]">{icon}</span>
          <span className={cn('truncate', selectedId ? 'text-[#2b1f17]' : 'text-gray-400')}>{valueLabel}</span>
        </div>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+10px)] z-50 w-full overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in duration-200">
          <div className="p-3">
            <div className="relative">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={dropdownSearchPlaceholder}
                className="h-11 w-full rounded-2xl bg-[#FEF6F1] px-4 pr-4 text-sm outline-none ring-1 ring-black/5 placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="max-h-[260px] overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-400 italic">{noResultsText}</div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onSelect(opt.id)
                    setOpen(false)
                  }}
                  className={cn(
                    'w-full rounded-2xl px-3 py-2 text-left text-sm font-medium transition-colors',
                    selectedId === opt.id ? 'bg-[#0D5C46]/10 text-[#0D5C46]' : 'hover:bg-gray-50 text-gray-700'
                  )}
                >
                  {opt.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export const MarketplaceFilterBar = ({
  categories,
  locations,
}: {
  categories: Option[]
  locations: Option[]
}) => {
  const { t } = useTranslation()

  const searchText = useMarketplaceStore((s) => s.searchText)
  const categoryId = useMarketplaceStore((s) => s.categoryId)
  const priceTier = useMarketplaceStore((s) => s.priceTier)
  const location = useMarketplaceStore((s) => s.location)

  const setSearchText = useMarketplaceStore((s) => s.setSearchText)
  const setCategoryId = useMarketplaceStore((s) => s.setCategoryId)
  const setPriceTier = useMarketplaceStore((s) => s.setPriceTier)
  const setLocation = useMarketplaceStore((s) => s.setLocation)

  const categoryLabel = t('marketplace.filters.categoryLabel')
  const priceLabel = t('marketplace.filters.priceLabel')
  const locationLabel = t('marketplace.filters.locationLabel')

  const allCategoriesLabel = t('marketplace.filters.allCategories')
  const locationDefaultLabel = t('marketplace.filters.locationDefault')

  const dropdownNoResultsText = t('marketplace.filters.noResults')
  const dropdownSearchPlaceholderForCategory = t('marketplace.filters.dropdownSearchPlaceholder', { label: categoryLabel })
  const dropdownSearchPlaceholderForPrice = t('marketplace.filters.dropdownSearchPlaceholder', { label: priceLabel })
  const dropdownSearchPlaceholderForLocation = t('marketplace.filters.dropdownSearchPlaceholder', { label: locationLabel })

  const searchPlaceholder = t('marketplace.filters.searchPlaceholder')
  const searchButtonLabel = t('marketplace.filters.searchButton')

  const PRICE_TIERS: { id: PriceTier; label: string }[] = [
    { id: 'free', label: t('marketplace.filters.priceTiers.free') },
    { id: 'premium', label: t('marketplace.filters.priceTiers.premium') },
    { id: 'exclusive', label: t('marketplace.filters.priceTiers.exclusive') },
  ]

  const categorySelectedId = categoryId ?? 'all'
  const locationSelectedId = location ?? 'any'

  const categoryOptions = useMemo(() => {
    return [{ id: 'all', label: allCategoriesLabel }, ...categories]
  }, [categories, allCategoriesLabel])

  const locationOptions = useMemo(() => {
    return [{ id: 'any', label: locationDefaultLabel }, ...locations]
  }, [locations, locationDefaultLabel])

  const categoryValueLabel = useMemo(() => {
    if (!categoryId) return allCategoriesLabel
    return categories.find((c) => c.id === categoryId)?.label ?? allCategoriesLabel
  }, [categoryId, categories, allCategoriesLabel])

  const locationValueLabel = useMemo(() => {
    if (!location) return locationDefaultLabel
    return locations.find((l) => l.id === location)?.label ?? locationDefaultLabel
  }, [location, locations, locationDefaultLabel])

  const priceValueLabel = useMemo(() => {
    return PRICE_TIERS.find((p) => p.id === priceTier)?.label ?? t('marketplace.filters.priceTiers.free')
  }, [priceTier, PRICE_TIERS, t])

  return (
    <div className="rounded-4xl bg-white/95 p-4 shadow-2xl backdrop-blur-md ring-1 ring-black/5">
      <div className="grid gap-3 md:grid-cols-[1.3fr_1fr_0.9fr_0.9fr_auto] items-end">
        <div className="space-y-1">
          <label className="block">
            <div className="flex items-center gap-3 rounded-full bg-white px-3 ring-1 ring-black/5">
              <Search className="h-5 w-5 text-gray-400 ml-3" />
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-[56px] flex-1 rounded-full bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
            </div>
          </label>
        </div>

        <Dropdown
          label={categoryLabel}
          icon={<Package className="h-4 w-4" />}
          options={categoryOptions}
          selectedId={categorySelectedId}
          valueLabel={categoryValueLabel}
          onSelect={(id) => setCategoryId(id === 'all' ? null : id)}
          dropdownSearchPlaceholder={dropdownSearchPlaceholderForCategory}
          noResultsText={dropdownNoResultsText}
        />

        <Dropdown
          label={priceLabel}
          icon={<Wallet className="h-4 w-4" />}
          options={PRICE_TIERS.map((p) => ({ id: p.id, label: p.label }))}
          selectedId={priceTier}
          valueLabel={priceValueLabel}
          onSelect={(id) => setPriceTier(id as PriceTier)}
          dropdownSearchPlaceholder={dropdownSearchPlaceholderForPrice}
          noResultsText={dropdownNoResultsText}
        />

        <Dropdown
          label={locationLabel}
          icon={<MapPin className="h-4 w-4" />}
          options={locationOptions}
          selectedId={locationSelectedId}
          valueLabel={locationValueLabel}
          onSelect={(id) => setLocation(id === 'any' ? null : id)}
          dropdownSearchPlaceholder={dropdownSearchPlaceholderForLocation}
          noResultsText={dropdownNoResultsText}
        />

        <div className="flex justify-end">
          <button
            type="button"
            className="flex h-[56px] items-center justify-center gap-2 rounded-full bg-[#0D5C46] px-6 text-sm font-semibold tracking-widest text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] w-full md:w-auto"
            aria-label={searchButtonLabel}
            onClick={() => {
              // Hook gọi API dựa vào state (đã debounce) -> không cần refetch thủ công
            }}
          >
            <Search className="h-4 w-4" />
            {searchButtonLabel}
          </button>
        </div>
      </div>
    </div>
  )
}