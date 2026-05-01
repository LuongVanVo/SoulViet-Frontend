import { cartApi } from "@/services";
import type { CartDto } from "@/types"
import { useQuery } from "@tanstack/react-query"

export const MY_CART_QUERY_KEY = ['my-cart'] as const;

export const useMyCart = (enabled = true) => {
    return useQuery<CartDto>({
        queryKey: MY_CART_QUERY_KEY,
        queryFn: () => cartApi.getMyCart(),
        enabled,
        staleTime: 1000 * 15, 
    });
}