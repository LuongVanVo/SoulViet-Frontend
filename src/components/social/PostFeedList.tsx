import type { ReactNode } from 'react';
import type { SocialPost } from '@/types';
import { SocialPostCard } from './SocialPostCard';

interface PostFeedListProps {
	posts: SocialPost[];
	emptyState?: ReactNode;
	renderFooter?: (post: SocialPost) => ReactNode;
}

export const PostFeedList = ({ posts, emptyState = null, renderFooter }: PostFeedListProps) => {
	if (posts.length === 0) {
		return emptyState ? <>{emptyState}</> : null;
	}

	return (
		<div className="space-y-4">
			{posts.map((post) => (
				<SocialPostCard key={post.id} post={post} footer={renderFooter?.(post)} />
			))}
		</div>
	);
};