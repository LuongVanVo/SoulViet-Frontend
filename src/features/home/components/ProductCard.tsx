import { ShoppingBag, MapPin } from 'lucide-react';
import type { HomeProduct } from '@/types/home';
import { Badge, Button, Card } from '@/components/ui';

interface ProductCardProps {
  product: HomeProduct;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Card className="group overflow-hidden border-gray-100 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        <div className="absolute left-4 top-4">
          <Badge className="bg-white/90 text-gray-900">{product.tag}</Badge>
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 text-white">
          <div>
            <p className="text-sm font-medium text-white/80">{product.location}</p>
            <h3 className="text-2xl font-bold leading-tight text-white">{product.title}</h3>
          </div>
          <p className="text-lg font-semibold">{product.price}</p>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <p className="text-sm leading-6 text-gray-600">{product.description}</p>
        <div className="flex items-center justify-between gap-3">
          <Button variant="outline" className="px-4 py-2 text-sm">
            <ShoppingBag className="h-4 w-4" />
            {product.ctaLabel}
          </Button>
          <div className="flex items-center gap-1 text-xs font-medium text-gray-400">
            <MapPin className="h-4 w-4" />
            {product.location}
          </div>
        </div>
      </div>
    </Card>
  );
};