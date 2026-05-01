import { useEffect, useMemo, useRef, useState } from 'react'
import { Heart } from 'lucide-react'
import { Card } from '@/components/ui'
import type { MarketplaceProductDetailVM } from '@/hooks/useMarketplaceProductDetail'
import { useMarketplaceProductDetail } from '@/hooks/useMarketplaceProductDetail'
import { MarketplacePhysicalGoodsPurchaseCard, type MarketplacePhysicalAddToCartPayload } from './MarketplacePhysicalGoodsPurchaseCard'
import { MarketplaceTourPurchaseCard, type MarketplaceTourAddToCartPayload } from './MarketplaceTourPurchaseCard'
import { MarketplaceLocalPartnerCard } from './MarketplaceLocalPartnerCard'
import { useTranslation } from 'react-i18next'
import { useAddToCart } from '@/hooks/useCartMutations'
import { flyToCart } from '@/utils/cartFly'

const MAX_THUMBS = 5

export const MarketplaceProductDetailFeature = ({ productId }: { productId: string }) => {
  const { t } = useTranslation()
  const { data, isLoading } = useMarketplaceProductDetail(productId)
  const [activeIndex, setActiveIndex] = useState(0)
  const [showAllPhotos, setShowAllPhotos] = useState(false)
  const [selectedVariantImage, setSelectedVariantImage] = useState<string | null>(null)
  const { mutateAsync: addToCartAsync } = useAddToCart()
  const mainImageRef = useRef<HTMLImageElement | null>(null)

  const product: MarketplaceProductDetailVM | undefined = data

  const images = product?.images ?? []
  const visibleImages = useMemo(() => {
    if (showAllPhotos) return images
    return images.slice(0, MAX_THUMBS)
  }, [images, showAllPhotos])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [productId])

  useEffect(() => {
    setActiveIndex(0)
    setShowAllPhotos(false)
    setSelectedVariantImage(null)
  }, [productId])

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="rounded-3xl border border-gray-100 bg-white p-6">
          {t('marketplace.detail.loading')}
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="rounded-3xl border border-gray-100 bg-white p-6">
          {t('marketplace.detail.notFound')}
        </div>
      </div>
    )
  }

  const isTour = product.productType === 2
  const mainImage = selectedVariantImage ?? images[activeIndex] ?? images[0] ?? ''
  const partner = product.partner ?? {
    id: '',
    name: t('marketplace.detail.partner.defaultName'),
    subtitle: t('marketplace.detail.partner.defaultSubtitle'),
    avatarUrl:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=240&q=80',
    description: '',
  }

  

  const handleAddToCart = async (payload: MarketplacePhysicalAddToCartPayload) => {
    const metadata = {
      selectedAttributes: payload.itemMetadata.selectedAttributes,
      note: payload.note || '',
    }

    await addToCartAsync({
      marketplaceProductId: payload.productId,
      quantity: payload.quantity,
      variantId: payload.itemMetadata.variantId,
      itemMetadata: JSON.stringify(metadata),
    });

    flyToCart(mainImageRef.current, selectedVariantImage ?? images[activeIndex] ?? images[0] ?? null);
  }

  const handleAddTourToCart = async (payload: MarketplaceTourAddToCartPayload) => {
    await addToCartAsync({
      marketplaceProductId: payload.productId,
      quantity: payload.quantity,
      variantId: null,
      itemMetadata: JSON.stringify(payload.itemMetadata),
    })

    flyToCart(mainImageRef.current, selectedVariantImage ?? images[activeIndex] ?? images[0] ?? null)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-gray-500">
          {t('marketplace.detail.breadcrumb.home')} / {t('marketplace.detail.breadcrumb.marketplace')} /{' '}
          <span className="font-semibold text-gray-800">{product.categoryName}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Heart className="h-4 w-4" />
          <span>{t('marketplace.detail.saved')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <Card className="overflow-hidden rounded-3xl border border-gray-100 bg-white">
            {mainImage ? (
              <div className="relative">
                <img ref={mainImageRef} src={mainImage} alt={product.title} className="h-[420px] w-full object-cover" />
              </div>
            ) : (
              <div className="h-[420px] bg-gray-100" />
            )}

            {images.length > 0 && (
              <div className="border-t border-gray-100 p-4">
                <div className="flex items-center gap-3 overflow-x-auto">
                  {visibleImages.map((src, idx) => {
                    const isActive = idx === activeIndex

                    return (
                      <button
                        key={`${src}-${idx}`}
                        type="button"
                        className={`h-20 w-20 overflow-hidden rounded-2xl border ${
                          isActive ? 'border-[#006c49]' : 'border-gray-100'
                        }`}
                        onClick={() => {
                          setSelectedVariantImage(null)
                          setActiveIndex(idx)
                        }}
                      >
                        <img src={src} alt={`thumb-${idx}`} className="h-full w-full object-cover" />
                      </button>
                    )
                  })}

                  {images.length > MAX_THUMBS && !showAllPhotos && (
                    <button
                      type="button"
                      className="h-20 w-20 shrink-0 rounded-2xl border border-gray-100 bg-gray-50 text-xs font-semibold text-gray-700"
                      onClick={() => setShowAllPhotos(true)}
                    >
                      {t('marketplace.detail.gallery.showAll')}
                    </button>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>

        <div className="lg:sticky lg:top-20">
          {isTour ? (
            <MarketplaceTourPurchaseCard product={product} onAddToCart={handleAddTourToCart} />
          ) : (
            <MarketplacePhysicalGoodsPurchaseCard 
            product={product} 
            onVariantImageChange={setSelectedVariantImage}
            onAddToCart={handleAddToCart}
            />
          )}
        </div>
      </div>

        {/* Partner info + About */}
        <div className="mt-8 space-y-5">
        <MarketplaceLocalPartnerCard
            name={partner.name}
            subtitle={partner.subtitle}
            avatarUrl={partner.avatarUrl}
            onChatClick={() => {
            // TODO: integrate chat flow later
            }}
        />

        <div className="rounded-3xl border border-gray-100 bg-white p-5">
            <h3 className="text-lg font-extrabold text-gray-900">
            {isTour ? t('marketplace.detail.about.experienceTitle') : t('marketplace.detail.about.productTitle')}
            </h3>

            <p className="mt-3 text-sm leading-6 text-gray-700 line-clamp-6">{product.description}</p>

            <button type="button" className="mt-3 text-sm font-extrabold text-[#006c49] hover:underline">
            {t('marketplace.detail.about.showMore')}
            </button>
        </div>
        </div>
    </div>
  )
}