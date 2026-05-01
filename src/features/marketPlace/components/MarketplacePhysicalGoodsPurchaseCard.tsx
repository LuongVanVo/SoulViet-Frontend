import { useEffect, useMemo, useState } from 'react'
import { Heart, MapPin, Minus, Plus } from 'lucide-react'
import { Card } from '@/components/ui'
import type { MarketplaceProductDetailVM } from '@/hooks/useMarketplaceProductDetail'
import { useTranslation } from 'react-i18next'

const formatVnd = (value: number) => `${new Intl.NumberFormat('vi-VN').format(Math.round(value))}₫`

export interface MarketplacePhysicalAddToCartPayload {
  productId: string
  quantity: number
  note: string
  itemMetadata: {
    variantId: string | null
    selectedAttributes: Record<string, string>
  }
}

export const MarketplacePhysicalGoodsPurchaseCard = ({
  product,
  onVariantImageChange,
  onAddToCart,
}: {
  product: MarketplaceProductDetailVM
  onVariantImageChange?: (imageUrl: string | null) => void
  onAddToCart?: (payload: MarketplacePhysicalAddToCartPayload) => void
}) => {
  const { t } = useTranslation()
  const [quantity, setQuantity] = useState(1)
  const [note, setNote] = useState('')
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})

  const activeVariants = useMemo(() => product.variants.filter((v) => v.isActive), [product.variants])

  const matchedVariant = useMemo(() => {
    if (!product.hasVariants || !product.attributes.length) return undefined
    // must select all attrs before exact match
    const allSelected = product.attributes.every((a) => Boolean(selectedOptions[a.name]))
    if (!allSelected) return undefined

    return activeVariants.find((v) =>
      product.attributes.every((a) => v.attributes[a.name] === selectedOptions[a.name])
    )
  }, [product.hasVariants, product.attributes, activeVariants, selectedOptions])

  useEffect(() => {
    if (!product.hasVariants) {
      onVariantImageChange?.(null)
      return
    }
    onVariantImageChange?.(matchedVariant?.imageUrl ?? null)
  }, [product.hasVariants, matchedVariant, onVariantImageChange])

  const displayPriceText = matchedVariant
    ? formatVnd(matchedVariant.effectivePrice)
    : product.priceText

  const displayOriginalPriceText = matchedVariant
    ? (matchedVariant.promotionalPrice != null ? formatVnd(matchedVariant.price) : undefined)
    : product.originalPriceText

  const displayStock = matchedVariant ? matchedVariant.stock : product.stock
  const maxStock = Math.max(displayStock, 1)

  const increase = () => setQuantity((prev) => Math.min(prev + 1, maxStock))
  const decrease = () => setQuantity((prev) => Math.max(prev - 1, 1))

  const onSelectAttr = (attrName: string, option: string) => {
    setSelectedOptions((prev) => ({ ...prev, [attrName]: option }))
  }

  const isVariantSelectionRequired = product.hasVariants && product.attributes.length > 0
  const hasSelectedAllRequired =
    !isVariantSelectionRequired ||
    product.attributes.every((a) => Boolean(selectedOptions[a.name]))

  const canAddToCart =
    hasSelectedAllRequired &&
    (!isVariantSelectionRequired || Boolean(matchedVariant)) &&
    displayStock > 0

  const addToCartPayload: MarketplacePhysicalAddToCartPayload = {
    productId: product.id,
    quantity,
    note: note.trim(),
    itemMetadata: {
      variantId: matchedVariant?.id ?? null,
      selectedAttributes: selectedOptions,
    },
  }

  const handleAddToCart = () => {
    if (!canAddToCart) return
    onAddToCart?.(addToCartPayload)
  }

  return (
    <Card className="rounded-3xl border border-gray-100 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">{product.title}</h2>
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{product.location}</span>
          </div>
        </div>

        <button type="button" className="rounded-full border border-gray-100 p-2">
          <Heart className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5">
        <div className="flex items-end gap-2">
          <div className="text-2xl font-extrabold text-gray-900">{displayPriceText}</div>
          {displayOriginalPriceText ? (
            <div className="pb-1 text-sm text-gray-400 line-through">{displayOriginalPriceText}</div>
          ) : null}
        </div>
        <div className="mt-1 text-sm text-gray-500">
          {t('marketplace.detail.purchase.physical.inStock', { stock: displayStock })}
        </div>
      </div>

      {/* Variant selector */}
      {isVariantSelectionRequired && (
        <div className="mt-5 space-y-4">
          {product.attributes.map((attr) => (
            <div key={attr.id}>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{attr.name}</div>
              <div className="flex flex-wrap gap-2">
                {attr.options.map((opt) => {
                  const active = selectedOptions[attr.name] === opt
                  return (
                    <button
                      key={`${attr.id}-${opt}`}
                      type="button"
                      onClick={() => onSelectAttr(attr.name, opt)}
                      className={`rounded-full border px-3 py-1.5 text-sm transition ${
                        active
                          ? 'border-[#006c49] bg-[#006c49]/10 text-[#006c49]'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-[#006c49]/40'
                      }`}
                    >
                      {opt}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          {!hasSelectedAllRequired && (
            <p className="text-xs text-amber-600">
              {t('marketplace.detail.purchase.physical.warnings.selectAllAttributes')}
            </p>
          )}
          {hasSelectedAllRequired && !matchedVariant && (
            <p className="text-xs text-red-600">
              {t('marketplace.detail.purchase.physical.warnings.variantUnavailable')}
            </p>
          )}
        </div>
      )}

      <div className="mt-5 space-y-4">
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            {t('marketplace.detail.purchase.physical.quantityLabel')}
          </div>

          <div className="flex w-fit items-center rounded-2xl border border-gray-200">
            <button type="button" onClick={decrease} className="px-4 py-3 text-gray-700 hover:text-gray-900">
              <Minus className="h-4 w-4" />
            </button>

            <div className="min-w-12 text-center text-sm font-semibold">{quantity}</div>

            <button type="button" onClick={increase} className="px-4 py-3 text-gray-700 hover:text-gray-900">
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            {t('marketplace.detail.purchase.physical.noteLabel')}
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder={t('marketplace.detail.purchase.physical.notePlaceholder')}
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none"
          />
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <button
          type="button"
          disabled={!canAddToCart}
          onClick={handleAddToCart}
          className="flex h-12 w-full items-center justify-center rounded-2xl bg-[#9a442d] text-white font-extrabold hover:bg-[#742814] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('marketplace.detail.purchase.physical.addToCart')}
        </button>

        <div className="text-center text-xs text-gray-500">
          {t('marketplace.detail.purchase.securePayment')}
        </div>
      </div>
    </Card>
  )
}