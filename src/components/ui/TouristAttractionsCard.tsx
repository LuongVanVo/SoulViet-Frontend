import { Heart } from 'lucide-react';
import { VibeTag } from './VibeTag';
import type { TouristAttractionCardItem, VibeTag as VibeTagType } from '@/types';

interface TouristAttractionsCardProps {
  item: TouristAttractionCardItem;
  tagInfo?: VibeTagType;
}

export const TouristAttractionsCard = ({ item, tagInfo }: TouristAttractionsCardProps) => {
  return (
    <div className="group rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex flex-col w-full min-w-0">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-2xl">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute left-3 top-3">
          {tagInfo && <VibeTag tag={tagInfo} variant="solid" />}
        </div>
        <div className="group/like absolute right-3 top-3">
          <button className="flex items-center space-x-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm backdrop-blur-sm transition-transform hover:scale-105">
            <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500 transition-colors" />
            <span>{item.likes}</span>
          </button>
        </div>
      </div>
      <div className="px-3 py-2 text-center flex-1 flex flex-col justify-center">
        <h3 className="mb-1 line-clamp-1 text-base font-semibold text-primary transition-colors group-hover:text-tertiary">{item.name}</h3>
        <p className="line-clamp-2 text-xs leading-relaxed text-gray-500">{item.address}</p>
      </div>
    </div>
  );
};