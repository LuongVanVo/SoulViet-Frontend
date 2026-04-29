import { useParams } from "react-router-dom";
import { MarketplaceProductDetailFeature } from "@/features/marketPlace/components/MarketplaceProductDetailFeature";

export const MarketplaceProductDetailPage = () => {
  const { productId } = useParams<{ productId: string }>();

  if (!productId) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        Invalid product id
      </div>
    );
  }

  return <MarketplaceProductDetailFeature productId={productId} />;
};
