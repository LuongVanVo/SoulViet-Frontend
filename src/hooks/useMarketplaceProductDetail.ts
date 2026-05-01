import { useQuery } from '@tanstack/react-query'
import { marketplaceApi } from '@/services/marketplace/marketplace.api'
import type {
  LocalPartnerDto,
  PublishedMarketplaceProductDto,
  MarketplaceProductAttributeDto,
  MarketplaceProductVariantDto,
} from '@/services/marketplace/marketplace.api'

type VariantAttributes = Record<string, string>

export interface MarketplaceAttributeVM {
  id: string
  name: string
  options: string[]
  sortOrder: number
}

export interface MarketplaceVariantVM {
  id: string
  sku: string
  price: number
  promotionalPrice: number | null
  effectivePrice: number
  stock: number
  attributes: VariantAttributes
  imageUrl: string | null
  isActive: boolean
}

export interface MarketplaceProductDetailVM {
  id: string
  kind: 'tour' | 'product'
  categoryName: string
  title: string
  description: string
  location: string
  productType: number

  price: number
  promotionalPrice: number | null
  priceText: string
  originalPriceText?: string

  stock: number
  images: string[]
  videoUrl?: string | null

  // NEW variant model
  hasVariants: boolean
  attributes: MarketplaceAttributeVM[]
  variants: MarketplaceVariantVM[]

  partner: {
    id: string
    name: string
    subtitle: string
    avatarUrl: string
    description: string
  }
}

const DEFAULT_PARTNER_AVATAR =
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=240&q=80'

const formatVnd = (value: number) => `${new Intl.NumberFormat('vi-VN').format(Math.round(value))}₫`

const parseJsonSafe = <T>(value: string | null | undefined, fallback: T): T => {
  try {
    return value ? (JSON.parse(value) as T) : fallback
  } catch {
    return fallback
  }
}

const mapAttributes = (attrs?: MarketplaceProductAttributeDto[]): MarketplaceAttributeVM[] => {
  if (!attrs?.length) return []
  return [...attrs]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((a) => ({
      id: a.id,
      name: a.name,
      options: parseJsonSafe<string[]>(a.optionsJson, []),
      sortOrder: a.sortOrder,
    }))
}

const mapVariants = (variants?: MarketplaceProductVariantDto[]): MarketplaceVariantVM[] => {
  if (!variants?.length) return []
  return variants.map((v) => ({
    id: v.id,
    sku: v.sku,
    price: v.price,
    promotionalPrice: v.promotionalPrice,
    effectivePrice: v.promotionalPrice ?? v.price,
    stock: v.stock,
    attributes: parseJsonSafe<VariantAttributes>(v.attributesJson, {}),
    imageUrl: v.imageUrl ?? null,
    isActive: v.isActive,
  }))
}

const pickLowestActiveVariant = (variants: MarketplaceVariantVM[]) => {
  const active = variants.filter((v) => v.isActive)
  if (!active.length) return undefined
  return [...active].sort((a, b) => a.effectivePrice - b.effectivePrice)[0]
}

const mapDtoToVm = (
  p: PublishedMarketplaceProductDto,
  partner: LocalPartnerDto | undefined
): MarketplaceProductDetailVM => {
  const kind = p.productType === 2 ? 'tour' : 'product'
  const attributes = mapAttributes(p.attributes)
  const variants = mapVariants(p.variants)
  const hasVariants = Boolean(p.hasVariants && variants.length)

  const lowestVariant = hasVariants ? pickLowestActiveVariant(variants) : undefined

  // Price strategy:
  // - has variants => show lowest active variant price
  // - no variants => show product-level price
  const finalPrice = lowestVariant ? lowestVariant.effectivePrice : (p.promotionalPrice ?? p.price)
  const originalPriceText =
    lowestVariant
      ? (lowestVariant.promotionalPrice != null ? formatVnd(lowestVariant.price) : undefined)
      : (p.promotionalPrice != null ? formatVnd(p.price) : undefined)

  // Images strategy:
  // - if lowest variant has image => prioritize it
  const mainImage = p.media?.mainImage ?? null
  const landImages = p.media?.landImages ?? []
  const primaryImage = lowestVariant?.imageUrl ?? mainImage
  const images: string[] = [primaryImage, ...landImages].filter((x): x is string => Boolean(x))

  const roleText =
    Array.isArray(partner?.roles) && partner.roles.length ? partner.roles.join(', ') : 'Local Partner'
  const certText = partner?.isAuthenticCertified ? 'Authentic certified' : ''
  const typeText = partner?.partnerType === 1 ? 'Specialties & Tours' : 'Tour Provider'
  const subtitle = [roleText, certText, typeText].filter(Boolean).join(' · ')

  return {
    id: p.id,
    kind,
    categoryName: p.categoryName ?? '',
    title: p.name ?? '',
    description: p.description ?? '',
    location: p.provinceName ?? '',
    productType: p.productType,

    price: p.price,
    promotionalPrice: p.promotionalPrice,
    priceText: formatVnd(finalPrice),
    originalPriceText,

    stock: p.stock ?? 0,
    images,
    videoUrl: p.media?.videoUrl ?? null,

    hasVariants,
    attributes,
    variants,

    partner: {
      id: partner?.id ?? p.partnerId ?? '',
      name: partner?.businessName?.trim() || 'Local Partner',
      subtitle: subtitle || 'Trusted partner',
      avatarUrl: (partner?.avatarUrl ?? '').trim() || DEFAULT_PARTNER_AVATAR,
      description: partner?.description ?? '',
    },
  }
}

export const useMarketplaceProductDetail = (productId?: string) => {
  return useQuery<MarketplaceProductDetailVM>({
    queryKey: ['marketplace-product-detail', productId],
    enabled: Boolean(productId),
    queryFn: async () => {
      const dto = await marketplaceApi.getMarketplaceProductById(productId!)

      let partner: LocalPartnerDto | undefined
      try {
        if (dto.partnerId) partner = await marketplaceApi.getLocalPartnerById(dto.partnerId)
      } catch {
        // keep detail page alive if partner API fails
      }

      return mapDtoToVm(dto, partner)
    },
  })
}