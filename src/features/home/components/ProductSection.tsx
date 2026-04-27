import { useHomeData } from '@/hooks/useHomeData';
import { Skeleton } from '@/components/ui';
import { ProductCard } from '@/features/home/components/ProductCard';

interface ProductSectionProps {
  heading: string;
  subheading: string;
}

export const ProductSection = ({ heading, subheading }: ProductSectionProps) => {
  const { data, isLoading } = useHomeData();

  return (
    <section className="space-y-8 pt-10 md:pt-14">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-gray-950 md:text-4xl">{heading}</h2>
        <p className="max-w-2xl text-base leading-7 text-gray-600">{subheading}</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
                <Skeleton className="aspect-[4/3] w-full rounded-none" />
                <div className="space-y-3 p-5">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </div>
            ))
          : data?.products.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </section>
  );
};