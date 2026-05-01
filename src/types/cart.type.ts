export interface AddToCartRequest {
    marketplaceProductId: string
    quantity: number
    variantId?: string | null
    itemMetadata?: string | null
}

export interface CartItemDto {
    id: string;
    marketplaceProductId: string;
    variantId: string | null;
    variantAttributesJson: string | null;
    productName: string;
    mainImage: string | null;
    price: number;
    promotionalPrice: number | null;
    stock: number;
    partnerId: string;
    quantity: number;
    itemMetadata: string | null;
    subTotal: number;
}

export interface CartDto {
    id: string;
    userId: string;
    items: CartItemDto[];
    grandTotal: number;
}

export interface UpdateCartItemRequest {
    cartItemId: string;
    newQuantity: number;
    itemMetadata?: string | null;
}

export interface RemoveCartItemRequest {
    cartItemIds: string[];
}