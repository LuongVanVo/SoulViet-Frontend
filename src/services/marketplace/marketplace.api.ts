import { apiClient } from '@/services'
import type { MarketplaceCategory } from '@/types'

export interface MarketplaceProductAttributeDto {
  id: string;
  name: string;
  optionsJson: string;
  sortOrder: number;
}

export interface MarketplaceProductVariantDto {
  id: string;
  sku: string;
  price: number;
  promotionalPrice: number | null;
  stock: number;
  attributesJson: string;
  imageUrl: string | null;
  isActive: boolean;
}

export interface PublishedMarketplaceProductDto {
  id: string
  partnerId: string
  categoryId: string
  categoryName: string
  name: string
  description: string
  price: number
  promotionalPrice: number | null
  stock: number
  provinceId: string
  provinceName: string
  productType: number // enum: 1 | 2
  isActive: boolean
  isVerifiedByAdmin: boolean
  media?: {
    mainImage?: string | null
    landImages?: string[] | null
    videoUrl?: string | null
  }
  createdAt: string

  hasVariants?: boolean;
  attributes?: MarketplaceProductAttributeDto[];
  variants?: MarketplaceProductVariantDto[];
}

export interface PublishedMarketplaceProductsResponse {
  items: PublishedMarketplaceProductDto[]
  pageNumber: number
  totalPages: number
  totalCount: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface LocalPartnerDto {
  id: string;
  userId: string;
  businessName: string;
  avatarUrl: string;
  description: string;
  partnerType: number; // enum: 1 | 2
  isAuthenticCertified: boolean;
  taxId: string;
  roles: string[]; 
}

export const marketplaceApi = {
  async getPublishedProductsForTourists(params: {
    SearchTerm?: string
    CategoryId?: string
    MinPrice?: number
    MaxPrice?: number
    ProvinceId?: string
    SortBy?: string
    PageNumber?: number
    PageSize?: number
  }): Promise<PublishedMarketplaceProductsResponse> {
    const res = await apiClient.get('/marketplace/products/tourists', { params })
    return res.data as PublishedMarketplaceProductsResponse
  },

  async getMarketplaceCategories(): Promise<MarketplaceCategory[]> {
    const res = await apiClient.get('/marketplace/categories')
    const raw: unknown = res.data

    const arr: any[] = Array.isArray(raw)
      ? raw
      : (raw as any)?.items ?? (raw as any)?.data ?? []

    return arr
      .map((c) => {
        const id = String(c?.id ?? c?.categoryId ?? '')
        const label = String(
          c?.name ?? c?.categoryName ?? c?.label ?? c?.title ?? ''
        )
        return { id, label }
      })
      .filter((x) => x.id && x.label)
  },

  async getMarketplaceProductById(id: string): Promise<PublishedMarketplaceProductDto> {
    const res = await apiClient.get(`/marketplace/products/${id}`)
    return res.data as PublishedMarketplaceProductDto
  },

  async getLocalPartnerById(id: string): Promise<LocalPartnerDto> {
    const res = await apiClient.get(`/local-partners/${id}`);
    return res.data as LocalPartnerDto;
  }
}