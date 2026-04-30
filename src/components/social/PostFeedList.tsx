import type { ReactNode } from 'react';
import type { SocialPost } from '@/types';
import { SocialPostCard } from './SocialPostCard';
import { SharedPostCard } from './SharedPostCard';

interface PostFeedListProps {
	posts: SocialPost[];
	emptyState?: ReactNode;
	renderFooter?: (post: SocialPost) => ReactNode;
	onEditPost?: (postId: string) => void;
	onDeletePost?: (postId: string) => void;
	onLikePost?: (postId: string) => void;
	isLiking?: boolean;
}

export const PostFeedList = ({
	posts,
	emptyState = null,
	renderFooter,
	onEditPost,
	onDeletePost,
	onLikePost,
	isLiking,
}: PostFeedListProps) => {
	if (posts.length === 0) {
		return emptyState ? <>{emptyState}</> : null;
	}

	return (
		<div className="space-y-4">
			{posts.map((post) => {
				if (post.type === 'shared-post' && post.originalPost && post.sharedByUser) {
					return (
						<SharedPostCard
							key={post.id}
							sharePost={post}
							post={post.originalPost}
							footer={renderFooter?.(post)}
							onEditPost={onEditPost}
							onDeletePost={onDeletePost}
							onLikePost={onLikePost}
							isLiking={isLiking}
						/>
					);
				}

				return (
					<SocialPostCard
						key={post.id}
						post={post}
						footer={renderFooter?.(post)}
						onEditPost={onEditPost}
						onDeletePost={onDeletePost}
						onLikePost={onLikePost}
						isLiking={isLiking}
					/>
				);
			})}
		</div>
	);
};