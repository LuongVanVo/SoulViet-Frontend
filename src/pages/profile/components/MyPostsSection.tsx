import { Edit3, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PostFeedList } from '@/components';
import { useUserSocialPosts } from '@/hooks';
import type { SocialPost } from '@/types';

interface MyPostsSectionProps {
	userId: string;
}

const PostManagementActions = ({ post }: { post: SocialPost }) => {
	const { t } = useTranslation();

	return (
		<div className="grid grid-cols-2 gap-2 border-t border-[#E5E7EB] px-4 pb-4 pt-3">
			<button
				type="button"
				data-post-id={post.id}
				className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D5DDEA] px-3 py-2 text-sm font-semibold text-[#334155] transition-colors hover:bg-[#F8FAFC]"
			>
				<Edit3 className="h-4 w-4" />
				{t('profile.user.posts.actions.edit')}
			</button>
			<button
				type="button"
				data-post-id={post.id}
				className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#FBCACA] px-3 py-2 text-sm font-semibold text-[#DC2626] transition-colors hover:bg-[#FEF2F2]"
			>
				<Trash2 className="h-4 w-4" />
				{t('profile.user.posts.actions.delete')}
			</button>
		</div>
	);
};

export const MyPostsSection = ({ userId }: MyPostsSectionProps) => {
	const { t } = useTranslation();
	const { data: posts = [], isLoading } = useUserSocialPosts(userId);

	return (
		<div className="space-y-4">
			{isLoading ? (
				<div className="rounded-3xl border border-dashed border-[#D8DEE6] px-4 py-10 text-center text-sm text-[#6B7280]">
					{t('profile.user.posts.loading')}
				</div>
			) : (
				<PostFeedList
					posts={posts}
					emptyState={(
						<div className="rounded-3xl border border-dashed border-[#D8DEE6] px-4 py-10 text-center text-sm text-[#6B7280]">
							{t('profile.user.posts.empty')}
						</div>
					)}
					renderFooter={(post) => <PostManagementActions post={post} />}
				/>
			)}
		</div>
	);
};