import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { ConfirmationDialog, PostFeedList } from '@/components';
import { useMyPostActions, useUserSocialPosts, useSocialPostActions } from '@/hooks';
import { useAuthStore, type AuthState } from '@/store';
import type { SocialPost } from '@/types';
import { EditPostModal } from './EditPostModal';

interface MyPostsSectionProps {
	userId: string;
}

export const MyPostsSection = ({ userId }: MyPostsSectionProps) => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const location = useLocation();
	const loadMoreRef = useRef<HTMLDivElement | null>(null);
	const [editingPostId, setEditingPostId] = useState<string | null>(null);
	const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
	const {
		posts,
		isLoading,
		isError,
		hasNextPage,
		isFetchingNextPage,
		fetchNextPage,
	} = useUserSocialPosts(userId);
	const { updateMyPost, deleteMyPost, isUpdating, isDeleting } = useMyPostActions(userId);
	const { likePost, isLiking: isLikingPost } = useSocialPostActions();
	const isLoggedIn = useAuthStore((state: AuthState) => state.isLoggedIn);

	const editingPost = useMemo<SocialPost | null>(
		() => posts.find((item) => item.id === editingPostId) ?? null,
		[editingPostId, posts]
	);

	const handleEditPost = (postId: string) => {
		if (isUpdating || isDeleting) {
			return;
		}

		setEditingPostId(postId);
	};

	const handleDeletePost = (postId: string) => {
		if (isUpdating || isDeleting) {
			return;
		}

		setDeletingPostId(postId);
	};

	const handleSubmitEdit = async (postId: string, payload: Parameters<typeof updateMyPost>[1]) => {
		await updateMyPost(postId, payload);
	};

	const handleConfirmDelete = async () => {
		if (!deletingPostId) {
			return;
		}

		await deleteMyPost(deletingPostId);
		setDeletingPostId(null);
	};
	const handleLikePost = async (postId: string) => {
		try {
			await likePost(postId);
		} catch (error) {
			console.error('Failed to like post:', error);
		}
	};

	useEffect(() => {
		const target = loadMoreRef.current;
		if (!target || !hasNextPage || isFetchingNextPage) {
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) {
					void fetchNextPage();
				}
			},
			{ rootMargin: '240px 0px' }
		);

		observer.observe(target);

		return () => {
			observer.disconnect();
		};
	}, [fetchNextPage, hasNextPage, isFetchingNextPage]);

	if (isError) {
		return (
			<div className="rounded-3xl border border-dashed border-[#FBCACA] px-4 py-10 text-center text-sm text-[#B42318]">
				{t('profile.user.posts.error', { defaultValue: 'Khong the tai bai dang. Vui long thu lai.' })}
			</div>
		);
	}

	return (
		<>
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
						onEditPost={handleEditPost}
						onDeletePost={handleDeletePost}
						onLikePost={handleLikePost}
						isLiking={isLikingPost}
					/>
				)}

				{hasNextPage ? <div ref={loadMoreRef} className="h-2" aria-hidden="true" /> : null}

				{isFetchingNextPage ? (
					<div className="rounded-2xl border border-dashed border-[#D8DEE6] px-4 py-4 text-center text-sm text-[#6B7280]">
						{t('profile.user.posts.loading')}
					</div>
				) : null}
			</div>

			<EditPostModal
				isOpen={Boolean(editingPost)}
				post={editingPost}
				isSubmitting={isUpdating}
				onClose={() => setEditingPostId(null)}
				onSubmit={handleSubmitEdit}
			/>

			<ConfirmationDialog
				isOpen={Boolean(deletingPostId)}
				title={t('profile.user.posts.deleteDialog.title')}
				message={t('profile.user.posts.deleteDialog.message')}
				cancelLabel={t('profile.user.posts.deleteDialog.cancel')}
				confirmLabel={t('profile.user.posts.deleteDialog.confirm')}
				loadingLabel={t('profile.user.posts.deleteDialog.deleting')}
				isLoading={isDeleting}
				onCancel={() => setDeletingPostId(null)}
				onConfirm={() => void handleConfirmDelete()}
			/>
		</>
	);
};
