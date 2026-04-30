import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { PostActionProps } from '@/types';

export const SocialPostActions = ({ likes, comments, shares, postId, onLike, isLiking, isLiked, onComment, onShare }: PostActionProps & { onComment?: () => void; onShare?: () => void }) => {
	const { t } = useTranslation();
	const likeButtonClass = isLiked
		? 'text-[#DC2626] hover:bg-[#FEF2F2]'
		: 'text-[#334155] hover:bg-[#F8FAFC]';

	return (
		<>
			{(likes > 0 || comments > 0 || shares > 0) && (
				<div className="flex items-center justify-between px-4 py-3 text-sm text-[#64748B]">
					<div>
						{likes > 0 && (
							<p>
								{likes} {t('social.feed.post.likes')}
							</p>
						)}
					</div>
					<div className="flex gap-4">
						{comments > 0 && (
							<p>
								{comments} {t('social.feed.post.comments')}
							</p>
						)}
						{shares > 0 && (
							<p>
								{shares} {t('social.feed.post.shares')}
							</p>
						)}
					</div>
				</div>
			)}

			<div className="grid grid-cols-3 border-t border-[#E5E7EB] px-2 py-2">
				<button
					type="button"
					onClick={() => {
						if (postId && onLike && !isLiking) {
							onLike(postId);
						}
					}}
					disabled={!onLike || isLiking}
					className={`inline-flex items-center justify-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${likeButtonClass}`}
				>
					<Heart className="h-4 w-4" fill={isLiked ? 'currentColor' : 'none'} />
					{t('social.feed.post.actions.like')}
				</button>
				<button 
					type="button" 
					onClick={onComment}
					className="inline-flex items-center justify-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-[#334155] hover:bg-[#F8FAFC]"
				>
					<MessageCircle className="h-4 w-4 text-[#2563EB]" />
					{t('social.feed.post.actions.comment')}
				</button>
				<button 
					type="button" 
					onClick={onShare}
					className="inline-flex items-center justify-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-[#334155] hover:bg-[#F8FAFC]"
				>
					<Share2 className="h-4 w-4 text-[#15803D]" />
					{t('social.feed.post.actions.share')}
				</button>
			</div>
		</>
	);
};