import { apiClient } from '@/services'
import type {
  CreateOrderPayload,
  CreateOrderResponse,
  PreviewOrderQuery,
  PreviewOrderItem,
  PreviewOrderResponse,
  PreviewVendorOrder,
} from '@/types'

const pick = <T>(a: T | undefined, b: T | undefined): T | undefined => a ?? b

function num(v: unknown, fallback = 0): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

function str(v: unknown): string | null {
  if (v == null) return null
  const s = String(v)
  return s.length ? s : null
}

function mapPreviewItem(raw: Record<string, unknown>): PreviewOrderItem {
  const cartItemId = String(pick(raw.cartItemId, raw.CartItemId) ?? '')
  const unitPrice = num(pick(raw.unitPrice, raw.UnitPrice), 0)
  const quantity = Math.round(num(pick(raw.quantity, raw.Quantity), 0))
  const totalFromApi = pick(raw.totalPrice, raw.TotalPrice)
  return {
    cartItemId,
    productId: String(pick(raw.productId, raw.ProductId) ?? ''),
    variantId: str(pick(raw.variantId, raw.VariantId)),
    variantAttributesJson: str(pick(raw.variantAttributesJson, raw.VariantAttributesJson)),
    productName: String(pick(raw.productName, raw.ProductName) ?? ''),
    unitPrice,
    quantity,
    totalPrice: num(totalFromApi, unitPrice * quantity),
  }
}

function mapVendorOrder(raw: Record<string, unknown>): PreviewVendorOrder {
  const itemsRaw = (pick(raw.items, raw.Items) as unknown[]) ?? []
  return {
    partnerId: String(pick(raw.partnerId, raw.PartnerId) ?? ''),
    items: itemsRaw.map((x) => mapPreviewItem(x as Record<string, unknown>)),
    subTotal: num(pick(raw.subTotal, raw.SubTotal), 0),
    shippingFee: num(pick(raw.shippingFee, raw.ShippingFee), 0),
    shopVoucherCode: str(pick(raw.shopVoucherCode, raw.ShopVoucherCode)),
    shopDiscountAmount: num(pick(raw.shopDiscountAmount, raw.ShopDiscountAmount), 0),
    totalAmount: num(pick(raw.totalAmount, raw.TotalAmount), 0),
  }
}

export function parsePreviewOrderResponse(data: unknown): PreviewOrderResponse {
  const r = data as Record<string, unknown>
  const vendorsRaw = (pick(r.vendorOrders, r.VendorOrders) as unknown[]) ?? []
  return {
    vendorOrders: vendorsRaw.map((x) => mapVendorOrder(x as Record<string, unknown>)),
    totalItemsPrice: num(pick(r.totalItemsPrice, r.TotalItemsPrice), 0),
    totalShippingFee: num(pick(r.totalShippingFee, r.TotalShippingFee), 0),
    platformVoucherCode: str(pick(r.platformVoucherCode, r.PlatformVoucherCode)),
    platformDiscountAmount: num(pick(r.platformDiscountAmount, r.PlatformDiscountAmount), 0),
    grandTotal: num(pick(r.grandTotal, r.GrandTotal), 0),
    soulCoinUsed: num(pick(r.soulCoinUsed, r.SoulCoinUsed), 0),
    finalPayableAmount: num(pick(r.finalPayableAmount, r.FinalPayableAmount), 0),
  }
}

function mapCreateOrderResponse(data: unknown): CreateOrderResponse {
  const r = data as Record<string, unknown>
  return {
    success: Boolean(pick(r.success, r.Success) ?? false),
    message: String(pick(r.message, r.Message) ?? ''),
    masterOrderId: String(pick(r.masterOrderId, r.MasterOrderId) ?? ''),
    grandTotal: num(pick(r.grandTotal, r.GrandTotal), 0),
    paymentUrl: str(pick(r.paymentUrl, r.PaymentUrl)),
    soulCoinUsed: Boolean(pick(r.soulCoinUsed, r.SoulCoinUsed) ?? false),
    soulCoinAmount: num(pick(r.soulCoinAmount, r.SoulCoinAmount), 0),
    finalPayableAmount: num(pick(r.finalPayableAmount, r.FinalPayableAmount), 0),
  }
}

export const orderApi = {
  async previewOrder(body: PreviewOrderQuery): Promise<PreviewOrderResponse> {
    const res = await apiClient.post('/marketplace/order/preview', body)
    return parsePreviewOrderResponse(res.data)
  },

  async createOrder(body: CreateOrderPayload): Promise<CreateOrderResponse> {
    const res = await apiClient.post('/marketplace/order', body)
    return mapCreateOrderResponse(res.data)
  },
}