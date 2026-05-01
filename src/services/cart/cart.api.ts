import { apiClient } from "@/services";
import type { AddToCartRequest, CartDto, RemoveCartItemRequest, UpdateCartItemRequest } from "@/types";

export const cartApi = {
    async addToCart(payload: AddToCartRequest): Promise<CartDto> {
        const res = await apiClient.post('/cart', payload);
        return res.data as CartDto;
    },

    async getMyCart(): Promise<CartDto> {
        const res = await apiClient.get('/cart');
        return res.data as CartDto;
    },

    async updateCartItemQuantity(itemId: string, payload: UpdateCartItemRequest): Promise<CartDto> {
        const res = await apiClient.patch(`/cart/items/${itemId}`, payload);
        return res.data as CartDto;
    },

    async removeCartItems(payload: RemoveCartItemRequest): Promise<CartDto> {
        const res = await apiClient.delete('/cart/items', { data: payload });
        return res.data as CartDto;
    },

    async clearCart(): Promise<void> {
        await apiClient.delete('/cart/clear');
    },
}