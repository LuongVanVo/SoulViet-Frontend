import { useQuery } from "@tanstack/react-query";
import { marketplaceApi } from "@/services/marketplace/marketplace.api";
import type { LocalPartnerDto, PublishedMarketplaceProductDto } from "@/services/marketplace/marketplace.api";

export interface MarketplaceProductDetailVM {
  id: string;
  kind: "tour" | "product";
  categoryName: string;
  title: string;
  description: string;
  location: string;

  productType: number;

  price: number;
  promotionalPrice: number | null;

  priceText: string;
  originalPriceText?: string;

  stock: number;

  images: string[];
  videoUrl?: string | null;

  partner: {
    id: string;
    name: string;
    subtitle: string;
    avatarUrl: string;
    description: string;
  };
}

const DEFAULT_PARTNER_AVATAR =
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=240&q=80";

const formatVnd = (value: number) =>
  `${new Intl.NumberFormat("vi-VN").format(Math.round(value))}₫`;

const mapDtoToVm = (
  p: PublishedMarketplaceProductDto,
  partner: LocalPartnerDto | undefined,
): MarketplaceProductDetailVM => {
  // Images: mainImage + landImages (số lượng tùy biến)
  const main = p.media?.mainImage ?? null;
  const lands = p.media?.landImages ?? null;

  const images: string[] = [main, ...(lands ?? [])].filter((x): x is string =>
    Boolean(x),
  );

  const kind = p.productType === 2 ? "tour" : "product";

  const finalPrice = p.promotionalPrice ?? p.price;
  const originalPriceText =
    p.promotionalPrice != null ? formatVnd(p.price) : undefined;

  const partnerName = partner?.businessName?.trim() || "Local Partner";

  const partnerAvatar = (partner?.avatarUrl ?? "").trim();
  const safePartnerAvatar = partnerAvatar || DEFAULT_PARTNER_AVATAR;

  const roleText =
    Array.isArray(partner?.roles) && partner.roles.length > 0
      ? partner.roles.join(", ")
      : "Local Partner";

  const certText = partner?.isAuthenticCertified ? "Authentic certified" : "";
  const typeText =
    partner?.partnerType === 1 ? "Specialties & Tours" : "Tour Provider";

  const subtitle = [roleText, certText, typeText].filter(Boolean).join(" · ");

  return {
    id: p.id,
    kind,
    categoryName: p.categoryName ?? "",
    title: p.name ?? "",
    description: p.description ?? "",
    location: p.provinceName ?? "",

    productType: p.productType,

    price: p.price,
    promotionalPrice: p.promotionalPrice,

    priceText: formatVnd(finalPrice),
    originalPriceText,

    stock: p.stock ?? 0,

    images,
    videoUrl: p.media?.videoUrl ?? null,
    partner: {
      id: partner?.id ?? p.partnerId ?? "",
      name: partnerName,
      subtitle,
      avatarUrl: safePartnerAvatar,
      description: partner?.description ?? "",
    },
  };
};

export const useMarketplaceProductDetail = (productId?: string) => {
  return useQuery<MarketplaceProductDetailVM>({
    queryKey: ["marketplace-product-detail", productId],
    enabled: Boolean(productId),
    queryFn: async () => {
      const dto = await marketplaceApi.getMarketplaceProductById(productId!);
      
      let partner: LocalPartnerDto | undefined;
      try {
        if (dto.partnerId) {
            partner = await marketplaceApi.getLocalPartnerById(dto.partnerId);
        }
      } catch {

      }
      return mapDtoToVm(dto, partner);
    },
  });
};
