import type { ReactNode } from 'react';
import type { SocialPost } from '@/types';
import { SocialPostCard } from './SocialPostCard';

interface PostFeedListProps {
	posts: SocialPost[];
	emptyState?: ReactNode;
	renderFooter?: (post: SocialPost) => ReactNode;
	onEditPost?: (postId: string) => void;
	onDeletePost?: (postId: string) => void;
}

export const PostFeedList = ({
	posts,
	emptyState = null,
	renderFooter,
	onEditPost,
	onDeletePost,
}: PostFeedListProps) => {
	if (posts.length === 0) {
		return emptyState ? <>{emptyState}</> : null;
	}

	return (
		<div className="space-y-4">
			{posts.map((post) => (
				<SocialPostCard
					key={post.id}
					post={post}
					footer={renderFooter?.(post)}
					onEditPost={onEditPost}
					onDeletePost={onDeletePost}
				/>
			))}
		</div>
	);
};