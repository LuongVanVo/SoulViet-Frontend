import { useMarketplaceCategories } from '@/hooks/useMarketplaceCategories'
import { useMarketplaceItems } from '@/hooks/useMarketplaceItems'
import { MarketplaceHeroSection } from './MarketplaceHeroSection'
import { MarketplaceProductsSection } from './MarketplaceProductsSection'
import { MarketplaceFilterBar } from './MarketplaceFilterBar'

export const MarketplaceFeature = () => {
  const { data: categories } = useMarketplaceCategories()
  const { data: productsData, isLoading: isProductsLoading } = useMarketplaceItems()

  return (
    <div className="space-y-0">
      <div className="relative">
        <MarketplaceHeroSection />

        <div className="-mt-6 relative z-10 px-4 md:px-6">
          <div className="mx-auto max-w-7xl">
            <MarketplaceFilterBar
              categories={categories ?? []}
              locations={productsData?.locations ?? []}
            />
          </div>
        </div>
      </div>

      <MarketplaceProductsSection
        items={productsData?.items ?? []}
        isLoading={isProductsLoading}
      />
    </div>
  )
}