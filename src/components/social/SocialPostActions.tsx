import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { PostActionProps } from '@/types';

export const SocialPostActions = ({ likes, comments }: PostActionProps) => {
	const { t } = useTranslation();

	return (
		<>
			<div className="flex items-center justify-between px-4 py-3 text-sm text-[#64748B]">
				<p>
					{likes} {t('social.feed.post.likes')}
				</p>
				<p>
					{comments} {t('social.feed.post.comments')}
				</p>
			</div>

			<div className="grid grid-cols-3 border-t border-[#E5E7EB] px-2 py-2">
				<button type="button" className="inline-flex items-center justify-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-[#334155] hover:bg-[#F8FAFC]">
					<Heart className="h-4 w-4 text-[#EF4444]" />
					{t('social.feed.post.actions.like')}
				</button>
				<button type="button" className="inline-flex items-center justify-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-[#334155] hover:bg-[#F8FAFC]">
					<MessageCircle className="h-4 w-4 text-[#2563EB]" />
					{t('social.feed.post.actions.comment')}
				</button>
				<button type="button" className="inline-flex items-center justify-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-[#334155] hover:bg-[#F8FAFC]">
					<Share2 className="h-4 w-4 text-[#15803D]" />
					{t('social.feed.post.actions.share')}
				</button>
			</div>
		</>
	);
};