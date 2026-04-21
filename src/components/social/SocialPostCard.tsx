import type { ReactNode } from 'react';
import { Coins } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { PostCardProps } from '@/types';
import { SocialPostActions } from './SocialPostActions';
import { SocialPostHeader } from './SocialPostHeader';

export interface SocialPostCardProps extends PostCardProps {
	footer?: ReactNode;
	onEditPost?: (postId: string) => void;
	onDeletePost?: (postId: string) => void;
}

export const SocialPostCard = ({ post, footer, onEditPost, onDeletePost }: SocialPostCardProps) => {
	const { t } = useTranslation();
	const thumbnail = post.images?.[0] || post.image || 'https://via.placeholder.com/400?text=No+Image+Found';

	return (
		<article className="overflow-hidden rounded-3xl border border-[#ECEEF1] bg-white shadow-[0_10px_25px_-18px_rgba(15,23,42,0.45)]">
			<SocialPostHeader
				avatar={post.avatar}
				author={post.author}
				timeAgo={post.timeAgo}
				location={post.location}
				vibe={post.vibe}
				postId={post.id}
				onEdit={onEditPost}
				onDelete={onDeletePost}
			/>

			<img src={thumbnail} alt={post.author} className="h-64 w-full object-cover" />

			<div className="space-y-3 px-4 py-4">
				<p className="text-[15px] leading-6 text-[#334155]">{post.caption}</p>
			</div>

			<SocialPostActions likes={post.likes} comments={post.comments} />

			<div className="px-4 pb-4">
				<div className="flex items-center gap-2 rounded-full border border-[#E9D57A] bg-[#FFFBE6] px-3 py-2 text-sm text-[#4B5563]">
					<Coins className="h-4 w-4 text-[#F3C700]" />
					<span>
						{t('social.feed.post.rewardPrefix')}{' '}
						<strong>{post.rewardCoins} SoulCoins</strong>{' '}
						{t('social.feed.post.rewardSuffix')}
					</span>
				</div>

				{footer ? <div className="pt-3">{footer}</div> : null}
			</div>
		</article>
	);
};