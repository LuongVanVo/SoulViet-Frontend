export type MarketplaceItemKind = 'product' | 'service' | 'tour';
export type PriceTier = 'free' | 'premium' | 'exclusive' | 'custom';

export interface MarketplaceCategory {
    id: string;
    label: string;
}

export interface MarketplaceItem {
    id: string;
    kind: MarketplaceItemKind;
    badgeLabel: string;
    title: string;
    description: string;
    priceText: string;
    originalPriceText?: string;
    priceValue?: number;

    location: string;
    imageUrl: string;
    likes: number;
    featured?: boolean;
    categoryId?: string;
}