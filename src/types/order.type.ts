export const PaymentMethod = {
    Cod: 1,
    VnPay: 2,
    SoulCoin: 3,
} as const;

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export interface PreviewOrderQuery {
    userId?: string;
    selectedCartItemIds: string[] | null;
    platformVoucherCode?: string | null;
    shopVoucherCodes?: Record<string, string> | null;
    useSoulCoin?: boolean;
    soulCoinAmountToUse: number;
}

export interface CreateOrderPayload {
    userId?: string;
    receiverName?: string | null;
    receiverPhone?: string | null;
    receiverEmail?: string | null;
    shippingAddress?: string | null;
    orderNotes?: string | null;
    selectedCartItemIds?: string[] | null;
    platformVoucherCode?: string | null;
    shopVoucherCodes?: Record<string, string> | null;
    useSoulCoin: boolean;
    soulCoinAmountToUse: number;
    paymentMethod: PaymentMethod;
}

export interface PreviewOrderItem {
    cartItemId: string;
    productId: string;
    variantId: string | null;
    variantAttributesJson: string | null;
    productName: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
}

export interface PreviewVendorOrder {
    partnerId: string;
    items: PreviewOrderItem[];
    subTotal: number;
    shippingFee: number;
    shopVoucherCode: string | null;
    shopDiscountAmount: number;
    totalAmount: number;
}

export interface PreviewOrderResponse {
    vendorOrders: PreviewVendorOrder[];
    totalItemsPrice: number;
    totalShippingFee: number;
    platformVoucherCode: string | null;
    platformDiscountAmount: number;
    grandTotal: number;
    soulCoinUsed: number;
    finalPayableAmount: number;
}

export interface CreateOrderResponse {
    success: boolean;
    message: string;
    masterOrderId: string;
    grandTotal: number;
    paymentUrl: string | null;
    soulCoinUsed: boolean;
    soulCoinAmount: number;
    finalPayableAmount: number;
}

export type CheckoutNavigateState = {
    selectedCartItemIds: string[];
}