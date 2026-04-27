import { useHomeData } from '@/hooks/useHomeData';
import { Skeleton } from '@/components/ui';
import { StoryCard } from '@/features/home/components/StoryCard';
import { cn } from '@/utils/cn';

interface StoriesSectionProps {
  heading: string;
  subheading: string;
}

export const StoriesSection = ({ heading, subheading }: StoriesSectionProps) => {
  const { data, isLoading } = useHomeData();

  return (
    <section className="space-y-8 pt-10 md:pt-14 pb-20">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-950 md:text-4xl">{heading}</h2>
        <p className="mx-auto max-w-2xl text-base leading-7 text-gray-600">{subheading}</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => (
              <div 
                key={index} 
                className={cn(
                  "overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm",
                  index === 1 && "md:mt-12"
                )}
              >
                <Skeleton className="aspect-[4/3] w-full rounded-none" />
                <div className="space-y-3 p-5">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </div>
            ))
          : data?.stories.map((story, index) => (
              <div 
                key={story.id}
                className={cn(index === 1 && "md:mt-12")}
              >
                <StoryCard story={story} />
              </div>
            ))}
      </div>
    </section>
  );
};