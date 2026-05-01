import { cartApi } from "@/services";
import type { AddToCartRequest, RemoveCartItemRequest, UpdateCartItemRequest } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { MY_CART_QUERY_KEY } from "./useMyCart";

export const useAddToCart = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: AddToCartRequest) => cartApi.addToCart(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: MY_CART_QUERY_KEY })
        },
    });
}

export const useUpdateCartItemQuantity = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ itemId, payload }: { itemId: string, payload: UpdateCartItemRequest }) => 
            cartApi.updateCartItemQuantity(itemId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: MY_CART_QUERY_KEY })
        },
    });
}

export const useRemoveCartItems = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: RemoveCartItemRequest) => cartApi.removeCartItems(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: MY_CART_QUERY_KEY })
        }
    })
}