import { marketplaceApi } from "@/services";
import type { CartItemDto } from "@/types";
import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";

export function useRequiresPhysicalShipping(items: CartItemDto[], enabled: boolean) {
    const productIds = useMemo(
        () => [...new Set(items.map((i) => i.marketplaceProductId))],
        [items]
    )

    const results = useQueries({
        queries: productIds.map((id) => ({
            queryKey: ['marketplace-product-type', id] as const,
            queryFn: () => marketplaceApi.getMarketplaceProductById(id),
            enabled: enabled && productIds.length > 0,
            staleTime: 60_000,
        })),
    })

    const isLoading = results.some((r) => r.isLoading);
    const needsShipping = useMemo(() => {
        if (!enabled || productIds.length === 0) return false;
        if (results.some((r) => r.isLoading || r.isError)) return false;
        return results.some((r) => r.data?.productType === 1);
    }, [enabled, productIds.length, results]);

    return { needsShipping, isLoading }
}
