import heroImage from '@/assets/hero.png';
import { useTranslation } from 'react-i18next';
import type { SocialPost } from '@/types';
import { PostCard } from './PostCard';

export const PostFeedList = () => {
	const { t } = useTranslation();

	const socialPosts: SocialPost[] = [
		{
			id: 'post-1',
			author: t('social.feed.mockPost.author'),
			avatar: 'User',
			timeAgo: t('social.feed.mockPost.timeAgo'),
			location: t('social.feed.mockPost.location'),
			vibe: 'social.feed.post.vibes.calm',
			image: heroImage,
			caption: t('social.feed.mockPost.caption'),
			likes: 234,
			comments: 18,
			rewardCoins: 25,
		},
	];

	return (
		<div className="space-y-4">
			{socialPosts.map((post) => (
				<PostCard key={post.id} post={post} />
			))}
		</div>
	);
};
