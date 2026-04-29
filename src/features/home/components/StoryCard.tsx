import { MessageCircle, Heart } from 'lucide-react';
import type { HomeStory } from '@/types/home';
import { Card } from '@/components/ui';

interface StoryCardProps {
  story: HomeStory;
}

export const StoryCard = ({ story }: StoryCardProps) => {
  return (
    <Card className="overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="aspect-[4/3] overflow-hidden">
        <img src={story.imageUrl} alt={story.content} className="h-full w-full object-cover" loading="lazy" />
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-center gap-3">
          <img src={story.avatarUrl} alt={story.authorName} className="h-11 w-11 rounded-full object-cover" loading="lazy" />
          <div>
            <p className="text-sm font-semibold text-gray-900">{story.authorName}</p>
            <p className="text-xs text-gray-500">{story.authorLocation}</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm leading-6 text-gray-600 break-words whitespace-pre-wrap">{story.content}</p>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="inline-flex items-center gap-1.5">
            <Heart className="h-4 w-4 text-brand" />
            {story.likes}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MessageCircle className="h-4 w-4 text-brand" />
            {story.comments}
          </span>
        </div>
      </div>
    </Card>
  );
};